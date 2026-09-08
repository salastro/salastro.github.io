---

id: "gsoc-week-3"
title: "GSoC Week 3: Consolidating Manual Integration"
shortTitle: "GSoC Week 3"
group: "essay"
level: 2
val: 10
date: "2026-06-15"
tags: ["gsoc", "sympy", "manualintegrate", "symbolic-integration"]
projects: ["sympy"]
links:
- "gsoc"
- "sympy"

---

After spending the previous week understanding how `manualintegrate` searched for solutions, I finally started making changes to the integrator itself. Rather than adding completely new capabilities, I decided to focus on something that had bothered me ever since I began reading the integration code: SymPy's symbolic integrators were surprisingly fragmented.

The project contains several specialized integration modules—`manualintegrate`, `deltaintegrate`, `singularityintegrate`, `trigintegrate`, and a number of other routines—that each evolved independently over the years. From a maintenance perspective, this makes perfect sense. Each module was introduced to solve a particular class of problems, and over time they became increasingly specialized. The downside, however, is that they all speak slightly different "languages." Only `manualintegrate` produces human-readable derivation steps, while the others simply return an antiderivative.

One of the long-term goals of my GSoC project is to consolidate as much of this functionality as possible under `manualintegrate`. Besides reducing duplicated logic, it also means that users can see *how* SymPy arrived at an answer rather than simply receiving the final expression.

I decided to start with three closely related objects: `Heaviside`, `DiracDelta`, and `SingularityFunction`.

The first improvement turned out to be relatively straightforward. `manualintegrate` already knew how to integrate the Heaviside function, but it silently ignored its optional value at the discontinuity, usually denoted by (H_0). Since the parameter simply propagates through the antiderivative, extending the rule required only a small modification. Although mathematically minor, it fixed an inconsistency between `manualintegrate` and SymPy's main integration routines.

The second task was considerably more interesting. `SingularityFunction` has a particularly elegant recursive integration rule,

$$
\int \langle x-a\rangle^n dx =
\frac{\langle x-a\rangle^{n+1}}{n+1},
$$

whenever the exponent permits it. Unfortunately, more complicated expressions are traditionally handled by rewriting them into combinations of `Heaviside` and `DiracDelta`, integrating those instead, and then rewriting the final result back into singularity functions.

Replicating this behaviour inside `manualintegrate` turned out to be far more complicated than I had anticipated.

Unlike the ordinary integrator, `manualintegrate` does not simply compute an antiderivative. It constructs a tree of rule objects describing every intermediate step that should later be displayed to the user. Once an expression has been rewritten into another form, the system loses any memory of where that expression originally came from. By the time the recursive call finishes, there is no indication that the integral began life as a `SingularityFunction`, making it impossible to know whether the final answer should be rewritten back.

I spent several days experimenting with different approaches before finally concluding that the problem was architectural rather than algorithmic. What I really needed was some notion of *context*—a flag or piece of metadata that would survive recursive calls and indicate that the computation originated from a singularity-function rewrite. Without that information, any attempt to blindly rewrite the final result would also affect integrals that genuinely started as `DiracDelta` or `Heaviside` expressions, producing incorrect answers.

This was my first encounter with one of the recurring themes of large software projects: sometimes the difficult part is not implementing a mathematical rule but deciding where information should live inside the program.

While working on these rewrite rules, I also extended the existing `DiracDelta` integration logic. The previous implementation handled only relatively simple cases, whereas many practical identities involve products such as

$$
f(x)\delta(x-a).
$$

Supporting these expressions required making the matching rules considerably more general while still preserving the assumptions necessary for correctness.

Although the implementation worked well for indefinite integration, testing uncovered another subtle problem. Certain nested definite integrals involving `DiracDelta` unexpectedly changed value from (\tfrac12) to (1). Even more confusingly, the indefinite antiderivatives before and after my changes were identical. Somewhere inside SymPy's definite integration machinery, an assumption was being violated, yet I could not identify exactly where.

That pull request ultimately remained unfinished. From a contributor's perspective, this was initially frustrating. After spending several days on the implementation, I wanted to see it merged immediately. Looking back, however, leaving it open was the correct decision. One of the easiest mistakes to make in symbolic mathematics software is assuming that passing hundreds of tests implies correctness. The remaining failures demonstrated that I still did not fully understand how these specialized integrators interacted with one another, and merging the changes prematurely would only have introduced subtle regressions.

Perhaps the biggest lesson from this week was that integrating a new feature into an established system is often more difficult than implementing the feature itself. The mathematics behind Heaviside functions, Dirac deltas, and singularity functions was already well understood. The real challenge lay in making those rules coexist with an architecture that had gradually evolved over nearly two decades.

Although the pull request was eventually closed in favour of the default approach, the time spent exploring these interactions proved invaluable. It exposed many of the assumptions hidden inside `manualintegrate`, clarified the boundaries between the various integration modules, and laid much of the groundwork for the larger refactorings that followed in the subsequent weeks.

