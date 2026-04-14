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
     * Simulates a Series RLC Circuit responding to a voltage step input.
     * 
     * @param {Number} R - Resistance in Ohms (Ω)
     * @param {Number} L - Inductance in Henrys (H)
     * @param {Number} C - Capacitance in Farads (F)
     * @param {Number} Vin - Input Step Voltage (V)
     */
    simulateSeries: function(R, L, C, Vin) {
        // Natural frequency (ωn)
        const wn = 1 / Math.sqrt(L * C);
        
        // Damping ratio (ζ)
        const zeta = (R / 2) * Math.sqrt(C / L);
        
        // Damped natural frequency (ωd) - only applies if the system is underdamped
        const wd = zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0;
        
        // Characteristic time constant (τ)
        const tau = 2 * L / R;
        const totalSimTime = 5 * tau; // Simulate until near-steady state
        
        /** 
         * Differential equation for Series RLC:
         * We track: y[0] = Capacitor Voltage (Vc), y[1] = Circuit Current (i)
         * 
         * - Current through a capacitor: i = C * dVc/dt 
         *   => dVc/dt = i / C
         * - Voltage loop (KVL): Vin = L * di/dt + R * i + Vc 
         *   => di/dt = (Vin - R * i - Vc) / L
         */
        const circuitODEs = (t, y) => {
            const current = y[1];
            const capacitorVoltage = y[0];
            
            const dVc_dt = current / C;
            const di_dt = (Vin - (R * current) - capacitorVoltage) / L;
            
            return [dVc_dt, di_dt];
        };
        
        // Initial conditions: Capacitor is completely discharged (0V), and no current is flowing (0A)
        const initialState = [0, 0];
        
        // Run execution (1000 data points for smooth charting)
        const simulation = this.solveRK4(circuitODEs, initialState, 0, totalSimTime, 1000);
        
        // Calculate Energy Stored in the Components
        const energyInductor = simulation.y2.map(i => 0.5 * L * (i * i)); // E_L = 1/2 L i^2
        const energyCapacitor = simulation.y1.map(v => 0.5 * C * (v * v)); // E_C = 1/2 C v^2
        
        return {
            t: simulation.t.map(sec => sec * 1000), // Convert output time to ms for display
            v: simulation.y1,  // Capacitor Voltage
            i: simulation.y2,  // Loop Current
            el: energyInductor,
            ec: energyCapacitor,
            params: { wn, zeta, wd }
        };
    },

    /**
     * Simulates a Parallel RLC Circuit responding to a current step input.
     * 
     * @param {Number} R - Resistance in Ohms (Ω)
     * @param {Number} L - Inductance in Henrys (H)
     * @param {Number} C - Capacitance in Farads (F)
     * @param {Number} Iin - Input Step Current (A)
     */
    simulateParallel: function(R, L, C, Iin) {
        // Natural frequency (ωn)
        const wn = 1 / Math.sqrt(L * C);
        
        // Damping ratio (ζ) - Note the different formula compared to Series RLC
        const zeta = 1 / (2 * R * Math.sqrt(C / L));
        
        // Damped natural frequency (ωd)
        const wd = zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0;
        
        // Time constant (τ) - Also different for parallel
        const tau = 2 * R * C;
        
        // Cap the total sim time so an absurdly large parallel resistance doesn't break the RK4 steps
        const effectiveTau = Math.min(tau, 10 / wn); 
        const totalSimTime = 5 * effectiveTau;
        
        /** 
         * Differential equation for Parallel RLC:
         * We track: y[0] = Inductor Current (iL), y[1] = Node Voltage (V)
         * 
         * - General KCL Equation: Iin = C*dV/dt + V/R + iL
         *   => dV/dt = (Iin - V/R - iL) / C
         * - Voltage across inductor: V = L * diL/dt
         *   => diL/dt = V / L
         */
        const circuitODEs = (t, y) => {
            const inductorCurrent = y[0];
            const systemVoltage = y[1];
            
            const diL_dt = systemVoltage / L;
            const dV_dt = (Iin - (systemVoltage / R) - inductorCurrent) / C;
            
            return [diL_dt, dV_dt];
        };
        
        // Initial conditions: Inductor acts as open (0A), capacitor acts as short (0V)
        const initialState = [0, 0];
        
        const simulation = this.solveRK4(circuitODEs, initialState, 0, totalSimTime, 1000);
        
        // Calculate Stored Energy
        const energyInductor = simulation.y1.map(iL => 0.5 * L * (iL * iL)); 
        const energyCapacitor = simulation.y2.map(v => 0.5 * C * (v * v));
        
        return {
            t: simulation.t.map(sec => sec * 1000), // Convert output time to ms
            v: simulation.y2,  // Main Circuit Voltage
            iL: simulation.y1, // Internal Inductor current
            el: energyInductor,
            ec: energyCapacitor,
            params: { wn, zeta, wd }
        };
    },

    /**
     * Determines the english classification for a given damping ratio.
     * 
     * @param {Number} zeta - The damping ratio
     * @returns {String} Human-readable damping classification
     */
    getDampingCondition: function(zeta) {
        if (Math.abs(zeta - 1) < 0.01) return "Critically Damped";
        if (zeta < 1) return "Underdamped";
        return "Overdamped";
    }
};
