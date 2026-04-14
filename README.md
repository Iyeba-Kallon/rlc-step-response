# Interactive RLC Circuit Step Response Simulator

A beautiful, interactive web application that simulates the step response of Series and Parallel RLC circuits using Vanila JavaScript and Chart.js.

## How to Run

There are no build tools or frameworks required! 

Simply double-click the `index.html` file or open it directly in any modern web browser to run the simulation.

## Overview

The simulator uses **RK4 (Runge-Kutta 4th Order)** numerical integration to estimate the voltage, individual component currents, and stored energy in the system across 1000 sample periods dynamically recalculating live whenever the circuit values change.

### Damping Conditions

- **ζ (Zeta)**: The Damping Ratio.
  - **Underdamped ($ζ < 1$)**: The system oscillates with gradually decreasing amplitude.
  - **Critically Damped ($ζ = 1$)**: The system returns to steady state as fast as possible without oscillating.
  - **Overdamped ($ζ > 1$)**: The system returns to steady state without oscillating, but slower than if it were critically damped.

### Formulas

**Series RLC:**
- $τ = 2L/R$
- $ω_n = 1 / \sqrt{LC}$
- $ζ = (R / 2) * \sqrt{C / L}$

**Parallel RLC:**
- $τ = 2RC$
- $ω_n = 1 / \sqrt{LC}$
- $ζ = 1 / (2R \sqrt{C/L})$
