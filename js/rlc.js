// Physics, math, ODE solver

const RLC = {
    // RK4 Solver for second order system
    // dy/dt = f(t, y) where y is a vector [y1, y2]
    solveRK4: function(f, y0, t0, tEnd, steps) {
        const h = (tEnd - t0) / steps;
        const result = { t: [], y1: [], y2: [] };
        
        let t = t0;
        let y = [...y0];
        
        for (let i = 0; i <= steps; i++) {
            result.t.push(t);
            result.y1.push(y[0]);
            result.y2.push(y[1]);
            
            const k1 = f(t, y);
            
            const y_k2 = [y[0] + 0.5 * h * k1[0], y[1] + 0.5 * h * k1[1]];
            const k2 = f(t + 0.5 * h, y_k2);
            
            const y_k3 = [y[0] + 0.5 * h * k2[0], y[1] + 0.5 * h * k2[1]];
            const k3 = f(t + 0.5 * h, y_k3);
            
            const y_k4 = [y[0] + h * k3[0], y[1] + h * k3[1]];
            const k4 = f(t + h, y_k4);
            
            y[0] += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
            y[1] += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
            t += h;
        }
        
        return result;
    },

    simulateSeries: function(R, L, C, Vin) {
        // wn = 1 / sqrt(LC)
        const wn = 1 / Math.sqrt(L * C);
        // zeta = (R / 2) * sqrt(C / L)
        const zeta = (R / 2) * Math.sqrt(C / L);
        
        // wd = wn * sqrt(1 - zeta^2) if underdamped
        const wd = zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0;
        
        const tau = 2 * L / R;
        const tEnd = 5 * tau;
        
        // Initial conditions: Vc(0) = 0, i(0) = 0
        // y[0] = Vc, y[1] = i
        const f = (t, y) => {
            const dVc_dt = y[1] / C;
            const di_dt = (Vin - R * y[1] - y[0]) / L;
            return [dVc_dt, di_dt];
        };
        
        const sol = this.solveRK4(f, [0, 0], 0, tEnd, 1000);
        
        // Calculate Energy
        const el = sol.y2.map(i => 0.5 * L * i * i); // 0.5 * L * i^2
        const ec = sol.y1.map(v => 0.5 * C * v * v); // 0.5 * C * v_c^2
        
        return {
            t: sol.t.map(t => t * 1000), // convert to ms
            v: sol.y1,  // capacitor voltage
            i: sol.y2,  // circuit current
            el: el,
            ec: ec,
            params: { wn, zeta, wd }
        };
    },

    simulateParallel: function(R, L, C, Iin) {
        // For parallel RLC
        const wn = 1 / Math.sqrt(L * C);
        // zeta = 1 / (2R * sqrt(C/L)) = 1 / (2 * R * C * wn)
        const zeta = 1 / (2 * R * C * wn);
        
        const wd = zeta < 1 ? wn * Math.sqrt(1 - zeta * zeta) : 0;
        
        const tau = 2 * R * C;
        // In parallel, if R is very large, tau can be huge, limit it for practical viewing
        const effectiveTau = Math.min(tau, 10 / wn); 
        const tEnd = 5 * effectiveTau;
        
        // Initial conditions: IL(0) = 0, V(0) = 0
        // y[0] = iL, y[1] = V
        const f = (t, y) => {
            const diL_dt = y[1] / L;
            const dV_dt = (Iin - y[1] / R - y[0]) / C;
            return [diL_dt, dV_dt];
        };
        
        const sol = this.solveRK4(f, [0, 0], 0, tEnd, 1000);
        
        // Calculate Energy
        const el = sol.y0 ? sol.y0.map(il => 0.5 * L * il * il) : sol.y1.map(il => 0.5 * L * il * il); // oops, y[0] is y1 in sol
        const _el = sol.y1.map(il => 0.5 * L * il * il); 
        const _ec = sol.y2.map(v => 0.5 * C * v * v);
        
        return {
            t: sol.t.map(t => t * 1000), // convert to ms
            v: sol.y2,  // circuit voltage
            i: sol.y2.map(v => v/R + Iin),  // Wait, Iin is step source. Total current from source is Iin. Current through cap iC = C dv/dt.
            // The prompt says "Circuit current i(t) - single line". 
            // In parallel, maybe they mean the total current (Iin), or inductor current (iL).
            // Let's provide I_L for current, as it's the dual to V_C.
            // Wait, "Circuit current i(t)" - I'll plot i_L and label it "Inductor Current".
            iL: sol.y1, 
            el: _el,
            ec: _ec,
            params: { wn, zeta, wd }
        };
    },

    getDampingCondition: function(zeta) {
        if (Math.abs(zeta - 1) < 0.01) return "Critically Damped";
        if (zeta < 1) return "Underdamped";
        return "Overdamped";
    }
};
