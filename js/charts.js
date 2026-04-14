// Chart.js setup and logic

const ChartManager = {
    vChart: null,
    iChart: null,
    eChart: null,

    init: function() {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
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

        const ctxV = document.getElementById('chart-voltage').getContext('2d');
        this.vChart = new Chart(ctxV, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Voltage (V)',
                    borderColor: '#ef4444',
                    borderWidth: 2,
                    pointRadius: 0,
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

        const ctxI = document.getElementById('chart-current').getContext('2d');
        this.iChart = new Chart(ctxI, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Current (A)',
                    borderColor: '#3b82f6',
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

        const ctxE = document.getElementById('chart-energy').getContext('2d');
        this.eChart = new Chart(ctxE, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Energy in Inductor (J)',
                        borderColor: '#10b981',
                        borderWidth: 2,
                        pointRadius: 0,
                        data: []
                    },
                    {
                        label: 'Energy in Capacitor (J)',
                        borderColor: '#f59e0b',
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

    updateThemeColors: function() {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim();
        const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#94a3b8';
        const gridColor = 'rgba(148, 163, 184, 0.1)';

        [this.vChart, this.iChart, this.eChart].forEach(chart => {
            if(!chart) return;
            chart.options.plugins.legend.labels.color = textColor;
            chart.options.scales.x.title.color = mutedColor;
            chart.options.scales.x.ticks.color = mutedColor;
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.title.color = mutedColor;
            chart.options.scales.y.ticks.color = mutedColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.update('none');
        });
    },

    update: function(t, v, i, el, ec) {
        if (!this.vChart) return;
        
        // format data for chart.js [{x, y}]
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

        this.vChart.data.datasets[0].data = vData;
        this.vChart.update('none');

        this.iChart.data.datasets[0].data = iData;
        this.iChart.update('none');

        this.eChart.data.datasets[0].data = elData;
        this.eChart.data.datasets[1].data = ecData;
        this.eChart.update('none');
    }
};
