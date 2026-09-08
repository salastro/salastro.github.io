---

id: "gsoc-week-2"
title: "GSoC Week 2: Looking for Patterns"
shortTitle: "GSoC Week 2"
group: "essay"
level: 2
val: 10
date: "2026-06-08"
tags: ["gsoc", "sympy", "symbolic-integration", "manualintegrate", "pattern-matching"]
projects: ["sympy"]
links:
- "gsoc"
- "sympy"

---

During the second week of Google Summer of Code, I still had not written a single feature that was intended to be merged into SymPy. Instead, I spent most of my time trying to understand *why* `manualintegrate` behaves the way it does and, more importantly, what its limitations are. Looking back, this was probably the most valuable decision I could have made.

One idea that had been sitting in the back of my mind for quite some time was replacing large portions of `manualintegrate`'s rule dispatcher with declarative pattern matching. The current implementation consists of a long sequence of heuristics and hand-written dispatch functions. While it works remarkably well, it is difficult to extend, and every new integration rule usually requires touching several different parts of the code.

I began investigating whether **MatchPy**, a pattern matching library inspired by Mathematica's rule system, could be used as the foundation for a more declarative integration engine. My intention was never to replace the entire module, but rather to build a small prototype and see whether such an architecture would even be practical. I brought the idea to the project mentors on Zulip, proposing a design where a rewriting engine would repeatedly transform an integral into different candidate forms before handing them to a pattern matcher. If no rule matched, control would return to the rewriting phase, creating a back-and-forth search until either a solution was found or all possibilities were exhausted.

That discussion naturally led me to reading about search algorithms. One concept that particularly caught my attention was **tabu search**, a heuristic optimization technique designed to avoid revisiting recently explored states. Although it was originally developed for combinatorial optimization problems rather than symbolic mathematics, the idea of guiding the exploration of integration strategies instead of exhaustively trying every possibility seemed potentially relevant. Also, we discussed beam search as a way to limit the number of candidate integrals explored at each step, which could help avoid the combinatorial explosion of possibilities that occurs with more complex integrands. I never ended up implementing either, but reading outside the immediate scope of the project often leads to unexpected ideas later on.

While thinking about the future architecture, I also began looking at the current performance problems of `manualintegrate`. Some expressions took surprisingly long to process, while others never terminated at all. One particularly interesting example was

```python
integrate(sin(x)**n * cos(x)**m, x)
```

where `n` and `m` are symbolic integers. The integrator simply stalled indefinitely. Another expression involving substitutions inside rational functions consistently required around fifteen seconds to process, and integrating `Ei(x) * Si(x)` took over twenty-five seconds on my machine.

At this point, I realized that understanding *why* the integrator made certain decisions would be much easier if I could actually see the rule tree it generated. Unfortunately, `manualintegrate` only exposes a nested hierarchy of Python objects whose `repr()` quickly becomes unreadable for larger examples. So I took a short detour from the original project and wrote a visualization tool that converts the output of `integral_steps()` into a graph.

[The tool](https://github.com/salastro/sympy_integral_steps_graph/) safely parses either an integrand or a previously saved `repr()` of a rule tree, discovers the relationships between rules automatically, and exports the result as Graphviz, Mermaid, or JSON. Large integration trees that previously occupied hundreds of lines of nested text suddenly became diagrams that could be inspected visually. It proved surprisingly useful when trying to understand why certain heuristics kept exploring the same branches repeatedly.

That visualization also revealed something else. Many expensive computations originated from the `AlternativesRule`, whose job is to generate many different possible integration strategies before selecting one. For sufficiently complicated expressions, the number of possibilities grows rapidly, making the search increasingly expensive. This observation eventually motivated one of the larger refactorings I would work on during the following week.

Although this week produced very little user-visible functionality, it fundamentally changed how I approached the project. Instead of viewing `manualintegrate` as a collection of unrelated heuristics, I began to see it as a search problem. Every rewrite, substitution, or integration-by-parts choice corresponds to moving through a search tree, and the quality of the integrator depends not only on the integration rules themselves but also on how intelligently that tree is explored.
