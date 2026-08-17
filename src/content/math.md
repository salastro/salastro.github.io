---
id: "math"
title: "Mathematics"
group: "focus"
level: 1
val: 10
date: "2026-05-20"
tags: ["Mathematics", "Abstraction", "Structure"]
projects: ["sympy"]
concepts: ["ecc", "stochastic", "wavelets"]
links:
  - "root"
  - "sympy"
  - "ecc"
  - "stochastic"
  - "wavelets"
  - "is-area-vector-or-scalar"
---

The language underneath every other node in this graph, whether it admits it or not. My particular interest sits in symbolic computation, where formal manipulation stops being notation on paper and becomes an algorithm that has to actually terminate.

## Symbolic Computation

Most of my hands-on math work happens through SymPy's integration engine, extending `manualintegrate` to handle products involving error, exponential, trigonometric, and hyperbolic functions, and tightening the LIATE heuristics that decide which substitution to try first. Getting a computer to integrate something correctly is a good way to find out how much of your own understanding was actually rigorous.

## Where It Shows Up

Math rarely stays in its own node here. It is the substrate underneath the estimation theory in signal processing, the hardness assumptions in cryptography, and the linear algebra running quietly beneath every quantum systems question. This node exists mostly to give that substrate a place of its own.
