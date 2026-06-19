let chartInstance = null;

export function renderPieChart(principalAmount, interestAmount) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Основной долг', 'Проценты'],
            datasets: [{
                data: [principalAmount, interestAmount],
                backgroundColor: ['#3b82f6', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(2)} ₽`
                    }
                }
            }
        }
    });
}