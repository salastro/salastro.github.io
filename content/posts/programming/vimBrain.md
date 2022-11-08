---
title: "VIM BRAIN"
date: 2021-12-08
hero: /images/posts/writing-posts/empty-hero.jpg
description: My awful programming language.
enableTOC: false
tags: [ "vim", "esoteric languages" ]
menu:
  sidebar:
    name: vimBrain
    identifier: vimbrain
    parent: programming
---

[An obscure little project](https://github.com/salastro/vimBrain) that I finished recently was to create an
esoteric programming language. My goal was to achieve the smallest
possible set of vim-like instructions while being Turing-complete.

However, I am not the first one to try to do this. The first language
to be Turing-complete with only 6 instructions was P′′ (P double
prime) in 1964. Despite that, a variation from it created in 1993 got
more popular. It was named Brainfuck (because it is incredibly
frustrating) and added two more instructions for I/O.

Even though all of these fascinating variations exist, there is no
vim-inspired variation, so I decided to make a one. The formulations
of the rules were very simple since it is a one-to-one mapping from
Brainfuck, yet programming the interpreter was the exciting part.

I decided that it should be written in as few lines as possible. That
made me use Python instead of other programming languages I am
familiar with because you can just compress the whole code into one
line using semicolons in languages similar to C. Semicolons in Python,
however, do not work in the same way: they create compound statements
instead of terminating them.

After a couple of hours, the result was an interpreter function with
only 17 lines of code. Everything from inline if-else statements to
the new match-case statements was used to achieve this.

This was an interesting project. It is quite refreshing experimenting
with niche concepts like this from time to time. I encourage you to
try doing something similar and see how you would approach the problem
(especially the loops since they are the tricky part).
