document.addEventListener("DOMContentLoaded", () => {
    ChartManager.init();
    
    setTimeout(() => { 
        ChartManager.updateThemeColors();
    }, 50);

    const runSimulationExecutionLoop = () => {
        const physics = UI.getValues();
        const options = { isSine: UI.isSine, freq: physics.Freq };

        if (UI.currentTab === 'time') {
            const res = UI.isSeries 
                ? RLC.simulateSeries(physics.R, physics.L, physics.C, physics.Amp, options)
                : RLC.simulateParallel(physics.R, physics.L, physics.C, physics.Amp, options);
            
            const condition = RLC.getDampingCondition(res.params.zeta);
            UI.updateInfoBar(res.params, condition, res.ts);
            ChartManager.updateTimeDomain(res);
        } else {
            // Frequency Domain
            const points = RLC.calculateFrequencyResponse(physics.R, physics.L, physics.C, UI.isSeries);
            const zeta = UI.isSeries ? (physics.R/2)*Math.sqrt(physics.C/physics.L) : (1/(2*physics.R))*Math.sqrt(physics.L/physics.C);
            const wn = 1/Math.sqrt(physics.L*physics.C);
            const wd = zeta < 1 ? wn * Math.sqrt(1-zeta*zeta) : 0;
            
            UI.updateInfoBar({wn, zeta, wd}, RLC.getDampingCondition(zeta), 0);
            ChartManager.updateFreqDomain(points);
        }
    };

    UI.init(runSimulationExecutionLoop);
    runSimulationExecutionLoop();
});
