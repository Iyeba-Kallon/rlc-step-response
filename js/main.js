// Main orchestration file

document.addEventListener("DOMContentLoaded", () => {
    ChartManager.init();
    
    // Add small delay for charts to size correctly on init
    setTimeout(() => { 
        ChartManager.updateThemeColors();
    }, 50);

    const runSimulation = () => {
        const vals = UI.getValues();
        let result;

        if (UI.isSeries) {
            result = RLC.simulateSeries(vals.R, vals.L, vals.C, vals.Amp);
        } else {
            result = RLC.simulateParallel(vals.R, vals.L, vals.C, vals.Amp);
        }

        const condition = RLC.getDampingCondition(result.params.zeta);
        UI.updateInfoBar(result.params, condition);

        if (UI.isSeries) {
            ChartManager.update(result.t, result.v, result.i, result.el, result.ec);
        } else {
            ChartManager.update(result.t, result.v, result.iL, result.el, result.ec);
        }
    };

    UI.init(runSimulation);
    
    // Initial run
    runSimulation();
});
