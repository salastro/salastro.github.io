---

id: "gsoc-week-14"
title: "GSoC Week 14: The Stateful Solver Lands"
group: "essay"
level: 2
val: 10
date: "2026-08-28"
tags: ["gsoc", "sympy", "manualintegrate", "symbolic-integration", "trigonometric-substitution", "refactoring"]
projects: ["sympy"]
links:
- "gsoc"
- "sympy"

---

Back in week two, I noticed that a lot of `manualintegrate`'s worst performance problems traced back to the same place: `AlternativesRule` generating too many candidate strategies and the search exploding underneath them. At the time all I had was a vague idea that the integrator needed something closer to a guided search than a pile of heuristics. This week that idea finally became code. PR #30311, the single largest thing I have touched all summer, migrated `manualintegrate` onto a stateful-solver architecture, and it took 79 commits in seven days to get there.

The honest reason it took one giant PR rather than several small ones is that the old design and the new one disagree about what a "step" in the integration process even is. The previous approach threaded loop detection and recursion depth through the recursive rule functions themselves, which is why cycles were so hard to reason about. The same integrand could reappear three call frames down with slightly different dressing, and nothing short of re-deriving the whole call graph would tell you why. The new architecture treats the search explicitly, as a graph the solver walks with its own state, so a cycle is something the solver can detect once, structurally, rather than something every individual rule has to worry about avoiding. Recursion now routes through a single `max_depth`, which sounds like a small thing until you remember how many ad hoc guards used to exist to keep recursive rules from spinning forever on symbolic exponents.

Migrating to that architecture forced a kind of cleanup I would not have done on my own initiative. `manualintegrate` had a `trig_substitution_rule` that had been marked deprecated for a while, kept alive because nothing else covered its cases. This week I finally got to delete it, but only after writing three separate replacements: a Weierstrass substitution ($t = \tan(x/2)$, which rationalizes any expression in $\sin x$ and $\cos x$), a Chebyshev substitution for binomial differentials, and an Euler substitution for integrands built from $\sqrt{ax^2+bx+c}$. None of these are new mathematics, they are all textbook techniques, but `manualintegrate` had never implemented them as first-class rules with their own tests, so the deprecated code had nothing to hand off to.

The part I found most satisfying was extending Bioche's rule. Bioche's rules are a set of classical heuristics for picking which trigonometric substitution actually simplifies a given rational function of $\sin x$ and $\cos x$, based on how the differential form behaves under $x \to -x$, $x \to \pi - x$, and $x \to \pi + x$. Depending on which of those symmetries holds, you know in advance whether $u = \cos x$, $u = \sin x$, or $u = \tan x$ is the substitution that will rationalize the integrand, instead of trying all three and seeing what sticks. I extended the rule to catch double-angle phases and related phase shifts, and then spent a good chunk of the week simplifying the phase parametrization itself, because my first version detected the right symmetry but described it in a way that made the resulting substitution needlessly ugly. Getting the heuristic to fire correctly and getting it to fire *cheaply* turned out to be two different problems.

Once the deprecated rule was gone, the mistakes it had been silently absorbing became visible again, one by one: `special_function_rule` needed to handle degenerate cases and stop asserting zero on expressions that were not provably zero, `PiecewiseRule` needed a proper `fold()` method so results built from several conditional branches did not just concatenate awkwardly, and Owen's T (`owens_t`, the bivariate normal tail function) needed to be re-landed with its printing, its addition and inversion formulas, and its asymptotics all wired up at once instead of trickling in through separate PRs. None of these were things I planned to touch this week. They were things the migration made impossible to ignore, because the new architecture routes every rule through the same evaluation path, and a rule that used to fail quietly now fails loudly, in the tests of a dozen other rules that happen to call it.

There is a tension here I keep circling back to. SymPy's review process, reasonably, wants small, reviewable PRs, and the mentors have said as much more than once. But a genuine architecture change does not decompose cleanly into small PRs, because the whole point of a stateful solver is that the pieces only make sense evaluated together. I don't think I made the wrong call opening one large PR instead of ten sequential ones that would each be broken on their own, but it does mean review is going to be slower and harder for exactly the change that most needs careful review. That's a cost I accepted going in, not one I'm fully comfortable with in hindsight.

The migration is not finished. Flags controlling solver behavior still need to move into the new architecture, and the linear $u$-substitution improvement from week seven has to be reimplemented on top of it, since it was written against the old recursive interface. It is a strange feeling to know that work I already shipped and was happy with now counts as debt again, but that's what happens when the foundation underneath it changes. The alternative, freezing the architecture to avoid re-touching old rules, would have meant keeping the exact search-explosion problem this whole detour was meant to fix.
