// UI logic, event listeners

const UI = {
    isSeries: true,
    onChangeCb: null,

    init: function(onChangeCallback) {
        this.onChangeCb = onChangeCallback;
        
        // Listeners for toggle
        document.getElementById('btn-series').addEventListener('click', () => this.setTopology(true));
        document.getElementById('btn-parallel').addEventListener('click', () => this.setTopology(false));
        
        // Listeners for sliders
        const sliders = ['val-r', 'val-l', 'val-c', 'val-vin'];
        sliders.forEach(id => {
            const el = document.getElementById(id);
            el.addEventListener('input', (e) => {
                const badgeId = 'label-' + id.split('-')[1];
                document.getElementById(badgeId).innerText = e.target.value;
                if (this.onChangeCb) this.onChangeCb();
            });
        });

        // Theme listener for charts
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',() => {
            ChartManager.updateThemeColors();
        });
    },

    setTopology: function(series) {
        this.isSeries = series;
        if (series) {
            document.getElementById('btn-series').classList.add('active');
            document.getElementById('btn-parallel').classList.remove('active');
            document.getElementById('amp-sym').innerText = 'Vin';
            document.getElementById('amp-unit').innerText = 'V';
            ChartManager.vChart.data.datasets[0].label = 'Capacitor Voltage v_c(t) (V)';
            ChartManager.iChart.data.datasets[0].label = 'Circuit Current i(t) (A)';
        } else {
            document.getElementById('btn-parallel').classList.add('active');
            document.getElementById('btn-series').classList.remove('active');
            document.getElementById('amp-sym').innerText = 'Iin';
            document.getElementById('amp-unit').innerText = 'A';
            ChartManager.vChart.data.datasets[0].label = 'Circuit Voltage v(t) (V)';
            ChartManager.iChart.data.datasets[0].label = 'Inductor Current i_L(t) (A)';
        }
        if (this.onChangeCb) this.onChangeCb();
    },

    getValues: function() {
        return {
            R: parseFloat(document.getElementById('val-r').value),
            L: parseFloat(document.getElementById('val-l').value) / 1000, // convert mH to H
            C: parseFloat(document.getElementById('val-c').value) / 1000000, // convert uF to F
            Amp: parseFloat(document.getElementById('val-vin').value)
        };
    },

    updateInfoBar: function(params, condition) {
        document.getElementById('out-zeta').innerText = params.zeta.toFixed(4);
        document.getElementById('out-wn').innerHTML = params.wn.toFixed(2) + ' <small>rad/s</small>';
        document.getElementById('out-wd').innerHTML = params.wd.toFixed(2) + ' <small>rad/s</small>';
        
        const badge = document.getElementById('out-condition');
        badge.innerText = condition;
        
        badge.classList.remove('under', 'over', 'critical');
        if (condition === 'Underdamped') badge.classList.add('under');
        else if (condition === 'Overdamped') badge.classList.add('over');
        else badge.classList.add('critical');
    }
};
