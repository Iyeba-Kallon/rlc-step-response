/**
 * Charting System: charts.js
 * 
 * Manages the initialization, theme tracking, and high-performance repainting 
 * of the 3 Chart.js canvas elements displaying Voltage, Current, and Energy.
 */
const ChartManager = {
    // References to the active Chart.js instances
    voltageChart: null,
    currentChart: null,
    energyChart: null,

    /**
     * Constructor: Mounts the charts into the DOM with default settings.
     */
    init: function() {
        // Repeated styling definitions to ensure everything looks premium & clean
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Turned off for fluid, real-time interactivity when sliding
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-main') }
                }
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

        // 1. Voltage Chart Setup
        const ctxV = document.getElementById('chart-voltage').getContext('2d');
        this.voltageChart = new Chart(ctxV, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Voltage (V)',
                    borderColor: '#ef4444', // Tailwind Red-500
                    borderWidth: 2,
                    pointRadius: 0,         // Hide individual data points for pure sweeping line
                    data: []
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, title: { display: true, text: 'Voltage (V)', color: '#94a3b8' } }
                }
            }
        });

        // 2. Current Chart Setup
        const ctxI = document.getElementById('chart-current').getContext('2d');
        this.currentChart = new Chart(ctxI, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Current (A)',
                    borderColor: '#3b82f6', // Tailwind Blue-500
                    borderWidth: 2,
                    pointRadius: 0,
                    data: []
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, title: { display: true, text: 'Current (A)', color: '#94a3b8' } }
                }
            }
        });

        // 3. Energy Component Chart Setup
        const ctxE = document.getElementById('chart-energy').getContext('2d');
        this.energyChart = new Chart(ctxE, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Energy in Inductor (J)',
                        borderColor: '#10b981', // Tailwind Emerald-500
                        borderWidth: 2,
                        pointRadius: 0,
                        data: []
                    },
                    {
                        label: 'Energy in Capacitor (J)',
                        borderColor: '#f59e0b', // Tailwind Amber-500
                        borderWidth: 2,
                        pointRadius: 0,
                        data: []
                    }
                ]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: { ...commonOptions.scales.y, title: { display: true, text: 'Energy (J)', color: '#94a3b8' } }
                }
            }
        });
    },

    /**
     * Re-acquires current CSS custom properties and pushes them into Chart.js elements.
     * Allows seamless hot-switching between Light & Dark modes without refreshing.
     */
    updateThemeColors: function() {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim();
        const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94a3b8';
        const gridColor = 'rgba(148, 163, 184, 0.1)';

        const charts = [this.voltageChart, this.currentChart, this.energyChart];
        
        charts.forEach(chart => {
            if (!chart) return;
            
            // Re-apply theme colors to dynamically generated canvas elements
            chart.options.plugins.legend.labels.color = textColor;
            chart.options.scales.x.title.color = mutedColor;
            chart.options.scales.x.ticks.color = mutedColor;
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.title.color = mutedColor;
            chart.options.scales.y.ticks.color = mutedColor;
            chart.options.scales.y.grid.color = gridColor;
            
            // Request minimal repaint
            chart.update('none');
        });
    },

    /**
     * Blasts new array matrices into the three canvases.
     * Bypasses heavy API recalculations by injecting the array directly.
     * 
     * @param {Array} t - Time instances
     * @param {Array} v - Main Voltage array 
     * @param {Array} i - Main Current array
     * @param {Array} el - Inductive Energy array
     * @param {Array} ec - Capacitive Energy array
     */
    update: function(t, v, i, el, ec) {
        if (!this.voltageChart) return;
        
        // Convert to Chart.js coordinate objects {x, y}
        const vData = new Array(t.length);
        const iData = new Array(t.length);
        const elData = new Array(t.length);
        const ecData = new Array(t.length);
        
        for (let j = 0; j < t.length; j++) {
            vData[j] = { x: t[j], y: v[j] };
            iData[j] = { x: t[j], y: i[j] };
            elData[j] = { x: t[j], y: el[j] };
            ecData[j] = { x: t[j], y: ec[j] };
        }

        // Apply new data arrays and initiate waitless paint 
        this.voltageChart.data.datasets[0].data = vData;
        this.voltageChart.update('none');

        this.currentChart.data.datasets[0].data = iData;
        this.currentChart.update('none');

        this.energyChart.data.datasets[0].data = elData;
        this.energyChart.data.datasets[1].data = ecData;
        this.energyChart.update('none');
    }
};
