---
id: "orbital-mechanics"
title: "Orbital Mechanics"
group: "focus"
level: 1
val: 10
date: "2024-05-22"
img: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
tags: ["Space", "Dynamics", "Control"]
projects: ["proj-satellite"]
concepts: ["trajectory", "propulsion"]
equations:
  - '\mathbf{r}'' + \frac{\mu}{r^3}\mathbf{r} = \mathbf{a}_p'
  - '\Delta v = v_e \ln\frac{m_0}{m_f}'
links:
  - "root"
  - "trajectory"
  - "propulsion"
---

Analysis of spacecraft trajectories and orbital dynamics. Focus is on low-thrust trajectory optimization for deep space missions and station-keeping strategies.

## Fundamental Equations

The motion of a spacecraft in the gravitational field is governed by the two-body problem, where we balance gravitational acceleration with applied forces from propulsion systems.

### Equations of Motion

The acceleration in the orbital frame is given by:

$$\mathbf{r}'' + \frac{\mu}{r^3}\mathbf{r} = \mathbf{a}_p$$

where $\mu$ is the gravitational parameter, $\mathbf{r}$ is the position vector, and $\mathbf{a}_p$ is the acceleration due to propulsion.

## Propulsion and Delta-V

The Tsiolkovsky rocket equation relates the change in velocity to the fuel consumption:

$$\Delta v = v_e \ln\frac{m_0}{m_f}$$

where $v_e$ is the effective exhaust velocity and $m_0, m_f$ are initial and final masses respectively.

## Trajectory Optimization

Modern spacecraft systems utilize multiple optimization techniques including:
- Indirect methods using calculus of variations
- Direct methods with collocation
- Genetic algorithms for global optimization

## Applications

- Interplanetary transfer orbits
- Low-Earth orbit station-keeping
- Resonant orbit transfers
- Lunar and deep-space missions
