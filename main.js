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

// Share proxy weights for Market Cap
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
    return price * shares;
}

// Tab Switch Function - Explicitly attached to window for global access
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
    } else {
        // Fallback: find the button if event is missing
        const buttons = document.querySelectorAll('.tab-link');
        buttons.forEach(btn => {
            if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)) {
                btn.classList.add('active');
            }
        });
    }

    if (tabName === 'bubble-tab' && bubbleChart) bubbleChart.reflow();
    if (tabName === 'analysis-tab' && stockChart) stockChart.reflow();
    
    if (tabName !== 'bubble-tab' && bubbleAnimationInterval) {
        toggleBubbleAnimation(); // Stop animation when leaving tab
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const speedVal = document.getElementById('speed-value');
    const speedCtrl = document.getElementById('speed-control');
    if (speedVal) speedVal.textContent = `${animationSpeed}ms`;
    if (speedCtrl) speedCtrl.value = animationSpeed;

    // Use relative path for fetch
    fetch('./stock.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid or empty data');
            
            allStocksData = data;
            const colors = Highcharts.getOptions().colors;
            allStocksData.filter(s => s.code !== '^NDX').forEach((stock, i) => {
                stockColors[stock.code] = colors[i % colors.length];
            });
            
            populateStockSelect(allStocksData);
            
            // Find NASDAQ 100 Index or first stock
            const ndxIndex = allStocksData.findIndex(stock => stock.code === '^NDX');
            currentStock = ndxIndex !== -1 ? allStocksData[ndxIndex] : allStocksData[0];
            
            if (currentStock && currentStock.historicalData && currentStock.historicalData.length > 0) {
                const sortedData = [...currentStock.historicalData].sort((a, b) => new Date(a.Date) - new Date(b.Date));
                
                const startDateEl = document.getElementById('start-date');
                const endDateEl = document.getElementById('end-date');
                const bubbleStartEl = document.getElementById('bubble-start-date');

                if (startDateEl) startDateEl.value = sortedData[0].Date;
                if (endDateEl) endDateEl.value = sortedData[sortedData.length - 1].Date;
                
                if (bubbleStartEl) {
                    const startDateObj = new Date(sortedData[sortedData.length - 1].Date);
                    startDateObj.setMonth(startDateObj.getMonth() - 6);
                    const startDateStr = startDateObj.toISOString().split('T')[0];
                    bubbleStartEl.value = startDateStr < sortedData[0].Date ? sortedData[0].Date : startDateStr;
                }
                
                updateStockDisplay(currentStock);
                renderChart(currentStock, currentChartTimeframe);
                renderBubbleChart(allStocksData);
            }
        })
        .catch(err => {
            console.error('Data loading error:', err);
            const msg = document.createElement('div');
            msg.style.color = 'red';
            msg.style.padding = '20px';
            msg.style.textAlign = 'center';
            msg.textContent = `데이터를 불러올 수 없습니다: ${err.message}. stock.json 파일이 존재하는지 확인해주세요.`;
            document.body.prepend(msg);
        });

    // Listeners with null checks
    const searchInput = document.getElementById('stock-search');
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
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

    ['start-date', 'end-date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => {
            if (currentStock) renderChart(currentStock, currentChartTimeframe);
        });
    });

    const bubbleStartEl = document.getElementById('bubble-start-date');
    if (bubbleStartEl) {
        bubbleStartEl.addEventListener('change', () => {
            if (bubbleAnimationInterval) toggleBubbleAnimation();
            renderBubbleChart(allStocksData);
        });
    }

    const stockSelect = document.getElementById('stock-select');
    if (stockSelect) {
        stockSelect.addEventListener('change', (event) => selectStockByCode(event.target.value));
    }

    const playBtn = document.getElementById('play-bubble');
    if (playBtn) playBtn.addEventListener('click', toggleBubbleAnimation);

    const speedSlider = document.getElementById('speed-control');
    if (speedSlider) {
        speedSlider.addEventListener('input', (event) => {
            animationSpeed = parseInt(event.target.value);
            const speedVal = document.getElementById('speed-value');
            if (speedVal) speedVal.textContent = `${animationSpeed}ms`;
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
                const playBtn = document.getElementById('play-bubble');
                if (playBtn) playBtn.textContent = '재생';
            }
            const index = parseInt(event.target.value);
            if (filteredBubbleDates && filteredBubbleDates[index]) {
                currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[index]);
                updateBubbleChart(filteredBubbleDates[index], 100);
            }
        });
    }
});

