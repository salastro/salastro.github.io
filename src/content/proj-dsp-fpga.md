---
id: "proj-dsp-fpga"
title: "FPGA Audio Filter"
group: "project"
level: 2
val: 7
date: "2024-10-01"
tags: ["FPGA", "DSP", "Audio"]
concepts: ["signal-processing", "dsp", "stochastic", "wavelets"]
links:
  - "projects"
  - "signal-processing"
---

Real-time digital signal processing audio filter implemented on FPGA hardware. Emphasis on high-performance, low-latency filtering with adaptive noise cancellation and wavelet-based feature extraction.

## Design Goals

- **Latency**: <5ms end-to-end for real-time interaction
- **Performance**: Process multiple audio streams simultaneously
- **Adaptability**: Real-time parameter adjustment without interruption
- **Efficiency**: Minimal power consumption and FPGA resource utilization

## Filtering Architecture

### Multi-Stage Pipeline

1. **Analog Input**: Anti-aliasing filter, 24-bit ADC
2. **Adaptive Prefilter**: Time-varying gain and EQ
3. **Wavelet Transform**: Multi-scale decomposition for feature extraction
4. **Noise Suppression**: Spectral subtraction in wavelet domain
5. **Synthesis**: Inverse wavelet transform, digital output

### Adaptive Algorithm

Uses LMS (Least Mean Squares) to adaptively estimate and cancel noise in real-time based on reference or error signals.

$$w[n+1] = w[n] + 2\mu e[n]x[n]$$

where weights $w$ are stored in BRAM and updated every clock cycle.

## FPGA Implementation

**Hardware Target**: Xilinx Artix-7 (cost-effective, streaming architecture)

**Tools**: Vivado HLS for high-level synthesis, reducing development time

**Resources**:
- ~40% LUT utilization
- ~60% DSP block utilization
- 12 Gbps I/O bandwidth

## Testing & Validation

- **Unit tests**: Filter stability, frequency response
- **Integration tests**: Multi-stream operation, resource contention
- **Acoustic tests**: Subjective evaluation, comparison to reference implementations
- **Stress tests**: Maximum throughput, thermal limits

## Applications

- Real-time speech enhancement
- Environmental noise characterization
- Sonar signal processing
- Seismic data acquisition
