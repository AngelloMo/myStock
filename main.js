// Global variables
let allStocksData = [];
let currentStock = null;
let currentChartTimeframe = 'Daily';
let bubbleChart = null;
let stockChart = null;
let bubbleDates = [];
let filteredBubbleDates = [];
let currentBubbleDateIndex = 0;
let bubbleAnimationInterval = null;
let stockColors = {};
let animationSpeed = 300;

// Share proxy weights for Market Cap (Approximate relative scale)
const sharesProxy = {
    'AAPL': 150, 'MSFT': 70, 'AMZN': 100, 'GOOGL': 60, 'GOOG': 60,
    'META': 25, 'NVDA': 240, 'TSLA': 30, 'AVGO': 4, 'PEP': 13,
    'COST': 4, 'NFLX': 4, 'AMD': 16, 'ADBE': 4, 'CSCO': 40,
    'INTC': 42, 'QCOM': 11, 'TXN': 9, 'AMGN': 5, 'ISRG': 3,
    'HON': 6, 'CMCSA': 40, 'SBUX': 11, 'AMAT': 8, 'BKNG': 0.3,
    'GILD': 12, 'MDLZ': 13, 'ADI': 5, 'TMUS': 11, 'LRCX': 1,
    'MU': 11, 'VRTX': 2, 'CSX': 20, 'REGN': 1, 'MELI': 0.5,
    'ABNB': 6, 'ASML': 4, 'KLA': 1, 'PANW': 3, 'PLTR': 22,
    'MSTR': 0.1, 'AXON': 0.7, 'PYPL': 10, 'ADSK': 2, 'AEP': 5,
    'ANSS': 0.8, 'AZN': 15, 'BKR': 10, 'CDNS': 2, 'CEG': 3,
    'CHTR': 1, 'CPAY': 0.7, 'CPRT': 9, 'CRWD': 2, 'CTAS': 1,
    'CTSH': 5, 'DASH': 4, 'DDOG': 3, 'DLTR': 2, 'DXCM': 4,
    'EA': 2, 'EBAY': 5, 'EXC': 10, 'FAST': 5, 'FTNT': 7,
    'IDXX': 0.8, 'INTU': 2, 'KDP': 14, 'LULU': 1, 'MAR': 2,
    'MCHP': 5, 'MDB': 0.7, 'MNST': 10, 'NXPI': 2, 'ODFL': 1,
    'ON': 4, 'ORLY': 0.6, 'PAYX': 3, 'PCAR': 5, 'PDD': 13,
    'ROP': 1, 'ROST': 3, 'SNPS': 1, 'TEAM': 2, 'VRSK': 1,
    'WBA': 8, 'WBD': 24, 'WDAY': 2, 'WLTW': 1, 'WMT': 80,
    'XEL': 5, 'ZS': 1
};

function getMarketCap(stockCode, price) {
    const shares = sharesProxy[stockCode] || 1;
    // 단위를 십억 달러($B) 규모로 맞추기 위해 조정 (정수 반환)
    return Math.round(price * shares * 0.1); 
}

