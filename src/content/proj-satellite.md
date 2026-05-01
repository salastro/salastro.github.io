---
id: "proj-satellite"
title: "CubeSat Comms"
group: "project"
level: 2
val: 7
date: "2024-08-10"
tags: ["CubeSat", "Communications", "Space"]
concepts: ["orbital-mechanics", "propulsion"]
links:
  - "projects"
  - "orbital-mechanics"
---

Design and implementation of communication protocols and orbital mechanics optimization for a 3-unit CubeSat platform. Focus on developing robust low-power communication algorithms and trajectory optimization for station-keeping.

## Mission Overview

### Objectives

1. **Communications**: Implement reliable command uplink and data downlink
2. **Orbital Operations**: Optimize station-keeping maneuvers for extended mission life
3. **Propulsion**: Demonstrate ionic propulsion for orbital adjustment
4. **Science**: Collect radiation and plasma environment data

### Spacecraft Parameters

- **Mass**: ~4 kg
- **Power**: Solar cells, ~15W average
- **Propulsion**: Ion thruster, 5mN nominal
- **RF**: UHF downlink, S-band uplink

## Technical Challenges

**Power Budget**: Limited solar power requires careful scheduling of comms windows and computation.

**Thermal Management**: Temperature variations in LEO require passive and active thermal control.

**Radiation**: SEE-sensitive components need filtering and redundant architecture.

**Orbital Decay**: Atmospheric drag requires periodic reboost maneuvers.

## Development Phases

1. **Ground Station Network**: Develop/integrate receiving stations worldwide
2. **Component Qualification**: Test electronics in thermal-vacuum chamber
3. **System Integration**: Assembly and functional testing
4. **Pre-Launch Validation**: Final checkout and launch readiness
5. **Mission Operations**: Orbital deployment and data collection

## Expected Outcomes

- Open-source spacecraft software and firmware
- Communications protocol documentation
- Ionization thruster performance characterization
- Radiation environment measurements
