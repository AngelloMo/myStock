let allStocksData = [];
let currentStock = null;
let currentChartTimeframe = 'Daily';
let bubbleChart = null;
let stockChart = null;
let bubbleDates = [];
let currentBubbleDateIndex = 0;
let bubbleAnimationInterval = null;
let stockColors = {};
let animationSpeed = 150;

// Tab Switch Function
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");

    // Reflow charts when switching tabs
    if (tabName === 'bubble-tab' && bubbleChart) bubbleChart.reflow();
    if (tabName === 'analysis-tab' && stockChart) stockChart.reflow();
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('stock.json')
        .then(response => {
            if (!response.ok) throw new Error('stock.json not found.');
            return response.json();
        })
        .then(data => {
            allStocksData = data;
            
            const colors = Highcharts.getOptions().colors;
            allStocksData.filter(s => s.code !== '^NDX').forEach((stock, i) => {
                stockColors[stock.code] = colors[i % colors.length];
            });

            populateStockSelect(allStocksData);

            if (allStocksData.length > 0) {
                const ndxIndex = allStocksData.findIndex(stock => stock.code === '^NDX');
                currentStock = ndxIndex !== -1 ? allStocksData[ndxIndex] : allStocksData[0];
                
                if (currentStock.historicalData && currentStock.historicalData.length > 0) {
                    const sortedData = [...currentStock.historicalData].sort((a, b) => new Date(a.Date) - new Date(b.Date));
                    
                    // Default analysis date range
                    document.getElementById('start-date').value = sortedData[0].Date;
                    document.getElementById('end-date').value = sortedData[sortedData.length - 1].Date;

                    // Default bubble start date (last 6 months)
                    const startDateObj = new Date(sortedData[sortedData.length - 1].Date);
                    startDateObj.setMonth(startDateObj.getMonth() - 6);
                    const startDateStr = startDateObj.toISOString().split('T')[0];
                    document.getElementById('bubble-start-date').value = startDateStr < sortedData[0].Date ? sortedData[0].Date : startDateStr;
                }

                document.getElementById('stock-select').value = currentStock.code;
                updateStockDisplay(currentStock);
                renderChart(currentStock, currentChartTimeframe);
                renderBubbleChart(allStocksData);
            }
        })
        .catch(error => console.error('Error:', error));

    // Global Search
    document.getElementById('stock-search').addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredStocks = allStocksData.filter(stock => 
            stock.name.toLowerCase().includes(query) || 
            stock.code.toLowerCase().includes(query)
        );
        populateStockSelect(filteredStocks);
    });

    // Timeframe Buttons
    document.getElementById('timeframe-daily').addEventListener('click', () => setTimeframe('Daily'));
    document.getElementById('timeframe-weekly').addEventListener('click', () => setTimeframe('Weekly'));
    document.getElementById('timeframe-monthly').addEventListener('click', () => setTimeframe('Monthly'));

    // Date Listeners
    document.getElementById('start-date').addEventListener('change', () => {
        if (currentStock) renderChart(currentStock, currentChartTimeframe);
    });
    document.getElementById('end-date').addEventListener('change', () => {
        if (currentStock) renderChart(currentStock, currentChartTimeframe);
    });
    document.getElementById('bubble-start-date').addEventListener('change', () => {
        renderBubbleChart(allStocksData);
    });

    document.getElementById('stock-select').addEventListener('change', (event) => {
        selectStockByCode(event.target.value);
    });

    document.getElementById('play-bubble').addEventListener('click', toggleBubbleAnimation);

    document.getElementById('speed-control').addEventListener('input', (event) => {
        animationSpeed = parseInt(event.target.value);
        document.getElementById('speed-value').textContent = `${animationSpeed}ms`;
        if (bubbleAnimationInterval) {
            toggleBubbleAnimation(); 
            toggleBubbleAnimation();
        }
    });
});

function toggleBubbleAnimation() {
    const btn = document.getElementById('play-bubble');
    if (bubbleAnimationInterval) {
        clearInterval(bubbleAnimationInterval);
        bubbleAnimationInterval = null;
        btn.textContent = '재생 (Play)';
    } else {
        const startDate = document.getElementById('bubble-start-date').value;
        const filteredDates = bubbleDates.filter(d => !startDate || d >= startDate);

        if (filteredDates.length === 0) return;

        const currentDate = bubbleDates[currentBubbleDateIndex];
        if (currentDate < filteredDates[0] || currentDate >= filteredDates[filteredDates.length - 1]) {
            currentBubbleDateIndex = bubbleDates.indexOf(filteredDates[0]);
        }

        btn.textContent = '일시정지 (Pause)';
        updateBubbleChart(bubbleDates[currentBubbleDateIndex]);

        bubbleAnimationInterval = setInterval(() => {
            currentBubbleDateIndex++;
            if (currentBubbleDateIndex >= bubbleDates.length) {
                const firstValidDate = startDate ? bubbleDates.find(d => d >= startDate) : bubbleDates[0];
                currentBubbleDateIndex = bubbleDates.indexOf(firstValidDate);
            }
            updateBubbleChart(bubbleDates[currentBubbleDateIndex]);
        }, animationSpeed);
    }
}

