---

id: "gsoc-week-12"
title: "GSoC Week 12: A Prototype for the Same Proposal"
shortTitle: "GSoC Week 12"
group: "essay"
level: 2
val: 10
date: "2026-08-13"
tags: ["gsoc", "sympy", "manualintegrate", "symbolic-integration", "search-algorithms", "software-architecture"]
projects: ["sympy"]
links:
- "gsoc"
- "sympy"

---

Nothing changed in the diagnosis this week. The design proposal I wrote last week, replacing `manualintegrate`'s recursive combinator tree with an explicit AND-OR search engine, is exactly where I left it, and the three integrals that motivated it are still open: $\int \frac{x}{e^x-1}\,dx$ still needs a reverse substitution the current rule can't perform, $\int \log(1+e^{2x})\,dx$ still has nowhere to send its own correctly-discovered substitution, and $\int \frac{dx}{\sqrt{-z\sin^2 x}}$ still needs a rewrite nothing in the rule set thinks to try. What's different is that the proposal now has a body. PR #30261 is a prototype that actually refactors `manualintegrate` into a stateful solver, instead of a design that only exists on a slide.

The rest of the week's PRs were small, and one of them makes the case for the rewrite better than the design doc does. PR #30065 bundles three fixes to `trig_product_to_sum_rule`: dropping dead code, restricting the rule to non-linear arguments so it stops colliding with a more specific rule, and memoizing `integral_steps` so the same subgoal doesn't get solved twice. That last part is the same disease the AND-OR proposal is meant to cure architecturally, showing up again as a hand-rolled cache because the cure isn't merged yet. Two more PRs, folding degenerate `Piecewise` cases out of the special-function rule and extending the perfect-square-radicand rule to the complex domain, are the same story: real bugs, worth fixing now, and also exactly the kind of narrow patch a working solver would make unnecessary.

That's the uncomfortable part of proposing a rewrite for code that's still in daily use. You can't just stop maintaining the old path while the new one gets built, so you end up doing both at once, patching symptoms with one hand while building the cure with the other, and every patch is time not spent on the prototype. I don't think that's wrong. A prototype that fails halfway through the rewrite of a module this central would leave `manualintegrate` in a worse state than a slow migration would, and I still remember the singularity-function detour from week three well enough to not trust a design that looks clean until it meets the actual rule set.

So the prototype earns its keep the same way any of this week's patches did: not by looking elegant, but by actually closing the three stalled issues once it exists as running code. That's next week's question, not this week's.
