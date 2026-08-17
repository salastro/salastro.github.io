---
id: "embedded-systems"
title: "Embedded Systems"
group: "focus"
level: 1
val: 7
date: "2026-05-24"
tags: ["Embedded Systems", "Microcontrollers", "Firmware", "Hardware"]
links:
  - "programming"
  - "dsp"
  - "proj-dsp-fpga"
---

Embedded systems are where software stops being an abstraction and starts being a physical commitment. You are not just writing code anymore, you are choosing how current flows, how a chip wakes up, and how much time you actually have before a deadline you cannot negotiate with.

## Why I Care About This

Most of programming lets you defer reality. Embedded work does not. A missed timing budget is not a bug report, it is a signal that never arrives, a motor that never stops, a sample that never gets read. That constraint is uncomfortable at first and addictive after.

I like it because it forces honesty:
- The hardware does exactly what you tell it, nothing more
- Resources are finite and you feel every byte
- Correctness is not optional, it is the whole job

## The Spectrum

Not every board deserves the same problem. Part of doing this well is picking the right level of abstraction for the constraint you actually have.

- **PIC16F877A**: bare-metal discipline, registers and interrupts, no room to hide
- **ESP32 / NodeMCU**: wireless connectivity without giving up real-time behavior entirely
- **Arduino**: fast iteration and a friendly ecosystem when the deadline is the idea, not the silicon
- **Raspberry Pi**: a full Linux stack when the job needs networking, storage, or multitasking more than determinism

Choosing wrong in either direction is the most common mistake I see, and I have made all of them myself.

## Where It Meets Signal Processing

This is also where the theory stops being theoretical. The DSP work I do on paper eventually has to run somewhere, and the FPGA audio filter project is the clearest example of that: a filter is not real until it is running on hardware, at the sample rate, with the latency budget I originally wrote down.

That loop, from equation to silicon, is the part of programming I find hardest to walk away from.

## Conclusion

Embedded systems are a good filter for whether you actually understand what your code is doing, or whether you have just been getting away with it. I keep coming back to this space because it does not let me get away with anything.
