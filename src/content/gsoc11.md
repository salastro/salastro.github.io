---

id: "gsoc-week-11"
title: "GSoC Week 11: Manual Integration as Search"
shortTitle: "GSoC Week 11"
group: "essay"
level: 2
val: 10
date: "2026-08-06"
tags: ["gsoc", "sympy", "manualintegrate", "symbolic-integration", "search-algorithms", "software-architecture"]
projects: ["sympy"]
links:
- "gsoc"
- "sympy"

---

Week eleven is where the patchwork finally caught up with me. For the past several weeks I had been fixing `manualintegrate` one rule at a time, making a substitution smarter here, tightening a stopping condition there, adding a keyword so `alternatives()` could choose not to branch. Each fix was correct on its own, but all of them were treating symptoms of the same underlying problem, and this week I finally sat down and named it. `manualintegrate` is built as a tree of recursive strategy combinators, where every rule calls `integral_steps` again on whatever it produces, and the caller has no way to see or influence that recursion from the outside. Cyclic rule applications can fail to terminate, alternative strategies get tried one after another instead of in any principled order, and the logic for "does this rule apply" is welded to the logic for "how do we search among rules that apply." The `branch` keyword I added a few weeks ago was a workaround for exactly this. I couldn't change how the search explored alternatives, so I gave callers a way to opt out of exploring them at all.

The proposal I wrote up this week stops treating integration as a sequence of function calls and starts treating it as what it actually is, a search problem. Each integral becomes a goal, represented as an `IntegralInfo` object. Proposers look at a goal and generate candidate rewrites, rather than committing to one and recursing immediately. A solver sits above all of this and runs an AND-OR search over the resulting graph, where OR-nodes are the different rewrite rules that could apply to a goal and AND-nodes are the subgoals a given rule needs solved before it can close out. Only once a branch of that graph fully resolves does the solver extract the actual antiderivative from it. The appeal isn't abstract elegance. The graph gives me a natural place to hang cycle detection, tracking which goals are already active and refusing to reopen them; backtracking, so a failed branch doesn't poison the whole search and just gets abandoned; and pluggable strategies, since depth-first, breadth-first, beam search, and AO* all become interchangeable once the search structure is explicit instead of buried in Python's call stack.

What convinced me this was worth the architectural churn, rather than just another special case, was lining it up against three integrals that came in as issues this week and looking at why each one stalls. $\int \frac{x}{e^x - 1}\,dx$ has a closed form in the dilogarithm, and the substitution $u = e^x - 1$ gets you most of the way there, but `substitution_rule` only knows how to substitute back an expression that appears verbatim, and here it would need to recover $x = \log(u+1)$ from a nonlinear relationship. $\int \log(1 + e^{2x})\,dx$ is worse in a different way. `manualintegrate` finds the substitution $u = e^{2x}$ just fine, and the resulting integral is one that SymPy's `meijerg` integrator already knows how to solve, but there's no path in the recursive design for "hand this off to a different integrator" once you're several rewrites deep inside `manualintegrate`'s own machinery. And $\int \frac{dx}{\sqrt{-z\sin^2(x)}}$ turns out to reduce to a plain $\csc(x)$ integral once you notice that $\sin(x)/\sqrt{-z\sin^2(x)}$ has zero derivative away from its branch points, so it behaves like a constant factor, but nothing in the current rule set is looking for "this subexpression is locally constant, pull it out."

General reverse substitution, cross-integrator handoff, and recognizing locally-constant factors are three different missing pieces, but they share a shape. In each case, the right move exists somewhere in SymPy's toolbox already, and what's actually missing is a search structure patient enough to try it as one candidate among several rather than betting everything on whatever the first matching rule happens to produce. Under the current recursive design, adding any one of these fixes means threading a special case through call sites that already assume a single, committed recursive path. Under a search architecture, each becomes another proposer that contributes candidates to the same graph, and the solver decides whether pursuing it actually pays off.

The Owen's T rule I also landed this week is a smaller, more contained example of the same idea: a new `OwenTRule` for integrands like $e^{-x^2}\operatorname{erf}(ax)$, following the same "differentiate the special function, integrate 1" pattern from PR #29963 back in week seven. It's a straightforward addition, and it's also exactly the kind of rule that becomes a candidate to weigh against alternatives rather than a rule to hardcode into a priority list, once the search machinery exists to do the weighing.

None of the design work shipped as code this week; it's a proposal, not a merged PR, and I know from the singularity-function detour in week three that a design that looks clean on a slide can still hide an assumption that breaks on contact with the actual rule set. But this is the first time in the project that a week's failures pointed at the same root cause instead of three unrelated gaps, and that alone tells me the direction is worth the risk of a large rewrite.
