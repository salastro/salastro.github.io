---
id: "q-error"
title: "Quantum Error Correction"
group: "concept"
level: 2
val: 5
date: "2024-04-20"
tags: ["Quantum", "Error Correction", "Fault-Tolerance"]
links:
  - "quantum-systems"
---

Framework for protecting quantum information from decoherence and noise through encoding schemes and recovery procedures. QEC is essential for building fault-tolerant quantum computers.

## The Challenge

Quantum information is fragile—measurement and interaction with environment destroy coherence. Classical error correction copying doesn't work due to the no-cloning theorem.

## Stabilizer Codes

Most practical QEC codes use stabilizer formalism. A stabilizer code encodes $k$ logical qubits in $n$ physical qubits using stabilizer generators that are multi-qubit Pauli operators.

Key stabilizer codes:
- **Surface Code**: 2D lattice, local interactions, favorable error thresholds (~1%)
- **Toric Code**: Topological code with inherent robustness
- **Concatenated Codes**: Hierarchical encoding for recursive protection

## Error Models

Typical error models include:
- Bit-flip ($X$ errors)
- Phase-flip ($Z$ errors)
- Depolarization (random Paulis)
- Dephasing (loss of coherence)

## Threshold Theorem

Below a critical error threshold $p_t$, logical error rates decrease exponentially with code distance—enabling arbitrarily accurate quantum computation with fixed physical error rates.

## Current Status

- Experimental realization in trapped ions and superconducting qubits
- Overhead: hundreds to thousands of physical qubits per logical qubit
- Active research on improving efficiency
