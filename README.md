# Infrastructure // Alive — FPS Service Lab

## Update GitHub Pages
Extract this ZIP. Go to Dorjster/infra-modern > Add file > Upload files. Upload ALL extracted files into the repository root, replacing old files, and commit to main. Include service-kit.js, lab.js, hardware.js and OrbitControls.js. Wait for the Pages workflow to finish, then open https://dorjster.github.io/infra-modern/ and press Command + Shift + R on Mac.

## Controls
Click First person, then click the scene for mouse capture. If capture is unavailable, drag to look.
WASD: walk with smooth acceleration. Shift: sprint. Hold C: crouch. Release C: stand.
Q: toggle upper inspection height and return to standing. Z no longer lowers the view.
0: hands (unplug/reconnect infrastructure cables).
1: console cable. 2: LAN cable.
E: interact with the aimed device/port, laptop, or server monitor.
Tab or F: open the laptop. Escape: close laptop/release mouse. X: unplug laptop cable.
Overview: return to orbit/zoom controls.

Standing eye height is scaled to a human relative to the 42U cabinets. Walking speed is approximately doubled from the previous edition; sprinting is faster still. Rack, cart and KVM station collisions stop the camera walking through equipment. Mouse look, crouch height and field of view change smoothly. Reduced-motion preference disables head bob.

## Laptop inspection
A mini laptop on a service cart stands beside the primary racks. A carried laptop is visible when a cable slot is equipped in first-person mode.
Equip 1 and aim at an orange CONSOLE port on a switch, SAN switch or firewall; press E. Equip 2 for a blue SERVICE LAN port. A visible tether connects the laptop to the device. Existing optical/data ports are not interchangeable with the laptop service lead.
A connection opens the laptop with device status. Use commands or the System / Interfaces / SAN paths buttons:
help
show system
show interfaces
show links
show storage
ping CORE-A
clear

X or Unplug laptop disconnects the service lead. Walking beyond the service lead length disconnects it automatically. Offline devices stop responding. Opening the laptop pauses movement.

## Server monitors and keyboards
Compute racks have a shared physical KVM monitor and keyboard station. Aim at it and press E, then choose the server on the KVM selector. This opens the server's local simulated inspection session without a laptop network cable.

## Cable experiments
Select 0 Hands to keep the original E unplug/reconnect interactions. Cable workbench supports tracing existing cables, patching matching free data ports, path tests, and the redundancy challenge. Reset cabling restores the original data cabling; equipment failures use the separate Restore all control. Laptop service cables have their own disconnect action.

## Scope
All sessions and telemetry are simulated and reset on reload. Service ports and KVM stations are training aids, not a verified manufacturer port layout. Console, LAN and KVM sessions are read-only. This does not emulate vendor operating systems, real serial settings, IP addressing, VLANs, routing protocols, firewall policy, FC zoning or actual ping. Graph probes reflect the simulated topology. Hardware geometry is a simplified Dell/Fortinet-inspired recreation, not manufacturer CAD.

Checks used real Three.js geometry with a simulated DOM: existing fault flows, cable patches, occupied-port protection, normal movement speed, crouch/stand, upper inspection toggle, console/LAN sessions, disconnect, offline response and KVM server switching. Browser appearance has not been visually tested.

Three.js / OrbitControls license: THREE-LICENSE.txt.
