export const networkDevice=n=>['switch','firewall','san'].includes(n.type);
export function validIPv4(s){return /^\d{1,3}(\.\d{1,3}){3}$/.test(s)&&s.split('.').every(x=>+x<=255);}
const ipNumber=s=>s.split('.').reduce((a,b)=>(a*256+Number(b))>>>0,0);
export function sameSubnet(a,b,prefix=24){const mask=prefix===0?0:(0xffffffff<<(32-prefix))>>>0;return (ipNumber(a)&mask)===(ipNumber(b)&mask);}
export function portCarries(p,vlan){const c=p.cfg;return !c||c.admin&&(c.mode==='trunk'?c.allowed.includes(vlan):c.access===vlan);}
export function createNetwork({nodes,links,byId,isOffline,refreshFaults}){
 let onChange=()=>{};let submit=null;
 function init(){nodes.forEach((n,i)=>{if(n.net)return;n.net={ip:'10.10.70.'+(i+10),prefix:24,vlan:70,ssh:true,vlans:{1:'DEFAULT',70:'MANAGEMENT'},workload:'running',load:n.type==='gpu'?80:60,os:networkDevice(n)?'Network OS simulator':n.type==='storage'?'Storage OS simulator':'Linux / hypervisor simulator',ports:n.ports.map(p=>({admin:true,mode:'access',access:p.link?.kind==='management'||p.service?70:1,allowed:[1,70]}))};n.ports.forEach((p,i)=>p.cfg=n.net.ports[i]);});}
 init();
 function resolve(value){return byId[String(value).toUpperCase()]||nodes.find(n=>n.net.ip===value);}
 function reachable(from,to,vlan=70){if(!from||!to||isOffline(from)||isOffline(to))return false;const seen=new Set([from.id]),q=[from.id];while(q.length){const id=q.shift();if(id===to.id)return true;const n=byId[id];if(isOffline(n)||!n.net.vlans[vlan])continue;if(n!==from&&!networkDevice(n))continue;for(const l of links){if(l.disabled||l.unplugged||l.pa.medium!=='Ethernet'||l.pb.medium!=='Ethernet'||!portCarries(l.pa,vlan)||!portCarries(l.pb,vlan))continue;const other=l.a===id?l.b:l.b===id?l.a:null;if(other&&!seen.has(other)){seen.add(other);q.push(other);}}}return false;}
 function canAccess(anchor,target){if(!anchor||!target||isOffline(anchor.node)||isOffline(target))return false;if(anchor.mode==='KVM'||anchor.mode==='SERIAL CONSOLE')return anchor.node===target;if(!anchor.port.cfg.admin||!target.net.vlans[target.net.vlan])return false;const vlan=anchor.port.cfg.access;return target.net.vlan===vlan&&sameSubnet(anchor.laptopIP??'10.10.70.250',target.net.ip,anchor.laptopPrefix??24)&&sameSubnet(anchor.laptopIP??'10.10.70.250',target.net.ip,target.net.prefix)&&reachable(anchor.node,target,vlan);}
 function apply(action){const n=byId[action.node];if(!n)return 'Unknown device';const c=n.net;
 if(action.type==='port'){const p=n.ports[action.index];if(!p||p.medium==='Internal')return 'Port unavailable';const v=action.value;if(typeof v.admin==='boolean')p.cfg.admin=v.admin;if(['access','trunk'].includes(v.mode))p.cfg.mode=v.mode;if(Number.isInteger(v.access)&&v.access>0&&v.access<4095)p.cfg.access=v.access;if(Array.isArray(v.allowed)&&v.allowed.length<=128&&v.allowed.every(x=>Number.isInteger(x)&&x>0&&x<4095))p.cfg.allowed=[...new Set(v.allowed)];}
 else if(action.type==='vlan'){if(!Number.isInteger(action.id)||action.id<1||action.id>4094)return 'VLAN must be 1–4094';if(action.remove){if(action.id===1)return 'Default VLAN 1 cannot be deleted';delete c.vlans[action.id];}else c.vlans[action.id]=String(action.name||'VLAN'+action.id).slice(0,32);}
 else if(action.type==='address'){if(!validIPv4(action.ip)||!Number.isInteger(action.prefix)||action.prefix<1||action.prefix>30)return 'Use IPv4/prefix (1–30)';if(nodes.some(x=>x!==n&&x.net.ip===action.ip))return 'Duplicate management IP';if(action.vlan!==undefined&&!c.vlans[action.vlan])return 'Create the management VLAN first';c.ip=action.ip;c.prefix=action.prefix;if(action.vlan!==undefined)c.vlan=action.vlan;}
 else if(action.type==='ssh')c.ssh=!!action.enabled;
 else if(action.type==='workload'){if(!['running','stopped'].includes(action.state))return 'Invalid workload state';c.workload=action.state;}
 else if(action.type==='load'){if(!Number.isInteger(action.value)||action.value<0||action.value>100)return 'Load must be 0–100';c.load=action.value;}
 else return 'Unsupported change';refreshFaults();onChange(action);return 'Applied to '+n.id;
 }
 async function change(action){return submit?submit({type:'config',action}):apply(action);}
 function port(n,name){const alias=/^(?:port|ethernet|eth)\s*(\d+)$/i.exec(name);return alias?n.ports[+alias[1]-1]:n.ports.find(p=>p.name.toLowerCase()===name.toLowerCase());}
 async function command(input,session){const n=session.node,c=n.net,text=input.trim(),lower=text.toLowerCase();
 if(lower==='help')return 'ssh DEVICE-ID | ping DEVICE-ID\nshow system | show interfaces | show vlan | show running-config\nconfigure terminal (or conf t)\ninterface PORT-NAME (or portN)\nshutdown | no shutdown\nswitchport mode access|trunk\nswitchport access vlan 70\nswitchport trunk allowed vlan 1,70\nvlan 350 | name MANAGEMENT | no vlan 350\nip address 10.10.70.20/24\nmanagement vlan 70\nssh enable | ssh disable\nend | exit\nFirewall aliases: config system interface; edit portN; set status up|down; next; end\nShared training syntax, not a vendor CLI. Changes apply immediately.';
 if(lower==='show vlan'||lower==='show vlans')return Object.entries(c.vlans).map(([id,name])=>id.padEnd(6)+name).join('\n');
 if(lower==='show running-config')return JSON.stringify(c,null,2);
 if(['configure terminal','conf t','config system interface'].includes(lower)){if(!networkDevice(n))return 'Network CLI is available on switches, SAN switches and firewalls.';session.config=true;return n.id+'(config)#';}
 if(lower==='end'){session.config=false;session.interface=null;session.vlan=null;return n.id+'#';}
 if(lower==='exit'||lower==='next'){session.interface=null;session.vlan=null;return n.id+(session.config?'(config)#':'#');}
 if(!session.config)return 'Enter configure terminal first. Type help for supported commands.';
 if(!networkDevice(n))return 'This device uses the management dashboard.';
 let m;if(m=/^(?:interface|edit)\s+(.+)$/i.exec(text)){const p=port(n,m[1]);if(!p||p.medium==='Internal')return 'Unknown port. Use show interfaces; portN uses its displayed index.';session.interface=n.ports.indexOf(p);session.vlan=null;return n.id+'(interface '+p.name+')#';}
 if(m=/^(no )?vlan (\d+)$/i.exec(text)){session.interface=null;session.vlan=+m[2];return change({type:'vlan',node:n.id,id:+m[2],remove:!!m[1]});}
 if(m=/^name (.{1,32})$/i.exec(text)){if(session.vlan===null||session.vlan===undefined)return 'Select a VLAN first.';return change({type:'vlan',node:n.id,id:session.vlan,name:m[1]});}
 if(m=/^ip address (\S+)$/i.exec(text)){const [ip,prefix]=m[1].split('/');return change({type:'address',node:n.id,ip,prefix:Number(prefix)});}
 if(m=/^management vlan (\d+)$/i.exec(text))return change({type:'address',node:n.id,ip:c.ip,prefix:c.prefix,vlan:+m[1]});
 if(m=/^ssh (enable|disable)$/i.exec(text))return change({type:'ssh',node:n.id,enabled:m[1].toLowerCase()==='enable'});
 if(session.interface===null||session.interface===undefined)return 'Select interface PORT-NAME first.';
 let value;if(['shutdown','shut','set status down'].includes(lower))value={admin:false};else if(['no shutdown','no shut','set status up'].includes(lower))value={admin:true};else if(m=/^switchport mode (access|trunk)$/.exec(lower))value={mode:m[1]};else if(m=/^(?:switchport access vlan|set vlanid) (\d+)$/.exec(lower)){if(!c.vlans[+m[1]])return 'Create that VLAN first.';value={access:+m[1]};}else if(m=/^switchport trunk allowed vlan ([\d,]+)$/.exec(lower)){const allowed=m[1].split(',').map(Number);if(allowed.some(v=>!c.vlans[v]))return 'Create each VLAN before adding it to a trunk.';value={allowed};}else return 'Unsupported command. Type help.';
 return change({type:'port',node:n.id,index:session.interface,value});
 }
 function snapshot(){return nodes.map(n=>({id:n.id,net:structuredClone(n.net)}));}
 function restore(data){for(const d of data){const n=byId[d.id];if(n){n.net=structuredClone(d.net);n.ports.forEach((p,i)=>p.cfg=n.net.ports[i]??{admin:true,mode:'access',access:70,allowed:[1,70]});}}refreshFaults();}
 function metrics(n){const online=!isOffline(n),running=online&&n.net.workload==='running',load=running?n.net.load:0,phase=n.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0),wave=running?Math.sin(Date.now()/4000+phase)*3:0;return {online,running,cpu:Math.max(0,Math.min(100,load+wave)),memory:running?Math.min(96,24+load*.6):8,iops:Math.round((n.type==='storage'?420000:18000)*load/100),latency:running?(0.2+load/180).toFixed(2):'0.00',throughput:(load*(n.type==='storage'?.22:.04)).toFixed(2),gpu:Math.max(0,Math.min(100,load+wave)),temperature:Math.round(online?32+load*.45:24)};}
 return {resolve,reachable,canAccess,apply,change,command,metrics,snapshot,restore,setSubmit(fn){submit=fn;},setOnChange(fn){onChange=fn;}};
}
