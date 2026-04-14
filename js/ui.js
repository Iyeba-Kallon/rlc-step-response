/**
 * User Interface Controller: ui.js
 * 
 * Handles all Document events, reading input values from the sliders, toggling
 * the application state between Series & Parallel modes, and updating the Information Bar.
 */
const UI = {
    isSeries: true,          // Determines our current physical topology
    onChangeCallback: null,  // Hook called whenever the user touches a slider or button

    /**
     * Attaches all click, input, and theme event listeners once the DOM is ready.
     * 
     * @param {Function} onChangeCallback - Executed anytime state mutates.
     */
    init: function(onChangeCallback) {
        this.onChangeCallback = onChangeCallback;
        
        // 1. Setup Topology Toggles
        document.getElementById('btn-series').addEventListener('click', () => this.setTopology(true));
        document.getElementById('btn-parallel').addEventListener('click', () => this.setTopology(false));
        
        // 2. Setup Value Sliders
        const sliders = ['val-r', 'val-l', 'val-c', 'val-vin'];
        
        sliders.forEach(sliderId => {
            const el = document.getElementById(sliderId);
            el.addEventListener('input', (e) => {
                // Update the small visual readout label above each slider
                const badgeId = 'label-' + sliderId.split('-')[1];
                document.getElementById(badgeId).innerText = e.target.value;
                
                // Immediately ask the orchestrator to crunch new math and repaint
                if (this.onChangeCallback) {
                    this.onChangeCallback();
                }
            });
        });

        // 3. Listen to OS Theme Preferences directly (live sync)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            ChartManager.updateThemeColors();
        });
    },

    /**
     * Swaps the active topology layout and immediately runs the new formula.
     * 
     * @param {Boolean} isSeriesMode - True for Series, False for Parallel
     */
    setTopology: function(isSeriesMode) {
        this.isSeries = isSeriesMode;
        
        const btnSeries = document.getElementById('btn-series');
        const btnParallel = document.getElementById('btn-parallel');
        
        if (isSeriesMode) {
            btnSeries.classList.add('active');
            btnParallel.classList.remove('active');
            
            // Adjust input source labels (Series runs off a Voltage Source Step)
            document.getElementById('amp-sym').innerText = 'Vin';
            document.getElementById('amp-unit').innerText = 'V';
            
            // Update Canvas Legends natively
            ChartManager.voltageChart.data.datasets[0].label = 'Capacitor Voltage v_c(t) (V)';
            ChartManager.currentChart.data.datasets[0].label = 'Circuit Current i(t) (A)';
            
        } else {
            btnParallel.classList.add('active');
            btnSeries.classList.remove('active');
            
            // Adjust input source labels (Parallel usually runs off an Ideal Current Source)
            document.getElementById('amp-sym').innerText = 'Iin';
            document.getElementById('amp-unit').innerText = 'A';
            
            // Update Canvas Legends natively
            ChartManager.voltageChart.data.datasets[0].label = 'Circuit Voltage v(t) (V)';
            ChartManager.currentChart.data.datasets[0].label = 'Inductor Current i_L(t) (A)';
        }
        
        // Re-simulate with new mathematics
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    },

    /**
     * Grabs the real-world SI values presently represented by the HTML sliders.
     * 
     * @returns {Object} Extracted R (Ohms), L (Henrys), C (Farads), and Amp (Volts/Amperes)
     */
    getValues: function() {
        return {
            R: parseFloat(document.getElementById('val-r').value),
            L: parseFloat(document.getElementById('val-l').value) / 1000,    // Slider is mH, convert to H
            C: parseFloat(document.getElementById('val-c').value) / 1000000, // Slider is uF, convert to F
            Amp: parseFloat(document.getElementById('val-vin').value)        // Step amplitude directly
        };
    },

    /**
     * Updates the lower-left metadata box dynamically displaying our math variables.
     * 
     * @param {Object} params - The current ωn, ζ, and ωd.
     * @param {String} conditionLabel - E.g. "Critically Damped", "Underdamped"
     */
    updateInfoBar: function(params, conditionLabel) {
        document.getElementById('out-zeta').innerText = params.zeta.toFixed(4);
        document.getElementById('out-wn').innerHTML = params.wn.toFixed(2) + ' <small>rad/s</small>';
        document.getElementById('out-wd').innerHTML = params.wd.toFixed(2) + ' <small>rad/s</small>';
        
        // Color code the damping condition badge using custom CSS classes
        const badge = document.getElementById('out-condition');
        badge.innerText = conditionLabel;
        badge.classList.remove('under', 'over', 'critical');
        
        if (conditionLabel === 'Underdamped') {
            badge.classList.add('under');
        } else if (conditionLabel === 'Overdamped') {
            badge.classList.add('over');
        } else {
            badge.classList.add('critical');
        }
    }
};
