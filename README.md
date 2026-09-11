# Infrastructure co-op lab

## Start a four-player LAN room

1. Extract the entire ZIP into one folder.
2. Install Node.js 22 or newer from https://nodejs.org/ if needed.
3. Open Terminal in that folder and run:

   node lan/server.mjs

4. The host opens the localhost address printed in Terminal. Friends on the same LAN open the printed LAN address, for example http://192.168.1.20:8080/.
5. Each player clicks LAN co-op, enters a name and the printed room code, and clicks Join room. Then choose Gameplay.
6. Maximum four players, including the host. A fifth player is rejected. Click Leave room to free a slot. Inactive/lost clients expire after 30 seconds.
7. Keep the host Terminal running. Ctrl+C stops the room. If the operating system asks, allow Node.js access on your local network. An optional PORT environment variable changes port 8080.

Everyone must use the host's local address, not the GitHub Pages address. No additional npm packages are required. The server supports the source checkout's dist directory and the ZIP's flat website layout.

## What players share

Visible engineer avatars have separate colors and name labels. Movement, crouching, cable unplug/reconnect/patch operations, VLANs, port admin state, management addressing, SSH enable state and synthetic workload settings synchronize through the host server. Laptop attachment and terminal sessions are personal. Other players see your device changes.

The host serializes edits. If two players edit at the same revision, the later request receives the new world and asks the player to retry; it does not silently overwrite the other edit. The room is a trusted local engineering sandbox, not competitive authoritative movement or public internet matchmaking. Do not port-forward it to the internet.

Equipment-failure shortcuts from Inspect are disabled while joined because the shared port/VLAN controls are used for co-op troubleshooting. In Inspect, the shared cable workbench remains available. Gameplay keeps only its HUD, console/management screens and LAN room dialog.

State lasts while the server runs. Reloading/joining fetches its current world. Stopping/restarting the host resets the room. Leave room to continue with a local copy in single player.

## Inspect and Gameplay

Inspect / Gameplay buttons, or M: switch modes. Walking position is remembered.
WASD: walk. Shift: sprint. Hold C: crouch. Q: toggle upper inspection.
0: Hands, for infrastructure cables. 1: Console. 2: LAN cable.
E: interact/connect. X: disconnect laptop. Tab/F: field terminal. Escape: release mouse or close a terminal/room dialog.
If mouse capture is unavailable over LAN HTTP in your browser, drag the scene to look around; WASD remains available.

## Field terminal and reachable devices

At startup the engineer laptop is already cabled to MGMT-SW with 10.10.70.250/24 on VLAN 70. Press Tab in Gameplay and select a device immediately. The fixed cart cable stays connected as you walk around. Connect MGMT-SW restores this laptop connection after manual unplugging or using a console. This does not reset switch configuration: a shut service port or changed VLAN still needs repair. The management switch MGMT-SW is physically cabled to all managed devices. The laptop defaults to 10.10.70.250/24; devices have unique management addresses on VLAN 70.

Choose Target device. Only currently reachable devices can be selected. Switches, firewalls and SAN switches open simulated SSH sessions; compute, storage and GPU devices open OS / Performance dashboards. You can also enter ssh CORE-A or ssh followed by a management IP. Refresh updates the device list.

The OS / Performance view shows synthetic CPU/memory, disk I/O, storage IOPS/latency/throughput, and eight GPU utilization bars where appropriate. Start/Stop workload and Test load controls change the simulation and synchronize in co-op. These are modeled values, not benchmarks or real OS telemetry.

Console (1) uses the orange console port and remains usable when the device's network management path is broken. A serial console or local KVM session accesses its attached device only. Server rack KVM stations let you select a server on that rack.

## Basic switch/firewall commands

This is shared training syntax, not a full Dell OS10 or FortiOS implementation. No commands run on the host computer or real devices.

    help
    show system
    show interfaces
    show vlan
    show running-config
    configure terminal
    interface MGMT UPLINK
    shutdown
    no shutdown
    vlan 350
    name LAB
    interface port1
    switchport mode access
    switchport access vlan 350
    switchport mode trunk
    switchport trunk allowed vlan 1,70,350
    ip address 10.10.70.20/24
    management vlan 70
    ssh enable
    ssh disable
    end

Use displayed port names or portN, where N is the index shown in show interfaces. Create a VLAN before assigning it. `conf t`, `shut`, and `no shut` are accepted. Firewall-style aliases: `config system interface`, `edit portN`, `set status up`, `set status down`, `set vlanid N`, `next`, `end`.

Management IP/prefix, VLAN and SSH enable can also be changed in the dashboard's Management network configuration. Changing the management address or disabling its path can disconnect the current session. Reconnect with console or adjust the laptop address in Laptop network.

## Try together

Player 1 connects LAN to a server and opens SSH to CORE-A. Player 2 connects console to CORE-A. Player 1 shuts CORE-A's MGMT UPLINK and loses network access. Player 2 uses `no shutdown` to recover it. Both players see the same port state; Player 1 refreshes and reconnects.

A second exercise is assigning a management uplink to the wrong VLAN, then recovering it from console. Or have one player vary GPU load while another watches its dashboard.

## Simulation boundaries

Management reachability checks cable presence, endpoint admin state, VLAN membership, allowed VLANs and laptop/device subnet compatibility. It is a simplified VLAN graph, not a protocol emulator: no actual SSH encryption/authentication, ICMP, STP, LACP, routing protocols, firewall policies, VLAN tagging on the wire, FC zoning or vendor OS is implemented. Console service leads and the management switch are training additions to simplified hardware models.

The older Inspect application-path probe remains a physical topology exercise. Use the field terminal for management VLAN/subnet tests. Service sessions are personal and do not reserve a remote laptop port across players.

## GitHub Pages / hosted single player

Upload the top-level website files to your repository root, replacing old files. Include network-sim.js, shared-world.js, multiplayer.js, service-kit.js, lab.js, hardware.js, OrbitControls.js and the existing Three.js modules. The lan folder is only needed for local hosting; GitHub Pages cannot run its server. Wait for Pages deployment, then hard-refresh (Command + Shift + R on Mac).

## Verification

Logic checks covered device reachability, SSH selection, port shutdown, console recovery, VLAN isolation/recovery, SSH enable, invalid configuration handling and GPU workload behavior. Real HTTP/SSE integration checks covered four players, fifth-player rejection, room codes, private session tokens, shared state/poses, edit conflicts, leaving/rejoining and static asset serving. Browser rendering and real multi-computer latency have not been visually verified.

Implementation references: Node HTTP https://nodejs.org/api/http.html and browser event streams https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events . Three.js / OrbitControls license is included as THREE-LICENSE.txt.
