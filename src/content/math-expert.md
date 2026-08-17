---
id: "math-expert"
title: "Math Expert"
group: "project"
level: 2
val: 8
date: "2022-05-15"
status: "Archived Project"
tags: ["Symbolic Math", "GUI", "LaTeX", "Python"]
concepts: ["math", "sympy"]
links:
  - "math"
  - "sympy"
---

Math Expert was my high school graduation project, built with two classmates, @younis-tarek and @marawan-mogeb. The problem we were solving: most software either produces beautifully typeset math or actually solves it, rarely both at a speed anyone wants to sit through.

## Architecture

We split the problem across three tools doing what each is best at. LaTeX handles typesetting through PyLaTeX, since nothing else comes close for mathematical notation. SymPy handles the actual manipulation — we picked it over NumPy specifically because the project cared about symbolic results, not numerical ones, and for most operations we favored whichever SymPy function had the widest solution coverage over the one with the nicest step-by-step output (`integrate` over `manualintegrate`, for instance). PyQt5 wraps the whole thing in a GUI, after Kivy's own syntax and Tkinter's dated toolkit both got ruled out.

## Codebase Philosophy

The code leans object-oriented, mostly because PyLaTeX's document model all but requires it and because SymPy's symbolic objects fit the same shape naturally. Three files: `gui.py` for the interface, `func.py` for a single `MathDocument` class with one method per operation, `main.py` to wire the two together. Minimal by intent, closer to suckless than to abstraction for its own sake, while still leaving room to add operations later.

## Tradeoffs

It is fast, accurate, and easy enough to hand to someone with no LaTeX experience. It is also narrow: limited input syntax, no preview before committing an operation, no undo. Those are the honest tradeoffs of shipping a graduation project instead of a product.

## References

- [Math Expert on GitHub](https://github.com/salastro/math-expert)
