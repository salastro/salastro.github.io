---
id: "entanglement"
title: "Entanglement Entropy"
group: "concept"
level: 2
val: 5
date: "2024-04-15"
tags: ["Quantum", "Information Theory", "Foundations"]
links:
  - "quantum-systems"
---

Quantitative measure of quantum correlations in composite systems. Entanglement entropy characterizes how much a subsystem is entangled with its environment, central to understanding quantum information dynamics.

## Definition

For a pure state $|\psi\rangle$ of a bipartite system $AB$, the entanglement entropy of subsystem $A$ is:

$$S_A = -\text{Tr}(\rho_A \log_2 \rho_A)$$

where $\rho_A = \text{Tr}_B(|\psi\rangle\langle\psi|)$ is the reduced density matrix of subsystem $A$.

## Key Properties

- **Range**: $0 \leq S \leq \log_2(d_A)$ where $d_A$ is dimension of Hilbert space
- **Additivity**: For product states, $S(AB) = S(A) + S(B)$
- **Purity**: Pure states have maximum entanglement entropy if maximally entangled
- **Locality**: Cannot exceed the entropy of the smaller subsystem

## Area Law

In many physical systems, entanglement entropy scales with the boundary area rather than volume—a deep principle underlying field theory and gravity.

## Applications

- Characterizing phases of matter
- Measuring quantum correlations
- Studying black hole thermodynamics
- Designing quantum error correction codes
- Analyzing quantum phase transitions
