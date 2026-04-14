/**
 * Physics and Mathematics Engine: rlc.js
 * 
 * This module is responsible for solving the second-order differential equations
 * that govern Series and Parallel RLC circuits. We use the Runge-Kutta 4th Order (RK4)
 * numerical integration method to simulate the step response over time.
 */
const RLC = {
    /**
     * Solves a system of ordinary differential equations (ODEs) using the RK4 method.
     * 
     * @param {Function} f - The derivative function returning [dy1/dt, dy2/dt].
     * @param {Array} y0 - Initial state values [y1(0), y2(0)].
     * @param {Number} t0 - Start time (seconds).
     * @param {Number} tEnd - End time (seconds).
     * @param {Number} steps - Number of discrete calculation steps.
     * @returns {Object} Arrays containing the timeline 't', and state variables 'y1' and 'y2'.
     */
    solveRK4: function(f, y0, t0, tEnd, steps) {
        const h = (tEnd - t0) / steps; // Time step size (dt)
        const result = { t: [], y1: [], y2: [] };
        
        let t = t0;
        let y = [...y0];
        
        for (let i = 0; i <= steps; i++) {
            // Record current state before calculating the next step
            result.t.push(t);
            result.y1.push(y[0]);
            result.y2.push(y[1]);
            
            // RK4 calculations: evaluating slopes at 4 different points across the time step
            const k1 = f(t, y);
            
            const y_k2 = [y[0] + 0.5 * h * k1[0], y[1] + 0.5 * h * k1[1]];
            const k2 = f(t + 0.5 * h, y_k2);
            
            const y_k3 = [y[0] + 0.5 * h * k2[0], y[1] + 0.5 * h * k2[1]];
            const k3 = f(t + 0.5 * h, y_k3);
            
            const y_k4 = [y[0] + h * k3[0], y[1] + h * k3[1]];
            const k4 = f(t + h, y_k4);
            
            // Calculate next state by computing the weighted average of the slopes
            y[0] += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
            y[1] += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
            
            // Move time forward
            t += h;
        }
        
        return result;
    },

    /**
     * Simulates a Series RLC Circuit.
     * 
     * @param {Number} R - Resistance (Ω)
     * @param {Number} L - Inductance (H)
     * @param {Number} C - Capacitance (F)
     * @param {Number} Amp - Step amplitude or Sine peak (V)
     * @param {Object} options - { isSine: boolean, freq: number }
     */
    simulateSeries: function(R, L, C, Amp, options = { isSine: false, freq: 60 }) {
        const wn = 1 / Math.sqrt(L * C);
        const zeta = (R / 2) * Math.sqrt(C / L);
        const wd = zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0;
        
        // Time constant and simulation window
        const tau = R > 0 ? 2 * L / R : 1 / wn; 
        const totalSimTime = options.isSine ? Math.min(0.2, 10 / options.freq) : 5 * tau;
        
        const f = (t, y) => {
            const vSource = options.isSine ? Amp * Math.sin(2 * Math.PI * options.freq * t) : Amp;
            const dVc_dt = y[1] / C;
            const di_dt = (vSource - (R * y[1]) - y[0]) / L;
            return [dVc_dt, di_dt];
        };
        
        const simulation = this.solveRK4(f, [0, 0], 0, totalSimTime, 1000);
        const steadyState = options.isSine ? 0 : Amp;
        const ts = options.isSine ? 0 : this.calculateSettlingTime(simulation.t, simulation.y1, steadyState);
        
        return {
            t: simulation.t.map(sec => sec * 1000),
            v: simulation.y1,
            i: simulation.y2,
            el: simulation.y2.map(i => 0.5 * L * i * i),
            ec: simulation.y1.map(v => 0.5 * C * v * v),
            steadyState,
            ts,
            params: { wn, zeta, wd }
        };
    },

    /**
     * Simulates a Parallel RLC Circuit.
     * 
     * @param {Number} R - Resistance (Ω)
     * @param {Number} L - Inductance (H)
     * @param {Number} C - Capacitance (F)
     * @param {Number} Amp - Step current or Sine peak (A)
     * @param {Object} options - { isSine: boolean, freq: number }
     */
    simulateParallel: function(R, L, C, Amp, options = { isSine: false, freq: 60 }) {
        const wn = 1 / Math.sqrt(L * C);
        // Corrected formula: 1 / (2R) * sqrt(L/C)
        const zeta = R > 0 ? (1 / (2 * R)) * Math.sqrt(L / C) : Infinity;
        const wd = zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0;
        
        const tau = R > 0 ? 2 * R * C : 1 / wn;
        const effectiveTau = Math.min(tau, 10 / wn); 
        const totalSimTime = options.isSine ? Math.min(0.2, 10 / options.freq) : 5 * effectiveTau;
        
        const f = (t, y) => {
            const iSource = options.isSine ? Amp * Math.sin(2 * Math.PI * options.freq * t) : Amp;
            const diL_dt = y[1] / L;
            const dV_dt = (iSource - (y[1] / (R || 1e-9)) - y[0]) / C;
            return [diL_dt, dV_dt];
        };
        
        const simulation = this.solveRK4(f, [0, 0], 0, totalSimTime, 1000);
        const steadyState = options.isSine ? 0 : Amp * R;
        const ts = options.isSine ? 0 : this.calculateSettlingTime(simulation.t, simulation.y2, steadyState);
        
        return {
            t: simulation.t.map(sec => sec * 1000),
            v: simulation.y2,
            iL: simulation.y1,
            el: simulation.y1.map(iL => 0.5 * L * iL * iL),
            ec: simulation.y2.map(v => 0.5 * C * v * v),
            steadyState,
            ts,
            params: { wn, zeta, wd }
        };
    },

    /**
     * Calculates 2% settling time.
     */
    calculateSettlingTime: function(t, data, target) {
        if (target === 0 || isNaN(target)) return 0;
        const tolerance = 0.02 * Math.abs(target);
        
        // Find the last index where the data is outside the tolerance band
        let lastIndex = -1;
        for (let i = data.length - 1; i >= 0; i--) {
            if (Math.abs(data[i] - target) > tolerance) {
                lastIndex = i;
                break;
            }
        }
        
        return lastIndex === -1 ? 0 : t[lastIndex] * 1000;
    },

    /**
     * General Frequency Response Magnitude: |H(jω)|
     */
    calculateFrequencyResponse: function(R, L, C, isSeries) {
        const points = [];
        const wn = 1 / Math.sqrt(L * C);
        const zeta = isSeries ? (R / 2) * Math.sqrt(C / L) : (1 / (2 * R)) * Math.sqrt(L / C);
        
        // Logarithmic sweep from 0.1 * wn to 10 * wn
        for (let i = 0; i <= 200; i++) {
            const w = 0.1 * wn * Math.pow(100, i / 200);
            const u = w / wn; // normalized frequency
            
            // For Series Vc/Vin or Parallel V/(Iin*R)
            // H(s) = wn^2 / (s^2 + 2*zeta*wn*s + wn^2)
            const magnitude = 1 / Math.sqrt(Math.pow(1 - u * u, 2) + Math.pow(2 * zeta * u, 2));
            
            points.push({ x: w / (2 * Math.PI), y: magnitude });
        }
        return points;
    },

    getDampingCondition: function(zeta) {
        if (zeta === Infinity) return "Undamped (Short)";
        if (Math.abs(zeta - 1) < 0.01) return "Critically Damped";
        if (zeta < 1) return "Underdamped";
        return "Overdamped";
    }
};
