const backendURL = "https://script.google.com/macros/s/AKfycbwl76IRcvdgC5sg1tmyg3yQEXBjn1ELcY-rhIjP68D9NDDc67N3XN28DD4bAIwMELEx/exec"; 

async function fetchStats() {
    try {
        const response = await fetch(backendURL);
        const data = await response.json();
        
        if (data && data.length > 0) {
            processData(data);
        } else {
            document.getElementById('loading-msg').innerText = "No data available yet.";
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('loading-msg').innerText = "Error loading statistics. Please try again later.";
    }
}

function processData(data) {
    let totalScore = 0;
    let highest = { score: -1, major: "" };
    let lowest = { score: 101, major: "" };
    
    // Object to hold dates and scores for the chart
    const dailyScores = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    data.forEach(entry => {
        // Assume headers in Sheet are: Date, Score, Birth Year, Major
        const score = parseInt(entry.Score);
        if (isNaN(score)) return;

        // Overall Stats
        totalScore += score;
        
        if (score > highest.score) {
            highest.score = score;
            highest.major = entry.Major || "Not specified";
        }
        
        if (score < lowest.score) {
            lowest.score = score;
            lowest.major = entry.Major || "Not specified";
        }

        // Chart Data formatting (group by date)
        const dateObj = new Date(entry.Date);
        if (dateObj >= thirtyDaysAgo) {
            // Format as YYYY-MM-DD
            const dateString = dateObj.toISOString().split('T')[0]; 
            if (!dailyScores[dateString]) {
                dailyScores[dateString] = { sum: 0, count: 0 };
            }
            dailyScores[dateString].sum += score;
            dailyScores[dateString].count += 1;
        }
    });

    // Calculate Averages
    const avgScore = Math.floor(totalScore / data.length);
    
    // Update DOM
    document.getElementById('avg-score').innerText = avgScore;
    document.getElementById('high-score').innerText = highest.score;
    document.getElementById('high-major').innerText = `Major: ${highest.major}`;
    document.getElementById('low-score').innerText = lowest.score;
    document.getElementById('low-major').innerText = `Major: ${lowest.major}`;

    // Hide loading, show dashboard
    document.getElementById('loading-msg').classList.add('hidden');
    document.getElementById('dashboard-content').classList.remove('hidden');

    // Draw Chart
    drawChart(dailyScores);
}

function drawChart(dailyScores) {
    // Sort dates chronologically
    const sortedDates = Object.keys(dailyScores).sort();
    
    const labels = [];
    const chartData = [];

    // helper: "2026-04-27" -> "4/27"
    const formatLabelMD = (yyyyMmDd) => {
        const [y, m, d] = yyyyMmDd.split('-').map(Number);
        return `${m}/${d}`;
    };
    
    sortedDates.forEach(date => {
        labels.push(formatLabelMD(date));
        chartData.push(Math.floor(dailyScores[date].sum / dailyScores[date].count));
    });

    const ctx = document.getElementById('scoreChart').getContext('2d');
    
    // Check if chart already exists to avoid canvas overlap
    if(window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Score',
                data: chartData,
                // borderColor: '#0e91e3', // UF Blue
                backgroundColor: 'rgba(14, 145, 227, 0.2)',
                borderWidth: 0,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#fa8334', // UF Orange
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 0,
                    suggestedMax: 100,
                    grid: { color: '#555' },
                    ticks: { color: '#fff' }
                },
                x: {
                    grid: { color: '#555' },
                    ticks: { color: '#fff' }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff' } },

                // Force tooltip hover title to match simplified date label
                tooltip: {
                    callbacks: {
                        title: (items) => items?.[0]?.label ?? ""
                    }
                }
            }
        }
    });
}

// Start fetching when page loads
fetchStats();