function toggleBubbleAnimation() {
    const btn = document.getElementById('play-bubble');
    if (!btn) return;

    if (bubbleAnimationInterval) {
        clearInterval(bubbleAnimationInterval);
        bubbleAnimationInterval = null;
        btn.textContent = '재생';
    } else {
        if (!filteredBubbleDates || filteredBubbleDates.length === 0) return;
        
        const currentDate = bubbleDates[currentBubbleDateIndex];
        const firstValid = filteredBubbleDates[0];
        const lastValid = filteredBubbleDates[filteredBubbleDates.length - 1];

        if (!currentDate || currentDate < firstValid || currentDate >= lastValid) {
            currentBubbleDateIndex = bubbleDates.indexOf(firstValid);
        }

        btn.textContent = '일시정지';
        startAnimationLoop();
    }
}

function startAnimationLoop() {
    if (bubbleAnimationInterval) clearInterval(bubbleAnimationInterval);
    bubbleAnimationInterval = setInterval(() => {
        currentBubbleDateIndex++;
        
        if (!filteredBubbleDates || filteredBubbleDates.length === 0) {
            clearInterval(bubbleAnimationInterval);
            return;
        }

        const lastValidDate = filteredBubbleDates[filteredBubbleDates.length - 1];
        if (currentBubbleDateIndex >= bubbleDates.length || bubbleDates[currentBubbleDateIndex] > lastValidDate) {
            currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[0]);
        }
        
        const date = bubbleDates[currentBubbleDateIndex];
        if (date) {
            updateBubbleChart(date, animationSpeed);
            const sliderIdx = filteredBubbleDates.indexOf(date);
            const slider = document.getElementById('date-slider');
            if (sliderIdx !== -1 && slider) slider.value = sliderIdx;
        }
    }, animationSpeed);
}

function updateBubbleChart(date, duration) {
    if (!bubbleChart) return;
    const bubbleStartEl = document.getElementById('bubble-start-date');
    const startDate = bubbleStartEl ? bubbleStartEl.value : (bubbleDates[0] || "");
    const bubbleData = getBubbleDataForDateRange(allStocksData, startDate, date);
    
    const animDuration = Math.max(duration * 0.9, 50);
    
    if (bubbleChart.series && bubbleChart.series[0]) {
        bubbleChart.series[0].setData(bubbleData, true, { 
            duration: animDuration, 
            easing: 'linear' 
        });
    }
    const dateDisplay = document.getElementById('current-bubble-date');
    if (dateDisplay) dateDisplay.textContent = date;
}