function updateBubbleChart(date) {
    if (!bubbleChart) return;
    const startDate = document.getElementById('bubble-start-date').value;
    const bubbleData = getBubbleDataForDateRange(allStocksData, startDate, date);
    bubbleChart.series[0].setData(bubbleData, true, { duration: animationSpeed });
    document.getElementById('current-bubble-date').textContent = date;
}

function getBubbleDataForDateRange(stocks, startDate, currentDate) {
    return stocks.filter(s => s.code !== '^NDX').map(stock => {
        const history = stock.historicalData;
        const currentIdx = history.findIndex(d => d.Date === currentDate);
        const startIdx = history.findIndex(d => d.Date >= startDate);
        
        if (currentIdx === -1 || startIdx === -1 || currentIdx < startIdx) return null;
        
        const current = history[currentIdx];
        const base = history[startIdx];
        const changePercent = ((current.Close - base.Close) / base.Close) * 100;
        const marketCapProxy = current.Volume * current.Close;

        return {
            id: stock.code,
            x: parseFloat(changePercent.toFixed(2)),
            y: marketCapProxy,
            z: current.Volume,
            name: stock.name,
            code: stock.code,
            color: stockColors[stock.code]
        };
    }).filter(d => d !== null);
}

function selectStockByCode(selectedCode) {
    currentStock = allStocksData.find(stock => stock.code === selectedCode);
    if (currentStock) {
        updateStockDisplay(currentStock);
        renderChart(currentStock, currentChartTimeframe);
    }
}

function renderBubbleChart(stocks) {
    bubbleDates = [...new Set(stocks.flatMap(s => s.historicalData.map(d => d.Date)))].sort();
    const startDate = document.getElementById('bubble-start-date').value || bubbleDates[0];
    
    const startProxies = stocks.filter(s => s.code !== '^NDX').map(stock => {
        const startIdx = stock.historicalData.findIndex(d => d.Date >= startDate);
        if (startIdx === -1) return 0;
        const base = stock.historicalData[startIdx];
        return base.Volume * base.Close;
    }).filter(v => v > 0);

    const maxStartProxy = startProxies.length > 0 ? Math.max(...startProxies) : 1000000;
    const minStartProxy = startProxies.length > 0 ? Math.min(...startProxies) : 1;

    currentBubbleDateIndex = bubbleDates.indexOf(bubbleDates.find(d => d >= startDate));
    if (currentBubbleDateIndex === -1) currentBubbleDateIndex = 0;
    
    const initialDate = bubbleDates[currentBubbleDateIndex];
    const bubbleData = getBubbleDataForDateRange(stocks, startDate, initialDate);
    document.getElementById('current-bubble-date').textContent = initialDate;

    bubbleChart = Highcharts.chart('bubble-container', {
        chart: {
            type: 'bubble',
            plotBorderWidth: 1,
            zoomType: 'xy',
            animation: { duration: animationSpeed }
        },
        title: { text: '' },
        xAxis: {
            gridLineWidth: 1,
            title: { text: '기준일 대비 등락률 (%)' },
            labels: { format: '{value}%' },
            plotLines: [{
                color: 'black', dashStyle: 'dot', width: 2, value: 0,
                label: { rotation: 0, y: 15, style: { fontStyle: 'italic' }, text: '기준점' },
                zIndex: 3
            }],
            min: -100, // Fixed min -100% as requested
            max: 200
        },
        yAxis: {
            type: 'logarithmic',
            title: { text: '시가총액 규모 (Log Scale Proxy)' },
            // Tighten the bounds for better visibility
            min: minStartProxy * 0.1, 
            max: maxStartProxy * 5 
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<table>',
            pointFormat: '<tr><th colspan="2"><h3>{point.name} ({point.code})</h3></th></tr>' +
                '<tr><th>등락률:</th><td>{point.x}%</td></tr>' +
                '<tr><th>규모지수:</th><td>{point.y}</td></tr>' +
                '<tr><th>거래량:</th><td>{point.z}</td></tr>',
            footerFormat: '</table>',
            followPointer: true
        },
        plotOptions: {
            series: {
                dataLabels: { enabled: true, format: '{point.code}', style: { fontSize: '10px' } },
                cursor: 'pointer',
                point: { events: { click: function() { openTab({currentTarget: document.querySelectorAll(".tab-link")[1]}, 'analysis-tab'); selectStockByCode(this.code); } } },
                animation: { duration: animationSpeed },
                marker: { fillOpacity: 0.7 }
            }
        },
        series: [{ name: '종목별 등락', data: bubbleData, colorByPoint: false }]
    });
}

