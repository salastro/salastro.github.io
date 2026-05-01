---
id: "hamiltonian"
title: "Hamiltonian Simulation"
group: "concept"
level: 2
val: 5
date: "2024-04-25"
tags: ["Quantum", "Simulation", "Algorithms"]
links:
  - "quantum-systems"
---

Quantum algorithms for simulating evolution of quantum systems under Hamiltonian dynamics. Hamiltonian simulation is a foundational primitive for quantum chemistry, materials science, and lattice gauge theory simulations.

## Problem Statement

Given a Hamiltonian $H$ and time $t$, implement the unitary evolution:

$$U(t) = e^{-iHt}$$

on a quantum computer with accuracy $\epsilon$.

## Classical Difficulty

For sparse Hamiltonians on $n$ qubits, direct classical simulation requires effort exponential in $n$—one of the key motivations for quantum computing.

## Quantum Algorithms

### Product Formula (Trotter-Suzuki)
Decomposes $H = \sum_j H_j$ into easily-simulatable terms:

$$e^{-i(H_1+H_2)t} \approx \left(e^{-iH_1 t/r}e^{-iH_2 t/r}\right)^r$$

Simple but requires large gate counts.

### LCU Methods
Linear Combination of Unitaries approach. Higher query complexity but better asymptotic scaling.

### Qubitization
Encodes Hamiltonian into spectral gaps of unitary operators. Near-optimal query complexity.

## Applications

- Molecular spectroscopy and reaction dynamics
- Materials properties prediction
- Quantum field theory simulations
- Drug discovery
- Battery and catalyst design

## Resource Requirements

Current systems require millions of physical qubits for practical chemistry simulations—still beyond near-term technology.
