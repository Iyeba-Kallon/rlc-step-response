/**
 * User Interface Controller: ui.js
 * 
 * Handles all Document events, reading input values from the sliders, toggling
 * the application state between Series & Parallel modes, and updating the Information Bar.
 */
const UI = {
    isSeries: true,
    isSine: false,
    currentTab: 'time',
    onChangeCallback: null,

    init: function(onChangeCallback) {
        this.onChangeCallback = onChangeCallback;
        
        // Tab switching
        const tabs = ['tab-time', 'tab-freq'];
        tabs.forEach(id => {
            document.getElementById(id).addEventListener('click', () => {
                this.currentTab = id.split('-')[1];
                document.querySelectorAll('.tab-group button').forEach(b => b.classList.toggle('active', b.id === id));
                document.querySelectorAll('.charts-container').forEach(c => c.classList.toggle('active', c.id === 'view-' + this.currentTab));
                if (this.onChangeCallback) this.onChangeCallback();
                if (window.ChartManager) window.ChartManager.updateThemeColors();
            });
        });

        // Topology toggle
        document.getElementById('btn-series').addEventListener('click', () => this.setTopology(true));
        document.getElementById('btn-parallel').addEventListener('click', () => this.setTopology(false));
        
        // Source Mode toggle
        document.getElementById('mode-step').addEventListener('click', () => this.setSourceMode(false));
        document.getElementById('mode-sine').addEventListener('click', () => this.setSourceMode(true));

        // Sliders
        const sliders = ['val-r', 'val-l', 'val-c', 'val-vin', 'val-f'];
        sliders.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('input', (e) => {
                const badgeId = 'label-' + id.split('-')[1];
                document.getElementById(badgeId).innerText = e.target.value;
                if (this.onChangeCallback) this.onChangeCallback();
            });
        });

        this.updateDiagram();
    },

    setTopology: function(isSeries) {
        this.isSeries = isSeries;
        document.getElementById('btn-series').classList.toggle('active', isSeries);
        document.getElementById('btn-parallel').classList.toggle('active', !isSeries);
        
        document.getElementById('amp-sym').innerText = isSeries ? 'Vin' : 'Iin';
        document.getElementById('amp-unit').innerText = isSeries ? 'V' : 'A';
        
        this.updateDiagram();
        if (this.onChangeCallback) this.onChangeCallback();
    },

    setSourceMode: function(isSine) {
        this.isSine = isSine;
        document.getElementById('mode-step').classList.toggle('active', !isSine);
        document.getElementById('mode-sine').classList.toggle('active', isSine);
        document.getElementById('freq-control').classList.toggle('hidden', !isSine);
        
        if (this.onChangeCallback) this.onChangeCallback();
    },

    updateDiagram: function() {
        const container = document.getElementById('circuit-diagram');
        // Simple SVG Schematics
        const seriesSVG = `<svg viewBox="0 0 100 40" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M0 20 h10 m0 -5 v10 m5 -10 v10 m5 -5 h5 m0 -5 v10 l3 -10 l3 10 l3 -10 l3 10 v-5 h5 m0 -5 v2 h2 v-2 h2 v2 h2 v-2 h2 v2 m2 -2 h10" />
            <circle cx="10" cy="20" r="1.5" /><circle cx="90" cy="20" r="1.5" />
            <text x="15" y="10" font-size="5" fill="currentColor">V</text>
            <text x="40" y="10" font-size="5" fill="currentColor">R</text>
            <text x="60" y="10" font-size="5" fill="currentColor">L</text>
            <text x="80" y="10" font-size="5" fill="currentColor">C</text>
        </svg>`;
        const parallelSVG = `<svg viewBox="0 0 100 60" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M5 30 h15 M20 10 v40 M20 10 h60 M20 50 h60 M40 10 v15 l3 5 l-3 5 v15 M60 10 v15 c3 0 3 5 0 5 s-3 5 0 5 c3 0 3 5 0 5 v10 M80 10 v18 h6 v-6 h-6 v6 M80 32 v18" />
            <text x="5" y="25" font-size="5" fill="currentColor">I</text>
            <text x="45" y="30" font-size="5" fill="currentColor">R</text>
            <text x="65" y="30" font-size="5" fill="currentColor">L</text>
            <text x="85" y="30" font-size="5" fill="currentColor">C</text>
        </svg>`;
        container.innerHTML = this.isSeries ? seriesSVG : parallelSVG;
    },

    getValues: function() {
        return {
            R: parseFloat(document.getElementById('val-r').value),
            L: parseFloat(document.getElementById('val-l').value) / 1000,
            C: parseFloat(document.getElementById('val-c').value) / 1000000,
            Amp: parseFloat(document.getElementById('val-vin').value),
            Freq: parseFloat(document.getElementById('val-f').value)
        };
    },

    updateInfoBar: function(params, condition, ts) {
        document.getElementById('out-zeta').innerText = (params.zeta === Infinity) ? "∞" : params.zeta.toFixed(4);
        document.getElementById('out-wn').innerHTML = params.wn.toFixed(2) + ' <small>rad/s</small>';
        document.getElementById('out-wd').innerHTML = params.zeta < 1 ? params.wd.toFixed(2) + ' <small>rad/s</small>' : "N/A";
        document.getElementById('out-ts').innerHTML = this.isSine ? "N/A" : ts.toFixed(2) + ' <small>ms</small>';
        
        const badge = document.getElementById('out-condition');
        badge.innerText = condition;
        badge.className = 'badge ' + (condition.toLowerCase().includes('under') ? 'under' : condition.toLowerCase().includes('over') ? 'over' : 'critical');
    }
};
