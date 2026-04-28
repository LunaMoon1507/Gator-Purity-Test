const backendURL = "https://script.google.com/macros/s/AKfycbwl76IRcvdgC5sg1tmyg3yQEXBjn1ELcY-rhIjP68D9NDDc67N3XN28DD4bAIwMELEx/exec"; 
const analyticsState = {
    rawData: [],
    weeklyChartData: null,
    isReady: false
};

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

function getStartOfDay(date) {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
}

function formatLabelMD(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function normalizeChartScore(score) {
    if (!Number.isFinite(score) || score === 0 || score === 100) {
        return 50;
    }

    return score;
}

function initializeAnalyticsMenu() {
    const analyticsSelect = document.getElementById('analytics-select');
    if (!analyticsSelect) return;

    analyticsSelect.addEventListener('change', async () => {
        const selectedOption = analyticsSelect.options[analyticsSelect.selectedIndex];
        const selectedValue = selectedOption?.value || '';
        await renderAnalyticsSelection(selectedValue);
    });
}

function setChartLoading(loadingText, isVisible) {
    const chartLoadingMsg = document.getElementById('chart-loading-msg');
    if (!chartLoadingMsg) return;

    chartLoadingMsg.innerText = loadingText;
    chartLoadingMsg.classList.toggle('hidden', !isVisible);
}

function showChartContainer(isVisible) {
    const chartContainer = document.getElementById('chart-container');
    if (!chartContainer) return;

    chartContainer.classList.toggle('hidden', !isVisible);
}

function setChartTitle(title) {
    const chartTitle = document.getElementById('chart-title');
    if (!chartTitle) return;

    chartTitle.innerText = title;
}

function destroyExistingChart() {
    if (window.myChart) {
        window.myChart.destroy();
    }
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function renderAnalyticsSelection(selection) {
    if (!analyticsState.isReady) return;

    if (!selection) {
        showChartContainer(false);
        setChartLoading('', false);
        destroyExistingChart();
        return;
    }

    setChartLoading('Loading analytics...', true);
    showChartContainer(false);
    await wait(350);

    switch (selection) {
        case 'average-scores-last-30':
            setChartTitle('Average Scores (Last 30 Days)');
            drawAverageScoresChart(analyticsState.weeklyChartData);
            break;
        case 'scores-vs-age':
            setChartTitle('Scores vs. Age');
            drawPlaceholderScoresVsAgeChart();
            break;
        case 'majors-highest':
            setChartTitle('Majors with the Highest Scores');
            drawPlaceholderMajorsHighestChart();
            break;
        case 'majors-lowest':
            setChartTitle('Majors with the Lowest Scores');
            drawPlaceholderMajorsLowestChart();
            break;
        default:
            return;
    }

    setChartLoading('', false);
    showChartContainer(true);
}

function createWeeklyChartData() {
    const today = getStartOfDay(new Date());
    const points = [];

    for (let weeksAgo = 4; weeksAgo >= 0; weeksAgo -= 1) {
        const anchorDate = new Date(today);
        anchorDate.setDate(today.getDate() - (weeksAgo * 7));

        const windowStart = new Date(anchorDate);
        windowStart.setDate(anchorDate.getDate() - 6);

        points.push({
            anchorDate,
            windowStart,
            sum: 0,
            count: 0
        });
    }

    return { points };
}

function processData(data) {
    let totalScore = 0;
    let validCount = 0;
    let highest = { score: -1, major: "" };
    let lowest = { score: 101, major: "" };

    const weeklyChartData = createWeeklyChartData();

    data.forEach(entry => {
        // Assume headers in Sheet are: Date, Score, Birth Year, Major
        const score = parseInt(entry.Score);
        if (isNaN(score) || score === 0 || score === 100) return;

        // Overall Stats
        totalScore += score;
        validCount += 1;
        
        if (score > highest.score) {
            highest.score = score;
            highest.major = entry.Major || "Not specified";
        }
        
        if (score < lowest.score) {
            lowest.score = score;
            lowest.major = entry.Major || "Not specified";
        }

        // Group qualifying scores into five weekly buckets, each ending on an x-axis date.
        const dateObj = new Date(entry.Date);
        if (Number.isNaN(dateObj.getTime())) return;

        const entryDate = getStartOfDay(dateObj);
        weeklyChartData.points.forEach((point) => {
            const isInBucket = entryDate >= point.windowStart && entryDate <= point.anchorDate;

            if (isInBucket) {
                point.sum += score;
                point.count += 1;
            }
        });
    });

    if (validCount === 0) {
        document.getElementById('loading-msg').innerText = "No qualifying data available yet.";
        return;
    }

    // Calculate Averages
    const avgScore = Math.floor(totalScore / validCount);
    
    // Update DOM
    document.getElementById('avg-score').innerText = avgScore;
    document.getElementById('high-score').innerText = highest.score;
    document.getElementById('high-major').innerText = `Major: ${highest.major}`;
    document.getElementById('low-score').innerText = lowest.score;
    document.getElementById('low-major').innerText = `Major: ${lowest.major}`;

    // Hide loading, show dashboard
    document.getElementById('loading-msg').classList.add('hidden');
    document.getElementById('dashboard-content').classList.remove('hidden');

    analyticsState.rawData = data;
    analyticsState.weeklyChartData = weeklyChartData;
    analyticsState.isReady = true;

    // Keep chart hidden until a dropdown selection is made.
    document.getElementById('analytics-select').value = '';
    setChartLoading('', false);
    showChartContainer(false);
}

function getCommonChartOptions() {
    return {
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
            legend: { labels: { color: '#fff' } }
        }
    };
}

function drawAverageScoresChart(weeklyChartData) {
    const labels = weeklyChartData.points.map((point) => formatLabelMD(point.anchorDate));
    const weekRanges = weeklyChartData.points.map((point) => (
        `${formatLabelMD(point.windowStart)} - ${formatLabelMD(point.anchorDate)}`
    ));
    const chartData = weeklyChartData.points.map((point) => {
        const averageScore = point.count > 0 ? Math.floor(point.sum / point.count) : NaN;
        return normalizeChartScore(averageScore);
    });

    const ctx = document.getElementById('scoreChart').getContext('2d');
    
    destroyExistingChart();

    const options = getCommonChartOptions();
    options.plugins.tooltip = {
        callbacks: {
            title: (items) => items?.[0]?.label ?? "",
            label: (context) => {
                const rangeIndex = context.dataIndex;

                const rangeLabel = weekRanges[rangeIndex];
                return rangeLabel
                    ? `Avg Score (${rangeLabel}): ${context.parsed.y}`
                    : `Avg Score: ${context.parsed.y}`;
            }
        }
    };

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Score',
                data: chartData,
                borderColor: '#0e91e3', // UF Blue
                backgroundColor: 'rgba(14, 145, 227, 0.5)',
                borderWidth: 2,
                tension: 0.3,
                spanGaps: false,
                fill: true,
                pointBackgroundColor: '#0e91e3',
                pointBorderColor: '#0e91e3',
                pointRadius: 5
            }]
        },
        options: options
    });
}

