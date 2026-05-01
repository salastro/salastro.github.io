---
id: "zkp"
title: "Zero-Knowledge Proofs"
group: "concept"
level: 2
val: 5
date: "2024-02-25"
tags: ["Cryptography", "Privacy", "Proof Systems"]
links:
  - "cryptography"
---

Cryptographic protocols where one party (prover) convinces another (verifier) that they know something, without revealing the knowledge itself. ZKPs are fundamental to privacy-preserving systems.

## Definition

A zero-knowledge proof protocol must satisfy three properties:

1. **Completeness**: If the prover knows the secret, they can convince the verifier
2. **Soundness**: If the prover doesn't know the secret, they cannot convince the verifier with non-negligible probability
3. **Zero-Knowledge**: The verifier learns nothing but the truth of the statement

## Interactive vs. Non-Interactive

**Interactive ZKPs** require real-time exchange between prover and verifier. **Non-Interactive ZKPs** (NIZKs) produce a proof that can be verified by anyone at any time, typically using the Fiat-Shamir heuristic.

## Practical Systems

### zk-SNARKs
Succinct, Non-Interactive Arguments of Knowledge. Provide constant-size proofs with efficient verification, enabling scalable privacy-preserving systems.

### zk-STARKs
Scalable, Transparent Arguments of Knowledge. Post-quantum secure and transparent (no trusted setup).

## Applications

- Privacy-preserving transactions
- Anonymous credentials
- Decentralized identity
- Blockchain scaling solutions
- Secure multi-party computation
