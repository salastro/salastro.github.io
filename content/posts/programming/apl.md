---
title: "The Programming Language of Wizards"
date: 2022-02-20
hero: /images/posts/writing-posts/apl-hero.png
description: An overview of APL.
tags: [ "APL", "Array Programming" ]
menu:
  sidebar:
    name: APL
    identifier: apl
    parent: programming
    weight: 500
---

**APL** (**A** **P**rogramming **L**anguage) is an exceptionally unique language. It mainly follows an array paradigm, unlike the usual functional and object-oriented approaches; it depends heavily on weird mathematical glyphs; and it is surprisingly elegant.

![The Council of APL Wizards Welcoming You](/posts/programming/images/the-council-of-apl-wizards.png)

## History of Old Wizardy

APL is a quite old language. It started as a book (under the same name) written by Kenneth Eugene Iverson in 1962. The focus of the book was mathematical notation. Ken was dissatisfied with the inconsistency of mathematical notation and the lack of a sufficient tool to describe computer algorithms especially when it comes to matrices. Thus, he created what he later won a Turing Award for.

The notation was used inside IBM (his workplace) for describing some reports. However, the first interpreter was not built until a year later for limited use. On the other hand, the first commercially available one was introduced in 1968. After that, APL started gaining popularity from the late 1960s till the early 1980s.

In contrast, these days APL is not as popular as it used to be. Despite that, development is still going. The most popular implementation of APL is Dyalog, a commercial implementation started in 1983 (yes, even the most modern of implementations is on the old side) that in recent years added useful extensions like object-oriented and functional programming, nested arrays, lambda calculus, etc. Additionally, if you are not a fan of commercial restricted use, you may try GNU APL but with fewer extensions.

## Scripts of Magic

As mentioned before, APL uses a unique combination of mathematical symbols. These symbols represent polymorphic functions used to tackle a variety of problems. For example, the symbol `⌈` behaves as celling when a single integer is passed to it and as maximum when two numbers are passed to it. In addition, the symbol for the exact opposite behavior is `⌊` resulting in beautiful symmetry.
```apl
	⌈ 2.4 
3

	4 ⌈ 2 
4
```

Yet, the elegancy does not stop there. The circle symbol represents the Pi constant multiplies while also behaving as trig functions.
```apl
	○1
3.141592654
	2○○1
¯1
	¯2○¯1
3.141592654
```

This is the case with most of the functions in APL. They consist of weird glyphs. This may seem intimidating at first glance, and it is for people that aren't comfortable with APL's syntax. However, it makes it much easier to look at huger chunks of logic. An impressive example is an implementation of *[Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)*, where you can see all the important logic in one line of magic. This makes many things way more elegant in some way.

```apl
Life ← {↑1 ⍵∨.∧3 4=+/,¯1 0 1∘.⊖¯1 0 1∘.⌽⊂⍵}
```

## Simple Array Logic

A fascinating aspect of APL is the way it handles arrays. It just works exactly how I expect it to work. First off, there is no special syntax to write arrays, they are just numbers/string separated with spaces. `1 4 3` is an array of three elements: 1, 4, and 3. `'hello' 'world'` is an array of two elements: 'hello' and 'world'. On the other hand, operations also makes sense. `1 2 3 + 4 5 6` sums the two arrays into `5 7 9`, which is exactly what I thought of the first time I saw a plus between two arrays. You want to sum the elements of the array? No problem just add `+/` in front of the array, and it is done. A running sum? Just replace the `/` with `\`. More stuff like [Cartesian product](https://en.wikipedia.org/wiki/Cartesian_product) are also simple; just insert `∘.,` between the two arrays. This partially extends to strings since they also are arrays but of characters.

## Comparison

Generally, APL solutions to algorithmic problems involving arrays in some form are much cleaner than other programming language. This is, however, not a perk of APL into itself since most array programming languages (and to a lesser extent functional ones) yields the same force of minimal simple solutions.
| Problem                                                                                                  | APL                       | Python                                                                              |
| -                                                                                                        | -                         | -                                                                                   |
| [LeetCode #1920](https://leetcode.com/contest/weekly-contest-248/problems/build-array-from-permutation/) | `⊂⌷⊢`                     | `[nums[i] for i in nums]`                                                           |
| [LeetCode #1979](https://leetcode.com/problems/find-greatest-common-divisor-of-array/)                   | `⌈/∨⌊/`                   | `math.gcd(min(nums), max(nums))`                                                    |
| [LeetCode #1614](https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/)                | `⌈/+\(⊣-~)'('=(s∊'()')/s` | `max(itertools.accumulate(filter(None, map({"(": 1, ")": -1}.get, s))), default=0)` |
| [LeetCode #14](https://leetcode.com/problems/longest-common-prefix/)                                     | `{+/∧\(⊃∧.=⊢)¨↓⍉↑⍵}↑⊃`    | `''.join(x[0] for x in itertools.takewhile(more_itertools.all_equal, zip(*words)))` |

However, it is important to realize that this is not always the case; it is completely possible to write ugly code in APL that could have been written better in other traditional programming languages. It basically depend on the problem and the approach.

## For Future Wizards
1. [Try APL online](https://tryapl.org/)
2. [Learn APL Book](https://xpqz.github.io/learnapl)
3. [APL Wiki](https://aplwiki.com/)
4. [Download Dyalog APL](https://www.dyalog.com/download-zone.htm)
5. [Dyalog Usermeeting YT channel](https://www.youtube.com/channel/UC89lIdGnKlEozb1WcYQprNw)
6. [Rodrigo Girão Serrão YT channel](https://www.youtube.com/channel/UCd_24S_cYacw6zrvws43AWg) (solves LeetCode problems with APL)
7. [code_report YT channel](https://www.youtube.com/channel/UC1kBxkk2bcG78YBX7LMl9pQ) (cool person who talks about array programming)
8. [APL subreddit](https://www.reddit.com/r/apljk/)
9. [APL demonstration 1975](https://www.youtube.com/watch?v=_DTpQ4Kk2wA)
<!-- [My Work on APL](https://www.youtube.com/watch?v=dQw4w9WgXcQ) -->
