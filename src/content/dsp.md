---
id: "dsp"
title: "Digital Signal Processing"
group: "concept"
level: 2
val: 5
date: "2024-03-20"
tags: ["DSP", "Filtering", "Analysis"]
links:
  - "signal-processing"
---

Discrete-time signal representation and manipulation. DSP forms the computational foundation for analyzing signals sampled from continuous-time systems, with applications ranging from audio to seismic data.

## Fundamentals

Digital signals are sequences of numbers representing measurements of physical quantities. Processing occurs in discrete time steps, enabling use of computer systems and digital hardware.

### Sampling Theorem

The Nyquist-Shannon sampling theorem establishes the minimum sampling rate required to perfectly reconstruct a continuous signal from its samples:

$$f_s \geq 2 f_{max}$$

where $f_s$ is the sampling frequency and $f_{max}$ is the highest frequency component in the signal.

## Common Operations

- **Filtering**: Removing unwanted frequencies or noise
- **Decimation**: Reducing sampling rate
- **Interpolation**: Increasing effective sampling rate
- **Convolution**: Combining signals with filters
- **Spectral Analysis**: Understanding frequency content

## Applications

- Audio processing and synthesis
- Image processing and computer vision
- Radar and sonar
- Medical signal analysis
- Communications and modulation
