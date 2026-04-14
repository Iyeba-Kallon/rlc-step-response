/**
 * Charting System: charts.js
 * 
 * Manages the initialization, theme tracking, and high-performance repainting 
 * of the 3 Chart.js canvas elements displaying Voltage, Current, and Energy.
 */
const ChartManager = {
    voltageChart: null,
    currentChart: null,
    energyChart: null,
    bodeChart: null,

    init: function() {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { color: '#f8fafc', font: { size: 10 } } }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Time (ms)', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                y: {
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        };

        // Voltage Chart
        this.voltageChart = new Chart(document.getElementById('chart-voltage').getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Voltage (V)', borderColor: '#ef4444', borderWidth: 2, pointRadius: 0, data: [] },
                    { label: 'Steady State', borderColor: '#ef4444', borderWidth: 1, borderDash: [5, 5], pointRadius: 0, data: [] },
                    { label: 'Settling Time', borderColor: '#94a3b8', borderWidth: 1, borderDash: [2, 2], pointRadius: 0, data: [] }
                ]
            },
            options: commonOptions
        });

        // Current Chart
        this.currentChart = new Chart(document.getElementById('chart-current').getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Current (A)', borderColor: '#3b82f6', borderWidth: 2, pointRadius: 0, data: [] },
                    { label: 'Settling Time', borderColor: '#94a3b8', borderWidth: 1, borderDash: [2, 2], pointRadius: 0, data: [] }
                ]
            },
            options: commonOptions
        });

        // Energy Chart
        this.energyChart = new Chart(document.getElementById('chart-energy').getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Energy L (J)', borderColor: '#10b981', borderWidth: 2, pointRadius: 0, data: [] },
                    { label: 'Energy C (J)', borderColor: '#f59e0b', borderWidth: 2, pointRadius: 0, data: [] }
                ]
            },
            options: commonOptions
        });

        // Bode Chart (Frequency Response)
        this.bodeChart = new Chart(document.getElementById('chart-bode').getContext('2d'), {
            type: 'line',
            data: {
                datasets: [{ label: 'Gain |H(jω)|', borderColor: '#8b5cf6', borderWidth: 2, pointRadius: 0, data: [] }]
            },
            options: {
                ...commonOptions,
                scales: {
                    x: {
                        type: 'logarithmic',
                        title: { display: true, text: 'Frequency (Hz)', color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8', callback: (val) => val >= 1 ? val : val.toFixed(1) }
                    },
                    y: {
                        title: { display: true, text: 'Magnitude', color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    },

    updateThemeColors: function() {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim();
        const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94a3b8';
        [this.voltageChart, this.currentChart, this.energyChart, this.bodeChart].forEach(chart => {
            if (!chart) return;
            chart.options.plugins.legend.labels.color = textColor;
            chart.options.scales.x.title.color = mutedColor;
            chart.options.scales.x.ticks.color = mutedColor;
            chart.options.scales.y.title.color = mutedColor;
            chart.options.scales.y.ticks.color = mutedColor;
            chart.update('none');
        });
    },

    updateTimeDomain: function(res) {
        const { t, v, i, el, ec, steadyState, ts } = res;
        const pts = (arr) => arr.map((val, idx) => ({ x: t[idx], y: val }));

        // Voltage + Markers
        this.voltageChart.data.datasets[0].data = pts(v);
        this.voltageChart.data.datasets[1].data = steadyState !== 0 ? [{x: t[0], y: steadyState}, {x: t[t.length-1], y: steadyState}] : [];
        this.voltageChart.data.datasets[2].data = (ts > 0) ? [{x: ts, y: 0}, {x: ts, y: Math.max(...v, steadyState)}] : [];
        this.voltageChart.update('none');

        // Current + Markers
        this.currentChart.data.datasets[0].data = pts(i || res.iL);
        this.currentChart.data.datasets[1].data = (ts > 0) ? [{x: ts, y: 0}, {x: ts, y: Math.max(...(i || res.iL))}] : [];
        this.currentChart.update('none');

        // Energy
        this.energyChart.data.datasets[0].data = pts(el);
        this.energyChart.data.datasets[1].data = pts(ec);
        this.energyChart.update('none');
    },

    updateFreqDomain: function(points) {
        this.bodeChart.data.datasets[0].data = points;
        this.bodeChart.update('none');
    },

    exportPNG: function(chartKey) {
        const chartMap = { voltage: this.voltageChart, current: this.currentChart, energy: this.energyChart, bode: this.bodeChart };
        const chart = chartMap[chartKey];
        if (!chart) return;

        const link = document.createElement('a');
        link.download = `rlc_${chartKey}_${Date.now()}.png`;
        link.href = chart.toBase64Image();
        link.click();
    }
};