function populateStockSelect(stocks) {
    const selectElement = document.getElementById('stock-select');
    if (!selectElement) return;
    selectElement.innerHTML = '';
    stocks.forEach(stock => {
        const option = document.createElement('option');
        option.value = stock.code;
        option.textContent = `${stock.name} (${stock.code})`;
        selectElement.appendChild(option);
    });
}

function updateStockDisplay(stock) {
    document.getElementById('stock-name').textContent = stock.name;
    document.getElementById('stock-code').textContent = stock.code;
    document.getElementById('stock-select').value = stock.code;
}

function setTimeframe(timeframe) {
    document.querySelectorAll('#analysis-tab .controls button').forEach(button => {
        button.classList.remove('active');
    });
    const btnId = `timeframe-${timeframe.toLowerCase()}`;
    if(document.getElementById(btnId)) document.getElementById(btnId).classList.add('active');

    currentChartTimeframe = timeframe;
    if (currentStock) renderChart(currentStock, currentChartTimeframe);
}

function renderChart(stock, timeframe) {
    let dataToRender = [];
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    let filteredData = stock.historicalData.filter(d => {
        if (startDate && d.Date < startDate) return false;
        if (endDate && d.Date > endDate) return false;
        return true;
    });

    if (timeframe === 'Weekly') dataToRender = aggregateToWeekly(filteredData);
    else if (timeframe === 'Monthly') dataToRender = aggregateToMonthly(filteredData);
    else dataToRender = filteredData;

    dataToRender.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    const ohlc = dataToRender.map(d => [new Date(d.Date).getTime(), d.Open, d.High, d.Low, d.Close]);
    const volume = dataToRender.map(d => [new Date(d.Date).getTime(), d.Volume]);

    stockChart = Highcharts.stockChart('container', {
        rangeSelector: { enabled: false },
        title: { text: `${stock.name} 주가 분석` },
        yAxis: [{
            labels: { align: 'right', x: -3 },
            title: { text: '주가' },
            height: '60%', lineWidth: 2, resize: { enabled: true }
        }, {
            labels: { align: 'right', x: -3 },
            title: { text: '거래량' },
            top: '65%', height: '35%', offset: 0, lineWidth: 2
        }],
        series: [{
            type: 'candlestick', name: stock.name, id: stock.code, data: ohlc,
            color: '#0000FF', upColor: '#FF0000'
        }, {
            type: 'column', name: 'Volume', data: volume, yAxis: 1
        }]
    });
}

function aggregateToWeekly(dailyData) {
    const weeklyData = [];
    let currentWeek = [];
    dailyData.forEach((day, index) => {
        currentWeek.push(day);
        const nextDayDate = index < dailyData.length - 1 ? new Date(dailyData[index + 1].Date) : null;
        if (!nextDayDate || nextDayDate.getDay() === 1) {
            if (currentWeek.length > 0) {
                weeklyData.push({
                    Date: currentWeek[currentWeek.length - 1].Date,
                    Open: currentWeek[0].Open,
                    High: Math.max(...currentWeek.map(d => d.High)),
                    Low: Math.min(...currentWeek.map(d => d.Low)),
                    Close: currentWeek[currentWeek.length - 1].Close,
                    Volume: currentWeek.reduce((sum, d) => sum + d.Volume, 0)
                });
            }
            currentWeek = [];
        }
    });
    return weeklyData;
}

function aggregateToMonthly(dailyData) {
    const monthlyData = [];
    let currentMonth = [];
    dailyData.forEach((day, index) => {
        currentMonth.push(day);
        const nextDayDate = index < dailyData.length - 1 ? new Date(dailyData[index + 1].Date) : null;
        if (!nextDayDate || nextDayDate.getMonth() !== new Date(day.Date).getMonth()) {
            if (currentMonth.length > 0) {
                monthlyData.push({
                    Date: currentMonth[currentMonth.length - 1].Date,
                    Open: currentMonth[0].Open,
                    High: Math.max(...currentMonth.map(d => d.High)),
                    Low: Math.min(...currentMonth.map(d => d.Low)),
                    Close: currentMonth[currentMonth.length - 1].Close,
                    Volume: currentMonth.reduce((sum, d) => sum + d.Volume, 0)
                });
            }
            currentMonth = [];
        }
    });
    return monthlyData;
}