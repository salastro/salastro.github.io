---
id: "ecc"
title: "Elliptic Curve Cryptography"
group: "concept"
level: 2
val: 5
date: "2024-02-28"
tags: ["Cryptography", "Number Theory", "Public-Key"]
links:
  - "cryptography"
---

Public-key cryptography based on the algebraic structure of elliptic curves over finite fields. ECC provides equivalent security to RSA with significantly smaller key sizes.

## Mathematical Foundation

An elliptic curve over a finite field $\mathbb{F}_p$ is defined by:

$$y^2 = x^3 + ax + b \pmod{p}$$

with discriminant $\Delta = -16(4a^3 + 27b^2) \not\equiv 0 \pmod{p}$.

The set of rational points on the curve forms an abelian group under point addition, enabling cryptographic operations.

## Security

The security of ECC relies on the Elliptic Curve Discrete Logarithm Problem (ECDLP):

Given $Q = dP$ for unknown $d$, efficiently computing $d$ from $Q$ and $P$ is computationally hard for properly chosen curves.

## Common Curves

- **NIST P-256, P-384, P-521**: FIPS standard curves with special structure
- **Curve25519 and Curve448**: Designed for efficiency and security against side-channel attacks
- **BN and BLS curves**: Used in pairing-based cryptography

## Advantages

- Smaller keys (256-bit ECC ≈ 3072-bit RSA)
- Faster operations
- Emerging in post-quantum scenarios
- Patent-free implementations available

## Disadvantages

- More complex mathematics
- Vulnerability to side-channel attacks
- Not post-quantum secure
