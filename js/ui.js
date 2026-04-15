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
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('click', () => {
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

            // Initialize fill percentage
            this.updateSliderFill(el);

            el.addEventListener('input', (e) => {
                const val = e.target.value;
                const badgeId = 'label-' + id.split('-')[1];
                document.getElementById(badgeId).innerText = val;
                this.updateSliderFill(e.target);
                if (this.onChangeCallback) this.onChangeCallback();
            });
        });

        this.updateDiagram();
    },

    updateSliderFill: function(el) {
        const min = el.min || 0;
        const max = el.max || 100;
        const val = el.value;
        const percentage = (val - min) / (max - min) * 100;
        el.style.backgroundSize = percentage + '% 100%';
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
        // Elegant SVG Schematics with clean lines
        const seriesSVG = `<svg viewBox="-5 0 110 40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <defs>
                <filter id="glow"><feGaussianBlur stdDeviation="1" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <path d="M0 20 h10" filter="url(#glow)"/>
            <circle cx="12" cy="20" r="3" stroke-width="1.2" />
            <path d="M11 18 l2 4 M13 18 l-2 4" stroke-width="1" />
            <path d="M15 20 h10" />
            <!-- Resistor -->
            <path d="M25 20 l2 -4 l4 8 l4 -8 l4 8 l4 -8 l2 4" />
            <path d="M45 20 h5" />
            <!-- Inductor -->
            <path d="M50 20 c0 -6 4 -6 4 0 s4 6 4 0 s4 -6 4 0 s4 6 4 0" />
            <path d="M66 20 h5" />
            <!-- Capacitor -->
            <path d="M71 12 v16 M76 12 v16" />
            <path d="M76 20 h10" />
            <circle cx="89" cy="20" r="3" stroke-width="1.2" />
            <path d="M92 20 h8" />
            
            <text x="10" y="32" font-size="6" fill="currentColor" font-family="Outfit" font-weight="600">V_in</text>
            <text x="32" y="10" font-size="6" fill="currentColor" font-family="Outfit" font-weight="600">R</text>
            <text x="56" y="10" font-size="6" fill="currentColor" font-family="Outfit" font-weight="600">L</text>
            <text x="71" y="10" font-size="6" fill="currentColor" font-family="Outfit" font-weight="600">C</text>
        </svg>`;

        const parallelSVG = `<svg viewBox="-5 -5 110 70" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M0 30 h10" />
            <circle cx="13" cy="30" r="3" stroke-width="1.2" />
            <path d="M13 28 v4 M11 30 h4" stroke-width="1" />
            <path d="M16 30 h4" />
            <path d="M20 10 v40 M20 10 h65 M20 50 h65" />
            <!-- Resistor -->
            <path d="M40 10 v8 l-4 2 l8 4 l-8 4 l8 4 l-8 4 l4 2 v8" />
            <!-- Inductor -->
            <path d="M62 10 v5 c-6 0 -6 4 0 4 s6 4 0 4 s-6 4 0 4 s6 4 0 4 v5" />
            <!-- Capacitor -->
            <path d="M85 10 v13 h-6 v0 h12 M79 27 h12 v0 h-6 v13" />
            
            <text x="5" y="42" font-size="7" fill="currentColor" font-family="Outfit" font-weight="600">I_in</text>
            <text x="38" y="5" font-size="7" fill="currentColor" font-family="Outfit" font-weight="600">R</text>
            <text x="60" y="5" font-size="7" fill="currentColor" font-family="Outfit" font-weight="600">L</text>
            <text x="83" y="5" font-size="7" fill="currentColor" font-family="Outfit" font-weight="600">C</text>
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
