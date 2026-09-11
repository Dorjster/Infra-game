# Infrastructure // Alive — First-person Cable Lab

## Install on your GitHub site
Extract this ZIP. In Dorjster/infra-modern choose Add file > Upload files, upload ALL extracted files to the root, replacing old files, then commit to main. Include lab.js, hardware.js and OrbitControls.js. Keep Pages configured as main / (root). Wait for the Pages workflow to succeed, then open https://dorjster.github.io/infra-modern/ and hard-refresh with Command + Shift + R on Mac.

## Play
Click First person, then click the scene to capture your mouse.
W A S D: walk; mouse: look; Shift: faster; Q/Z: raise/lower inspection height.
Esc: release mouse. Click Overview to return to orbit and zoom controls.
If mouse capture is unavailable, drag to look and use WASD to move.
Aim at a port or cable within reach and press E to unplug. Aim at either original free port and press E again to reconnect the held cable.
E elsewhere opens the workbench. F opens a path test for the device under the crosshair.
Use the device selector to travel directly to hardware. Racks block walking through them; walk around either end to reach rear ports.

## Cable workbench
Select a cable to trace, unplug or reconnect it. Patch a new cable by choosing two free ports on different devices with matching medium and speed. Internal backplanes are excluded. Occupied ports cannot be overwritten. SAN switch-to-switch patches are blocked to preserve fabric isolation.
Probe a device to check Internet reachability and separate SAN controller paths.
The redundancy challenge guides removal of one SERVER-01 network cable while its alternate path stays reachable. Removing both causes an outage; reconnecting restores a path.
Reset cabling restores the original wiring and removes custom cables from service. Existing equipment failure simulations have a separate Restore all control.

## Scope
Changes are session-local and reset on reload. This is a topology/physical-link training simulation, not a network emulator: no VLAN, routing, firewall policy, FC zoning, actual ping, speed negotiation or protocol convergence is modeled. Background telemetry is illustrative. Hardware is simplified Dell/Fortinet-inspired geometry, not manufacturer CAD. Desktop keyboard and mouse recommended; the workbench remains available without pointer lock.

Validated with simulated DOM and real Three.js geometry: startup, camera transitions, dual-link failover/outage/recovery, port occupancy, patch creation, reset and existing fault scenarios. Browser rendering has not been visually tested.

## Hardware references
https://www.dell.com/en-us/shop/ipovw/poweredge-r770
https://www.dell.com/en-us/shop/ipovw/poweredge-xe9680
https://www.fortinet.com/content/dam/fortinet/assets/data-sheets/fortigate-4400f-series.pdf
Three.js and OrbitControls: see THREE-LICENSE.txt.
