---
id: "pq-crypto"
title: "Post-Quantum Cryptography"
group: "concept"
level: 2
val: 5
date: "2024-05-05"
tags: ["Cryptography", "Quantum Safety", "Standards"]
links:
  - "cryptography"
  - "quantum-systems"
---

Cryptographic algorithms resistant to attacks by both classical and quantum computers. As quantum computing advances, post-quantum cryptography becomes essential for long-term data security.

## Threat Model

Quantum computers using Shor's algorithm can efficiently factor large integers and solve discrete logarithm problems—breaking RSA and ECC within polynomial time. PQC schemes resist both classical and quantum adversaries.

## Leading Candidates

### Lattice-Based Cryptography
Built on hard problems over lattices (LWE, Ring-LWE). Fastest and most versatile family, with applications in encryption, signatures, and zero-knowledge proofs.

### Multivariate Polynomial Cryptography
Security based on multivariate quadratic equation solving. Small signature sizes but slower operations.

### Code-Based Cryptography
Based on the hardness of decoding random linear codes. Proven secure for decades, but large key sizes.

### Hash-Based Signatures
Unconditionally secure (requires only collision-resistant hash functions). Limited signatures per key but deterministic security.

## Standards and Deployment

NIST has standardized post-quantum algorithms (ML-KEM, ML-DSA, SLH-DSA) for hybrid deployment alongside classical schemes during the transition period.

## Implementation Challenges

- Integration with existing systems
- Performance trade-offs
- Key size management
- Backward compatibility
