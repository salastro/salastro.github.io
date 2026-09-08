---

id: "gsoc-week-8"
title: "GSoC Week 8: Closing the sin(x^2)cos(x) Gap"
shortTitle: "GSoC Week 8"
group: "essay"
level: 2
val: 10
date: "2026-07-16"
tags: ["gsoc", "sympy", "manualintegrate", "symbolic-integration", "trigonometric-integrals", "fresnel-integrals"]
projects: ["sympy"]
links:
- "gsoc"
- "sympy"

---

Last week ended with a problem I couldn't solve: `manualintegrate` had no way to handle $\int x^2 \sin(x^2)\cos(x)\,dx$, even though Wolfram Alpha resolves it in a few standard steps. This week I went back and built the two rules that close that gap, and in the process learned that fixing one class of integral just moves the wall a little further out.

The first piece is a product-to-sum rule. Whenever the integrand is a product of exactly two sine or cosine factors with different, genuinely $x$-dependent arguments, it rewrites the product using the standard identities, $\sin A \sin B = \tfrac12[\cos(A-B) - \cos(A+B)]$ and its three cousins, and recurses on the resulting sum. That alone turns $\sin(x^2)\cos(x)$ into $\tfrac12[\sin(x^2+x) + \sin(x^2-x)]$, which is progress, but $\sin(x^2\pm x)$ still isn't something `manualintegrate` knew how to integrate directly.

The second piece handles that leftover, a rule for polynomial times $\sin$ or $\cos$ of a quadratic phase. It completes the square on the quadratic argument, $x^2 + x = (x+\tfrac12)^2 - \tfrac14$, shifts to $u = x + \tfrac12$, and expands $\sin(au^2 + k)$ with the angle-sum identity into a combination of $\sin(au^2)$ and $\cos(au^2)$ multiplied by constants. Those are Fresnel-integral territory, which `manualintegrate` already handles once the polynomial factor is folded in through integration by parts. Chaining the two rules together, along with a `CompleteSquareRule` step to make the substitution show up cleanly in the derivation, was enough to make last week's failing case pass, and I added tests for both the two-factor product form and the shifted polynomial form to lock in the behavior.

While I was in there, I also went back and made a couple of the substitution rules more honest about their own assumptions. The parts-rule cutoff that decides whether a candidate $dv$ is "worth trying" used to be a bare `if index < 5`, silently relying on where logarithms and inverse trig functions happen to sit in the LIATE ordering. I replaced the magic number with `liate_rules.index(pull_out_algebraic)`, so the cutoff is now defined in terms of what it actually means rather than a number that would silently go stale if the ordering ever changed. Along similar lines, `_remove_additive_constants`, which strips constants of integration that don't affect the derivative, used to only look at the top level of an expression via `as_independent`. I extended it to recurse into nested `Add` and `Mul` structure so it catches constants buried inside a subterm, and added a guard to skip the whole pass when the original integrand contains an unevaluated `Derivative`, since a formal derivative isn't something you can safely assume is constant-free.

The `alternatives()` branching flag from last week also needed a real fix. Passing `branch=True` at the top level was supposed to make `integral_steps` explore every candidate rule instead of stopping at the first success, but the flag only affected the specific call it was passed to. Any *nested* call to `integral_steps` inside a rule's own logic (which is most rules) would fall back to the default, non-branching behavior regardless of what the caller asked for. I fixed this with a `ContextVar`, so the branching preference now propagates implicitly through the whole recursive call stack unless a nested call deliberately overrides it. I also gated the debug-wrapping `__init_subclass__` hook behind `SYMPY_DEBUG`, since formatting the parameter string for every single rule call is not free, and it was showing up in the trace even when nobody was going to read the debug output.

The part of this week I'm least settled on is what happened when I extended `trig_cmplx_exp_rule` to recognize quadratic-phase trig functions multiplied by an exponential, the natural next step after $\int e^x \cos(x^2)\,dx$ started working through the complex-exponential rewrite. It's a real improvement for that family, but it also exposed a new issue: $\int e^x \sin(x^2+x)\cos(x)\,dx$ no longer fails cleanly with a `DontKnowRule`. It hangs. Somewhere in the interaction between the new quadratic-phase detection and the product-to-sum and complete-the-square rules from earlier this week, the rules end up rewriting the integrand back and forth without making progress and without anything catching the cycle. A clean failure is annoying but harmless; an infinite loop is a real regression, and it's the first time this GSoC that a "fix" made a case strictly worse instead of merely incomplete. Sorting out where that cycle is closing, and whether it needs a general loop-detection mechanism rather than a fix local to this one rule, is next.
