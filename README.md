A professional-grade, interactive web application for simulating Series and Parallel RLC circuits. Supports both transient step-response and steady-state AC frequency analysis.

## Features

- **RK4 Physics**: High-precision numerical integration for time-domain simulation.
- **AC Mode**: Switch between Step and Sinusoidal excitation.
- **Frequency Response**: Logarithmic Bode magnitude plots ($|H(j\omega)|$ vs $f$).
- **Smart Markers**: Automatic 2% settling time identification and steady-state dashed lines.
- **SVG Schematics**: Live-updating circuit diagrams.
- **Report Ready**: One-click PNG export for all charts.

## Physics Reference

### Damping Conditions
- **ζ < 1 (Underdamped)**: Oscillatory response.
- **ζ = 1 (Critically Damped)**: Fastest non-oscillatory return to steady state.
- **ζ > 1 (Overdamped)**: Sluggish non-oscillatory response.

### Formulas

| Parameter | Series RLC | Parallel RLC |
| :--- | :--- | :--- |
| **Natural Freq (ωn)** | $1 / \sqrt{LC}$ | $1 / \sqrt{LC}$ |
| **Damping Ratio (ζ)** | $(R / 2) \cdot \sqrt{C / L}$ | $1 / (2R) \cdot \sqrt{L / C}$ |
| **Settling Time (ts)** | Time until stays within 2% | Time until stays within 2% |

## How to Run
Simply open `index.html` in any modern web browser. 
No build tools, servers, or installations required.
