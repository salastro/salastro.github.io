---

id: "gsoc-week-7"
title: "GSoC Week 7: Making manualintegrate Leaner"
shortTitle: "GSoC Week 7"
group: "essay"
level: 2
val: 10
date: "2026-07-09"
tags: ["gsoc", "sympy", "manualintegrate", "symbolic-integration", "integration-by-parts", "u-substitution"]
projects: ["sympy"]
links:
- "gsoc"
- "sympy"

---

Week seven was less about adding new integration rules and more about tightening the logic that decides when `manualintegrate` should stop looking for one. Several of the pull requests I opened this week replace a heuristic that happened to work with a check that is actually justified by the structure of the problem.

The clearest example is integration by parts. `manualintegrate` repeats the classic $\int u\,dv = uv - \int v\,du$ trick a handful of times to unwrap things like $\int \operatorname{erf}(x)\,dx$, where setting $u = \operatorname{erf}(x)$ and $dv = 1$ eventually produces a closed form. The existing loop decided when to stop by re-running the resulting sub-steps and checking whether they still contained a `DontKnowRule`, in other words, it tried something, then inspected the aftermath to see if it had worked. That is backwards. The real stopping condition is simply $dv = 1$. Once you have chosen to differentiate the whole integrand and integrate $1$, there is nothing left to unwrap, so checking for $dv = 1$ directly is both cheaper and reflects what is actually true about the recursion, rather than inferring it after the fact.

A similar cleanup applied to the rule that chooses parts for integrals like $\int x^2 e^{-x^2}\,dx$, which needs $u = x$ and $dv = xe^{-x^2}$ to land on the error function. That rule used to build a `Wild`-pattern template with symbolic exponents and coefficients and match the integrand against it. But the actual coefficients never mattered. All that matters is whether the integrand contains one of a handful of "grows faster than polynomial" functions (exponentials, sines, cosines) with a quadratic argument, and whether the symbol's power is at least two. Pattern matching with `Wild` is expensive precisely because it tries to solve for coefficients nobody needs; reading the power directly off `as_powers_dict()` and checking the inner argument's degree does the same job for a fraction of the cost. It's a small change, but the kind of thing that adds up once you realize the pattern-matching machinery was solving a harder problem than the one actually posed.

The most interesting rule change this week extended $u$-substitution to handle linear shifts. Previously, `manualintegrate` could only substitute expressions that appeared *verbatim* elsewhere in the integrand, so $\dfrac{e^{x+1}}{x+1}$ would substitute cleanly to $\dfrac{e^u}{u}$, but $\dfrac{e^x}{x+1}$ would not, even though writing $u = x+1$ and solving $x = u-1$ makes it just as solvable. The fix could have reached for `solve()`, but `solve` is heavyweight for something this constrained. Since we only care about linear substitutions, it is enough to read the coefficients directly: if $u = ax+b$, then $x = (u-b)/a$, no solver required. It's a good illustration of a pattern I keep running into. The general tool is available, but a narrower, purpose-built version is often faster and just as correct for the cases that actually occur.

That substitution rule also surfaced something worth remembering. Making a rule more general can shuffle which of several equally valid antiderivatives gets returned, and the new one is not always the more readable one. After the change, one previously clean output for $\int \cos(n(x-\varphi))\cos(nx)\,dx$ came back noticeably more cluttered. The integral was still correct, just with different constants of integration and a different but equivalent trigonometric grouping, but it was a reminder that "more capable" and "nicer output" are separate goals, and expanding a rule's reach can quietly trade one for the other.

Alongside the rule work, I added a debugging pass. An `__init_subclass__` hook on `AtomicRule` now automatically wraps every subclass's `eval()` method to log the parameters it was called with, and I scattered manual debug statements through the non-atomic `RewriteRule` sites that the wrapper cannot see. This paid for itself almost immediately while chasing the substitution and parts changes above, since it let me watch exactly which rule fired with which arguments instead of guessing from the final tree.

The largest design question of the week was what to do with `alternatives()`, the combinator that turns several candidate rules into an `AlternativeRule` so `manualintegrate` can show every way of solving an integral. Branching over every alternative is useful for exposition but expensive, and a reviewer's comment made it clear that simply removing branching altogether broke real use cases. The compromise was to make branching a keyword. By default, `alternatives()` now returns the first alternative that reaches a closed form (or the first partial result if none do), and only builds the full `AlternativeRule` tree when a caller explicitly asks for it. I'm not fully sure this is right. It's fast, but I want to hear from the mentors whether always preferring the *first* successful alternative is the correct default, or whether it should be the *cheapest* one.

The week also produced a good failure case for future work. `manualintegrate` still cannot handle $\int x^2 \sin(x^2)\cos(x)\,dx$, while Wolfram Alpha resolves it through a product-to-sum identity, completing the square, and falling back to Fresnel integrals. Wolfram Alpha's derivation doesn't invent anything `manualintegrate` doesn't already know how to do individually. The pieces just need to be composed in the right order, which is really what the alternatives and rewriting search is supposed to be doing in the first place.
