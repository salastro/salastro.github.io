---
id: "idea-bci"
title: "Non-invasive BCI"
group: "idea"
level: 2
val: 4
date: "2024-07-20"
tags: ["BCI", "Neurotechnology", "Sensing"]
links:
  - "ideas"
---

Non-invasive brain-computer interface technologies enabling direct communication between brain and external devices without surgical implants. Potential applications in assist technology, communication restoration, and brain-machine collaboration.

## Sensing Modalities

### Electroencephalography (EEG)
**Signal**: Electrical potentials from scalp electrodes reflect neural activity
- Temporal resolution: ~ms
- Spatial resolution: ~cm
- Advantages: Non-invasive, portable, low-cost
- Disadvantages: Noisy, low signal-to-noise ratio

### Functional Magnetic Resonance Imaging (fMRI)
**Signal**: Blood oxygenation changes correlate with neural activity
- Spatial resolution: ~mm
- Temporal resolution: ~1s
- Advantages: Better localization than EEG
- Disadvantages: Expensive, immobile, slow

### Functional Near-Infrared Spectroscopy (fNIRS)
**Signal**: Light absorption in oxygenated hemoglobin
- Portable middle-ground between EEG and fMRI
- Moderate spatial and temporal resolution

## Decoding Approaches

### Feature Extraction
Manual selection of discriminative features (power spectra, oscillations, event-related potentials).

### Machine Learning
Automatically learning discriminative features from data using neural networks, SVMs, or ensemble methods.

### Challenges**:
- **Inter-subject variability**: Requires individual calibration
- **Non-stationarity**: Neural responses drift over time
- **Noise**: Environmental and physiological interference
- **Signal quality**: Electrode contact, head movements

## Applications

1. **Communication**: Spelling out words via P300 paradigm
2. **Control**: Commanding prosthetic limbs or wheelchair
3. **Monitoring**: Detecting seizures or sleep stages
4. **Enhancement**: Augmenting human capabilities

## Technical Hurdles

- Improving information transfer rate (currently bits-per-minute in early systems)
- Real-time artifact rejection and noise handling
- Stable long-term electrode contact
- User comfort and acceptability for daily use

## Current State

- Research stage: Limited commercial deployment
- Experimental systems achieving ~10 bits/minute
- Clinical applications emerging for paralyzed patients
- Mainstream adoption requires 100x improvement in performance

## Research Opportunities

Understanding how the brain encodes intent, developing better noise rejection, creating more intuitive interfaces—bridging neuroscience and engineering.
