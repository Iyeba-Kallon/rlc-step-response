/**
 * Charting System: charts.js
 * 
 * Manages the initialization, theme tracking, and high-performance repainting 
 * of the Chart.js elements with premium neon aesthetics.
 */
const ChartManager = {
    voltageChart: null,
    currentChart: null,
    energyChart: null,
    bodeChart: null,

    init: function() {
        const style = getComputedStyle(document.documentElement);
        const textColor = style.getPropertyValue('--text-main').trim();
        const mutedColor = style.getPropertyValue('--text-muted').trim();
        const gridColor = style.getPropertyValue('--border').trim();

        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400, easing: 'easeOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { 
                    position: 'top',
                    align: 'end',
                    labels: { 
                        color: textColor, 
                        font: { family: 'Outfit', size: 11, weight: '500' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 15
                    } 
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { family: 'Outfit' },
                    bodyFont: { family: 'Inter' },
                    padding: 10,
                    borderColor: gridColor,
                    borderWidth: 1,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Time (ms)', color: mutedColor, font: { family: 'Outfit', weight: '600' } },
                    grid: { color: gridColor, drawTicks: false },
                    ticks: { color: mutedColor, font: { family: 'Inter', size: 10 }, padding: 8 }
                },
                y: {
                    grid: { color: gridColor, drawTicks: false },
                    ticks: { color: mutedColor, font: { family: 'Inter', size: 10 }, padding: 8 }
                }
            }
        };

        // Helper to create gradient
        const createGradient = (ctx, color) => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, color.replace(')', ', 0.2)').replace('rgb', 'rgba'));
            gradient.addColorStop(1, color.replace(')', ', 0)').replace('rgb', 'rgba'));
            return gradient;
        };

        const vColor = style.getPropertyValue('--v-color').trim();
        const iColor = style.getPropertyValue('--i-color').trim();
        const e1Color = style.getPropertyValue('--e1-color').trim();
        const e2Color = style.getPropertyValue('--e2-color').trim();
        const bColor = style.getPropertyValue('--bode-color').trim();

        // Voltage Chart
        this.voltageChart = new Chart(document.getElementById('chart-voltage').getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Voltage (V)', borderColor: vColor, backgroundColor: (ctx) => createGradient(ctx.chart.ctx, vColor), fill: true, borderWidth: 2.5, pointRadius: 0, tension: 0.1, data: [] },
                    { label: 'Steady State', borderColor: vColor, borderWidth: 1, borderDash: [5, 5], pointRadius: 0, data: [] },
                    { label: 'Settling Time', borderColor: mutedColor, borderWidth: 1, borderDash: [2, 2], pointRadius: 0, data: [] }
                ]
            },
            options: commonOptions
        });

        // Current Chart
        this.currentChart = new Chart(document.getElementById('chart-current').getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Current (A)', borderColor: iColor, backgroundColor: (ctx) => createGradient(ctx.chart.ctx, iColor), fill: true, borderWidth: 2.5, pointRadius: 0, tension: 0.1, data: [] },
                    { label: 'Settling Time', borderColor: mutedColor, borderWidth: 1, borderDash: [2, 2], pointRadius: 0, data: [] }
                ]
            },
            options: commonOptions
        });

        // Energy Chart
        this.energyChart = new Chart(document.getElementById('chart-energy').getContext('2d'), {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Energy L (J)', borderColor: e1Color, borderWidth: 2, pointRadius: 0, data: [] },
                    { label: 'Energy C (J)', borderColor: e2Color, borderWidth: 2, pointRadius: 0, data: [] }
                ]
            },
            options: commonOptions
        });

        // Bode Chart
        this.bodeChart = new Chart(document.getElementById('chart-bode').getContext('2d'), {
            type: 'line',
            data: {
                datasets: [{ label: 'Gain |H(jω)|', borderColor: bColor, backgroundColor: (ctx) => createGradient(ctx.chart.ctx, bColor), fill: true, borderWidth: 3, pointRadius: 0, tension: 0.3, data: [] }]
            },
            options: {
                ...commonOptions,
                scales: {
                    x: {
                        type: 'logarithmic',
                        title: { display: true, text: 'Frequency (Hz)', color: mutedColor, font: { family: 'Outfit', weight: '600' } },
                        grid: { color: gridColor },
                        ticks: { color: mutedColor, font: { family: 'Inter', size: 10 }, callback: (val) => val >= 1 ? val : val.toFixed(1) }
                    },
                    y: {
                        title: { display: true, text: 'Magnitude', color: mutedColor, font: { family: 'Outfit', weight: '600' } },
                        grid: { color: gridColor },
                        ticks: { color: mutedColor, font: { family: 'Inter', size: 10 } }
                    }
                }
            }
        });
    },

    updateThemeColors: function() {
        const style = getComputedStyle(document.documentElement);
        const textColor = style.getPropertyValue('--text-main').trim();
        const mutedColor = style.getPropertyValue('--text-muted').trim();
        const gridColor = style.getPropertyValue('--border').trim();

        [this.voltageChart, this.currentChart, this.energyChart, this.bodeChart].forEach(chart => {
            if (!chart) return;
            chart.options.plugins.legend.labels.color = textColor;
            chart.options.scales.x.title.color = mutedColor;
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.x.ticks.color = mutedColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.y.ticks.color = mutedColor;
            chart.update('none');
        });
    },

    updateTimeDomain: function(res) {
        const { t, v, i, el, ec, steadyState, ts } = res;
        const pts = (arr) => arr.map((val, idx) => ({ x: t[idx], y: val }));

        this.voltageChart.data.datasets[0].data = pts(v);
        this.voltageChart.data.datasets[1].data = steadyState !== 0 ? [{x: t[0], y: steadyState}, {x: t[t.length-1], y: steadyState}] : [];
        this.voltageChart.data.datasets[2].data = (ts > 0) ? [{x: ts, y: 0}, {x: ts, y: Math.max(...v, steadyState) * 1.1}] : [];
        this.voltageChart.update('none');

        this.currentChart.data.datasets[0].data = pts(i || res.iL);
        this.currentChart.data.datasets[1].data = (ts > 0) ? [{x: ts, y: 0}, {x: ts, y: Math.max(...(i || res.iL)) * 1.1}] : [];
        this.currentChart.update('none');

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
