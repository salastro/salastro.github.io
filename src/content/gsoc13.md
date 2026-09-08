---

id: "gsoc-week-13"
title: "GSoC Week 13: How Much Does Rule Order Actually Cost?"
shortTitle: "GSoC Week 13"
group: "essay"
level: 2
val: 10
date: "2026-08-20"
tags: ["gsoc", "sympy", "manualintegrate", "symbolic-integration", "performance", "optuna"]
projects: ["sympy"]
links:
- "gsoc"
- "sympy"

---

Week thirteen had no new integration rules to show off. Instead it was seven pull requests closing out loose ends from earlier weeks, plus a side project that finally let me put a number on a question I'd been asking myself since week seven: when `manualintegrate` has several ways to solve an integral, how much does the order in which it tries them actually matter?

Two of the smaller pull requests turned out to be more connected than they looked on the agenda. Adding a `SkewNormal` distribution to `sympy.stats` needs a closed-form cumulative distribution function, and the skew-normal CDF is defined in terms of Owen's T function, $T(h, a)$, a special function that shows up almost nowhere else in the library. I'd already been working on an integral rule for Owen's T on its own merits, so the stats PR mostly consisted of wiring an existing piece into a new place rather than deriving anything new. It's a good reminder that "add a probability distribution" and "add a special function" are often the same task wearing different clothes.

The rest of the fixes were about tightening things that had been left slightly wrong. `PiecewiseRule` now folds its branches unconditionally instead of only in some cases, which closes a piece of the "rules should return `Piecewise` when the answer genuinely depends on a sign, but often don't" problem I ran into a few weeks ago. The perfect-square-radicand rule got broadened to the complex domain and a bug fixed where it was silently leaking a float exponent into an otherwise exact symbolic result, the kind of thing that only shows up once you throw enough different test inputs at it.

The more substantial fix was to `Integral.doit()`'s use of `factor()`. `factor()` is not cheap, and it had been used as a generic "try factoring the integrand, then retry integration" fallback. For most integrands this either helps or does nothing, but for expressions involving radicals it could blow up the factoring step itself and turn a fast integral into a multi-minute timeout. The fix went through two stages: first scoping the factor-and-retry logic so it wouldn't fire in the exact cases that caused timeouts, then, once that was proven safe, removing the blanket `factor()` calls from `doit()` entirely. It's the same lesson from week seven's `Wild`-pattern cleanup showing up at a different layer of the codebase. A general-purpose operation applied indiscriminately is a liability, and it's almost always better to ask a narrower, specific question about the integrand than to run an expensive generic transform and hope it helps.

The last of the seven PRs, memoizing subintegrals inside `alternatives()`, closes a loop that opened back in week seven. Once branching became optional rather than default, it also became something people would actually turn on, and turning it on means the same subintegral can now get reached through several different branches of the search and solved from scratch every time. Caching those subintegrals so each one is only solved once was a natural next step, and it made the branching path noticeably less wasteful without changing what it returns.

All of that set up the side project I actually enjoyed the most this week: a statistical search over the argument order of the five `do_one(...)` call sites in `manualintegrate.py`, using Optuna's TPE sampler and wall-clock time on `test_manual.py` as the signal to minimize. `do_one` isn't like `alternatives()`. It short-circuits on the first rule that matches, so its argument order doesn't just affect speed, it can change which rule wins for a given integrand. That makes reordering it a genuinely risky thing to automate, so before any timing number counts for anything, a candidate ordering has to survive a staged gate: the module's doctests, then the fast subset of the test suite, then, for anything that survives that far, the full suite. A failure or a timeout at any stage disqualifies the candidate outright, full stop, it never even reaches the loss function.

Running this turned up two things worth remembering. Reversing all five call sites at once didn't just get a bit slower, it hung the fast test subset for minutes, which says something about how lopsided the current ordering already is toward the common cases. And some test outcomes changed with `PYTHONHASHSEED` regardless of `do_one` ordering, which was unsettling to discover in the middle of a search that's supposed to be measuring the effect of ordering specifically. I pinned the seed to `0` for reproducible trials, but any ordering that looks like a winner still needs to be spot-checked at other seeds before I'd trust it.

The search itself, coordinate descent on the fast subset feeding into joint refinement on the full suite, hasn't produced a configuration worth shipping yet. The space is expensive to explore because every candidate has to clear that correctness gate before it's even scored, and rule ordering is discrete, so there's no gradient to follow toward a better arrangement, only trial and error. Still, even without a winner, it's already answered a smaller version of the question I left open in week seven about whether `alternatives()` should prefer the first successful branch or the cheapest one: for `do_one`, at least, "first" is doing a lot more work than I'd assumed, and getting it wrong is expensive in a way that's easy to miss until you actually measure it.