// Tab Switch Function
window.openTab = function(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add("active");
    
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }

    if (tabName === 'bubble-tab' && bubbleChart) bubbleChart.reflow();
    if (tabName === 'analysis-tab' && stockChart) stockChart.reflow();
    
    if (tabName !== 'bubble-tab' && bubbleAnimationInterval) {
        toggleBubbleAnimation(); 
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const speedVal = document.getElementById('speed-value');
    const speedCtrl = document.getElementById('speed-control');
    if (speedVal) speedVal.textContent = `${animationSpeed}ms`;
    if (speedCtrl) speedCtrl.value = animationSpeed;

    fetch('./stock.json')
        .then(response => response.json())
        .then(data => {
            allStocksData = data;
            const colors = Highcharts.getOptions().colors;
            allStocksData.filter(s => s.code !== '^NDX').forEach((stock, i) => {
                stockColors[stock.code] = colors[i % colors.length];
            });
            populateStockSelect(allStocksData);
            
            const ndxIndex = allStocksData.findIndex(stock => stock.code === '^NDX');
            currentStock = ndxIndex !== -1 ? allStocksData[ndxIndex] : allStocksData[0];
            
            if (currentStock && currentStock.historicalData && currentStock.historicalData.length > 0) {
                const sortedData = [...currentStock.historicalData].sort((a, b) => new Date(a.Date) - new Date(b.Date));
                
                if (document.getElementById('start-date')) document.getElementById('start-date').value = sortedData[0].Date;
                if (document.getElementById('end-date')) document.getElementById('end-date').value = sortedData[sortedData.length - 1].Date;
                
                if (document.getElementById('bubble-start-date')) {
                    const startDateObj = new Date(sortedData[sortedData.length - 1].Date);
                    startDateObj.setMonth(startDateObj.getMonth() - 6);
                    document.getElementById('bubble-start-date').value = startDateObj.toISOString().split('T')[0];
                }
                
                updateStockDisplay(currentStock);
                renderChart(currentStock, currentChartTimeframe);
                renderBubbleChart(allStocksData);
            }
        });

    // Event Listeners
    if (document.getElementById('stock-search')) {
        document.getElementById('stock-search').addEventListener('input', (event) => {
            const query = event.target.value.toLowerCase();
            const filteredStocks = allStocksData.filter(stock => 
                stock.name.toLowerCase().includes(query) || stock.code.toLowerCase().includes(query)
            );
            populateStockSelect(filteredStocks);
        });
    }

    ['daily', 'weekly', 'monthly'].forEach(tf => {
        const btn = document.getElementById(`timeframe-${tf}`);
        if (btn) btn.addEventListener('click', () => setTimeframe(tf.charAt(0).toUpperCase() + tf.slice(1)));
    });

    const playBtn = document.getElementById('play-bubble');
    if (playBtn) playBtn.addEventListener('click', toggleBubbleAnimation);

    const speedSlider = document.getElementById('speed-control');
    if (speedSlider) {
        speedSlider.addEventListener('input', (event) => {
            animationSpeed = parseInt(event.target.value);
            document.getElementById('speed-value').textContent = `${animationSpeed}ms`;
            if (bubbleAnimationInterval) {
                clearInterval(bubbleAnimationInterval);
                startAnimationLoop();
            }
        });
    }

    const dateSlider = document.getElementById('date-slider');
    if (dateSlider) {
        dateSlider.addEventListener('input', (event) => {
            if (bubbleAnimationInterval) {
                clearInterval(bubbleAnimationInterval);
                bubbleAnimationInterval = null;
                document.getElementById('play-bubble').textContent = '재생';
            }
            const index = parseInt(event.target.value);
            if (filteredBubbleDates[index]) {
                currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[index]);
                updateBubbleChart(filteredBubbleDates[index], 100);
            }
        });
    }
});

function toggleBubbleAnimation() {
    const btn = document.getElementById('play-bubble');
    if (bubbleAnimationInterval) {
        clearInterval(bubbleAnimationInterval);
        bubbleAnimationInterval = null;
        btn.textContent = '재생';
    } else {
        if (filteredBubbleDates.length === 0) return;
        btn.textContent = '일시정지';
        startAnimationLoop();
    }
}

function startAnimationLoop() {
    bubbleAnimationInterval = setInterval(() => {
        currentBubbleDateIndex++;
        if (currentBubbleDateIndex >= bubbleDates.length) {
            currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[0]);
        }
        const date = bubbleDates[currentBubbleDateIndex];
        updateBubbleChart(date, animationSpeed);
        const sliderIdx = filteredBubbleDates.indexOf(date);
        if (sliderIdx !== -1) document.getElementById('date-slider').value = sliderIdx;
    }, animationSpeed);
}

function updateBubbleChart(date, duration) {
    if (!bubbleChart) return;
    const startDate = document.getElementById('bubble-start-date').value;
    const bubbleData = getBubbleDataForDateRange(allStocksData, startDate, date);
    bubbleChart.series[0].setData(bubbleData, true, { duration: Math.max(duration * 0.9, 50), easing: 'linear' });
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
        
        // 수익률 및 시총 계산 (소수점 제거)
        const changePercent = Math.round(((current.Close - base.Close) / base.Close) * 100);
        const marketCap = getMarketCap(stock.code, current.Close);

        return {
            id: stock.code, x: changePercent, y: marketCap, z: current.Volume,
            name: stock.name, code: stock.code, color: stockColors[stock.code]
        };
    }).filter(d => d !== null);
}

function selectStockByCode(selectedCode) {
    currentStock = allStocksData.find(stock => stock.code === selectedCode);
    if (currentStock) { updateStockDisplay(currentStock); renderChart(currentStock, currentChartTimeframe); }
}

