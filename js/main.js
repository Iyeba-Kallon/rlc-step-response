/**
 * Primary Controller / Orchestrator: main.js
 * 
 * Interlinks the UI interactions, the RLC Math Engine, and the Chart Manager 
 * into a single unified execution loop.
 */
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Boot up the individual sub-modules
    ChartManager.init();
    
    // Add brief micro-delay so the charts finish mounting to the DOM
    // before we query CSS variables to style them
    setTimeout(() => { 
        ChartManager.updateThemeColors();
    }, 50);

    /**
     * Single Source of Truth for generating an iteration on the platform.
     * It reads values > feeds them into to math engine > feeds data into UI.
     */
    const runSimulationExecutionLoop = () => {
        
        // Pull live parameters
        const physicalVariables = UI.getValues();
        let engineResult;

        // Dispatch differential equations based on what topology the user is viewing
        if (UI.isSeries) {
            engineResult = RLC.simulateSeries(
                physicalVariables.R, 
                physicalVariables.L, 
                physicalVariables.C, 
                physicalVariables.Amp
            );
        } else {
            engineResult = RLC.simulateParallel(
                physicalVariables.R, 
                physicalVariables.L, 
                physicalVariables.C, 
                physicalVariables.Amp
            );
        }

        // Fetch user-friendly string (Underdamped, Overdamped, etc)
        const conditionText = RLC.getDampingCondition(engineResult.params.zeta);
        
        // Visually update Information Panel
        UI.updateInfoBar(engineResult.params, conditionText);

        // Update the Chart.js canvasses depending on available axes
        if (UI.isSeries) {
            ChartManager.update(
                engineResult.t, 
                engineResult.v, 
                engineResult.i, 
                engineResult.el, 
                engineResult.ec
            );
        } else {
            ChartManager.update(
                engineResult.t, 
                engineResult.v, 
                engineResult.iL,  // Using internal inductor current for parallel viewing
                engineResult.el, 
                engineResult.ec
            );
        }
    };

    // 2. Hydrate listeners, attaching our generalized execution loop
    UI.init(runSimulationExecutionLoop);
    
    // 3. Immediately invoke on startup to populate charts 
    runSimulationExecutionLoop();
});