function drawPlaceholderScoresVsAgeChart() {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    destroyExistingChart();

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['18-19', '20-21', '22-23', '24+'],
            datasets: [{
                label: 'Average Score',
                data: [54, 58, 61, 56],
                backgroundColor: 'rgba(14, 145, 227, 0.5)',
                borderColor: '#0e91e3',
                borderWidth: 2
            }]
        },
        options: getCommonChartOptions()
    });
}

function drawPlaceholderMajorsHighestChart() {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    destroyExistingChart();

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Engineering', 'Business', 'Biology', 'Psychology'],
            datasets: [{
                label: 'Average Score',
                data: [72, 69, 67, 65],
                backgroundColor: 'rgba(247, 115, 0, 0.5)',
                borderColor: '#f77300',
                borderWidth: 2
            }]
        },
        options: getCommonChartOptions()
    });
}

function drawPlaceholderMajorsLowestChart() {
    const ctx = document.getElementById('scoreChart').getContext('2d');
    destroyExistingChart();

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Math', 'History', 'Chemistry', 'English'],
            datasets: [{
                label: 'Average Score',
                data: [38, 41, 44, 46],
                backgroundColor: 'rgba(14, 145, 227, 0.5)',
                borderColor: '#0e91e3',
                borderWidth: 2
            }]
        },
        options: getCommonChartOptions()
    });
}

// Start fetching when page loads
initializeAnalyticsMenu();
fetchStats();