function getBubbleDataForDateRange(stocks, startDate, currentDate) {
    if (!Array.isArray(stocks)) return [];
    return stocks.filter(s => s.code !== '^NDX').map(stock => {
        const history = stock.historicalData;
        if (!history) return null;
        
        const currentIdx = history.findIndex(d => d.Date === currentDate);
        const startIdx = history.findIndex(d => d.Date >= startDate);
        if (currentIdx === -1 || startIdx === -1 || currentIdx < startIdx) return null;
        
        const current = history[currentIdx];
        const base = history[startIdx];
        
        if (!current || !base || base.Close === 0) return null;
        
        const changePercent = ((current.Close - base.Close) / base.Close) * 100;
        const marketCap = getMarketCap(stock.code, current.Close);

        if (isNaN(changePercent) || marketCap <= 0) return null;

        return {
            id: stock.code, x: parseFloat(changePercent.toFixed(2)), y: marketCap, z: current.Volume || 1,
            name: stock.name, code: stock.code, color: stockColors[stock.code]
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
    if (!Array.isArray(stocks)) return;
    
    bubbleDates = [...new Set(stocks.flatMap(s => s.historicalData ? s.historicalData.map(d => d.Date) : []))].sort();
    if (bubbleDates.length === 0) return;

    const bubbleStartEl = document.getElementById('bubble-start-date');
    const startDate = bubbleStartEl ? bubbleStartEl.value : bubbleDates[0];
    
    filteredBubbleDates = bubbleDates.filter(d => d >= startDate);
    if (filteredBubbleDates.length === 0) filteredBubbleDates = [bubbleDates[bubbleDates.length-1]];

    const slider = document.getElementById('date-slider');
    if (slider) {
        slider.max = Math.max(filteredBubbleDates.length - 1, 0);
        slider.value = 0;
    }

    const startMarketCaps = stocks.filter(s => s.code !== '^NDX').map(stock => {
        const startIdx = stock.historicalData ? stock.historicalData.findIndex(d => d.Date >= startDate) : -1;
        return startIdx === -1 ? 0 : getMarketCap(stock.code, stock.historicalData[startIdx].Close);
    }).filter(v => v > 0);

    const maxStartMC = startMarketCaps.length > 0 ? Math.max(...startMarketCaps) : 1000000;
    const minStartMC = startMarketCaps.length > 0 ? Math.min(...startMarketCaps) : 1;

    currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[0]);
    
    const container = document.getElementById('bubble-container');
    if (!container) return;

    bubbleChart = Highcharts.chart('bubble-container', {
        chart: { 
            type: 'bubble', 
            plotBorderWidth: 1, 
            zoomType: 'xy',
            animation: { duration: 100 }
        },
        title: { text: '' },
        xAxis: {
            gridLineWidth: 1, 
            title: { text: '수익률 (%)', style: { fontWeight: 'bold' } }, 
            labels: { format: '{value}%', style: { fontSize: '11px' } },
            plotLines: [{ color: 'rgba(0,0,0,0.2)', dashStyle: 'solid', width: 1, value: 0, zIndex: 1 }],
            min: -100, max: 200
        },
        yAxis: { 
            type: 'logarithmic', 
            title: { text: '시가총액 규모', style: { fontWeight: 'bold' } }, 
            labels: { style: { fontSize: '11px' } }, 
            min: minStartMC * 0.2, 
            max: maxStartMC * 20 
        },
        tooltip: {
            useHTML: true, followPointer: true, padding: 10,
            style: { fontSize: '13px' },
            headerFormat: '<table style="width:150px">',
            pointFormat: '<tr><th colspan="2" style="font-size:1.1em; padding-bottom:5px">{point.name}</th></tr>' +
                         '<tr><td style="color:#666">수익률:</td><td style="text-align:right"><b>{point.x}%</b></td></tr>' +
                         '<tr><td style="color:#666">추정시총:</td><td style="text-align:right">{point.y}</td></tr>',
            footerFormat: '</table>'
        },
        plotOptions: {
            series: {
                dataLabels: { 
                    enabled: true, 
                    format: '{point.code}', 
                    style: { fontSize: '10px', textOutline: 'none', fontWeight: 'normal' },
                    allowOverlap: false
                },
                cursor: 'pointer',
                point: { 
                    events: { 
                        click: function() { 
                            const analysisTabBtn = document.querySelectorAll(".tab-link")[1];
                            window.openTab({currentTarget: analysisTabBtn}, 'analysis-tab'); 
                            selectStockByCode(this.code); 
                        } 
                    } 
                },
                animation: { duration: animationSpeed, easing: 'linear' },
                marker: { fillOpacity: 0.6, lineWidth: 1, lineColor: null }
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
    const nameEl = document.getElementById('stock-name');
    const codeEl = document.getElementById('stock-code');
    const selectEl = document.getElementById('stock-select');
    if (nameEl) nameEl.textContent = stock.name;
    if (codeEl) codeEl.textContent = stock.code;
    if (selectEl) selectEl.value = stock.code;
}

function setTimeframe(timeframe) {
    document.querySelectorAll('#analysis-tab .controls button').forEach(button => button.classList.remove('active'));
    const btnId = `timeframe-${timeframe.toLowerCase()}`;
    const btn = document.getElementById(btnId);
    if(btn) btn.classList.add('active');
    currentChartTimeframe = timeframe;
    if (currentStock) renderChart(currentStock, currentChartTimeframe);
}

function renderChart(stock, timeframe) {
    const startDateEl = document.getElementById('start-date');
    const endDateEl = document.getElementById('end-date');
    const startDate = startDateEl ? startDateEl.value : "";
    const endDate = endDateEl ? endDateEl.value : "";
    
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
    
    const container = document.getElementById('container');
    if (!container) return;

    stockChart = Highcharts.stockChart('container', {
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