function renderBubbleChart(stocks) {
    bubbleDates = [...new Set(stocks.flatMap(s => s.historicalData ? s.historicalData.map(d => d.Date) : []))].sort();
    const startDate = document.getElementById('bubble-start-date').value || bubbleDates[0];
    filteredBubbleDates = bubbleDates.filter(d => d >= startDate);
    
    if (document.getElementById('date-slider')) {
        document.getElementById('date-slider').max = filteredBubbleDates.length - 1;
        document.getElementById('date-slider').value = 0;
    }

    const startMCs = stocks.filter(s => s.code !== '^NDX').map(stock => {
        const startIdx = stock.historicalData ? stock.historicalData.findIndex(d => d.Date >= startDate) : -1;
        return startIdx === -1 ? 0 : getMarketCap(stock.code, stock.historicalData[startIdx].Close);
    }).filter(v => v > 0);

    const maxMC = startMCs.length > 0 ? Math.max(...startMCs) : 1000;
    const minMC = startMCs.length > 0 ? Math.min(...startMCs) : 1;

    currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[0]);
    updateBubbleChart(filteredBubbleDates[0], 0);

    bubbleChart = Highcharts.chart('bubble-container', {
        chart: { type: 'bubble', plotBorderWidth: 1, zoomType: 'xy' },
        title: { text: '' },
        xAxis: {
            gridLineWidth: 1, title: { text: '수익률 (%)', style: { fontWeight: 'bold' } }, 
            labels: { format: '{value}%' }, min: -100, max: 200,
            plotLines: [{ color: '#ccc', width: 1, value: 0, zIndex: 1 }]
        },
        yAxis: { 
            type: 'logarithmic', title: { text: '추정 시가총액 (십억 달러, $B)', style: { fontWeight: 'bold' } }, 
            min: minMC * 0.5, max: maxMC * 15 
        },
        tooltip: {
            useHTML: true, padding: 10,
            headerFormat: '<table>',
            pointFormat: '<tr><th colspan="2" style="font-size:1.1em">{point.name}</th></tr>' +
                         '<tr><td>수익률:</td><td style="text-align:right"><b>{point.x}%</b></td></tr>' +
                         '<tr><td>추정시총:</td><td style="text-align:right"><b>${point.y}B</b></td></tr>',
            footerFormat: '</table>'
        },
        plotOptions: {
            series: {
                dataLabels: { enabled: true, format: '{point.code}', style: { fontSize: '10px', textOutline: 'none' } },
                animation: { duration: animationSpeed, easing: 'linear' },
                marker: { fillOpacity: 0.6 }
            }
        },
        series: [{ name: 'Nasdaq 100', data: getBubbleDataForDateRange(stocks, startDate, filteredBubbleDates[0]), colorByPoint: false }]
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
    if (document.getElementById('stock-name')) document.getElementById('stock-name').textContent = stock.name;
    if (document.getElementById('stock-code')) document.getElementById('stock-code').textContent = stock.code;
    if (document.getElementById('stock-select')) document.getElementById('stock-select').value = stock.code;
}

function setTimeframe(timeframe) {
    document.querySelectorAll('#analysis-tab .controls button').forEach(button => button.classList.remove('active'));
    if (document.getElementById(`timeframe-${timeframe.toLowerCase()}`)) document.getElementById(`timeframe-${timeframe.toLowerCase()}`).classList.add('active');
    currentChartTimeframe = timeframe;
    if (currentStock) renderChart(currentStock, currentChartTimeframe);
}

function renderChart(stock, timeframe) {
    const startDate = document.getElementById('start-date') ? document.getElementById('start-date').value : "";
    const endDate = document.getElementById('end-date') ? document.getElementById('end-date').value : "";
    if (!stock.historicalData) return;
    
    let filteredData = stock.historicalData.filter(d => {
        if (startDate && d.Date < startDate) return false;
        if (endDate && d.Date > endDate) return false;
        return true;
    });
    let dataToRender = timeframe === 'Weekly' ? aggregateToWeekly(filteredData) : (timeframe === 'Monthly' ? aggregateToMonthly(filteredData) : filteredData);
    dataToRender.sort((a, b) => new Date(a.Date) - new Date(b.Date));
    const ohlc = dataToRender.map(d => [new Date(d.Date).getTime(), d.Open, d.High, d.Low, d.Close]);
    const volume = dataToRender.map(d => [new Date(d.Date).getTime(), d.Volume]);
    
    Highcharts.stockChart('container', {
        rangeSelector: { enabled: false },
        title: { text: `${stock.name} 주가 분석` },
        yAxis: [{ labels: { align: 'right', x: -3 }, title: { text: '주가' }, height: '60%', lineWidth: 2, resize: { enabled: true } },
                { labels: { align: 'right', x: -3 }, title: { text: '거래량' }, top: '65%', height: '35%', offset: 0, lineWidth: 2 }],
        series: [{ type: 'candlestick', name: stock.name, id: stock.code, data: ohlc, color: '#0000FF', upColor: '#FF0000' },
                { type: 'column', name: 'Volume', data: volume, yAxis: 1 }]
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
                weeklyData.push({ Date: currentWeek[currentWeek.length - 1].Date, Open: currentWeek[0].Open, High: Math.max(...currentWeek.map(d => d.High)), Low: Math.min(...currentWeek.map(d => d.Low)), Close: currentWeek[currentWeek.length - 1].Close, Volume: currentWeek.reduce((sum, d) => sum + d.Volume, 0) });
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
                monthlyData.push({ Date: currentMonth[currentMonth.length - 1].Date, Open: currentMonth[0].Open, High: Math.max(...currentMonth.map(d => d.High)), Low: Math.min(...currentMonth.map(d => d.Low)), Close: currentMonth[currentMonth.length - 1].Close, Volume: currentMonth.reduce((sum, d) => sum + d.Volume, 0) });
            }
            currentMonth = [];
        }
    });
    return monthlyData;
}