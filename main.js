// Global variables
let allStocksData = [];
let currentCategoryData = [];
let currentStock = null;
let currentChartTimeframe = 'Daily';
let bubbleChart = null;
let stockChart = null;
let bubbleDates = [];
let filteredBubbleDates = [];
let currentBubbleDateIndex = 0;
let bubbleAnimationInterval = null;
let animationSpeed = 300;
let currentCategory = 'NASDAQ100';

// Sector Mapping & Colors
const sectorConfig = {
    'Mag7': { color: '#FFD700', name: 'Mag 7 (빅테크)', basis: '나스닥 시총 최상위 핵심 기술주' },
    'Semicon': { color: '#FF8C00', name: '반도체 (Semicon)', basis: '반도체 설계, 제조 및 장비 기업' },
    'Software': { color: '#1E90FF', name: '소프트웨어/보안', basis: 'SaaS, 클라우드 및 사이버 보안 기업' },
    'Consumer': { color: '#32CD32', name: '소비재/리테일', basis: '필수 및 임의 소비재, 대형 유통망' },
    'BioHealth': { color: '#FF69B4', name: '바이오/헬스케어', basis: '제약, 바이오 및 의료 기기 기업' },
    'MediaComm': { color: '#9370DB', name: '미디어/통신', basis: '콘텐츠, 스트리밍 및 통신 서비스' },
    'Financial': { color: '#4682B4', name: '금융 (Financial)', basis: '은행, 투자 서비스 및 핀테크' },
    'Energy': { color: '#2F4F4F', name: '에너지/화학', basis: '에너지원 개발 및 정제' },
    'Industrial': { color: '#A9A9A9', name: '산업재/기타', basis: '금융 기술, 물류 및 기타 산업' }
};

const stockToSector = {
    'AAPL': 'Mag7', 'MSFT': 'Mag7', 'GOOGL': 'Mag7', 'GOOG': 'Mag7', 'AMZN': 'Mag7', 'META': 'Mag7', 'NVDA': 'Mag7', 'TSLA': 'Mag7',
    'AMD': 'Semicon', 'AVGO': 'Semicon', 'QCOM': 'Semicon', 'INTC': 'Semicon', 'TXN': 'Semicon', 'AMAT': 'Semicon', 'LRCX': 'Semicon', 'MU': 'Semicon', 'ASML': 'Semicon', 'ADI': 'Semicon', 'NXPI': 'Semicon', 'MCHP': 'Semicon', 'ON': 'Semicon', 'KLAC': 'Semicon',
    'ADBE': 'Software', 'PANW': 'Software', 'CDNS': 'Software', 'SNPS': 'Software', 'INTU': 'Software', 'WDAY': 'Software', 'TEAM': 'Software', 'ADSK': 'Software', 'MDB': 'Software', 'CRWD': 'Software', 'ZS': 'Software', 'PLTR': 'Software', 'NOW': 'Software', 'ACN': 'Software', 'IBM': 'Software',
    'COST': 'Consumer', 'WMT': 'Consumer', 'PEP': 'Consumer', 'MDLZ': 'Consumer', 'MNST': 'Consumer', 'KDP': 'Consumer', 'LULU': 'Consumer', 'MAR': 'Consumer', 'BKNG': 'Consumer', 'ABNB': 'Consumer', 'DASH': 'Consumer', 'PDD': 'Consumer', 'MELI': 'Consumer', 'SBUX': 'Consumer', 'ORLY': 'Consumer', 'ROST': 'Consumer', 'DLTR': 'Consumer', 'NKE': 'Consumer', 'KO': 'Consumer', 'PG': 'Consumer', 'HD': 'Consumer', 'MCD': 'Consumer', 'PM': 'Consumer', 'DIS': 'Consumer', 'LOW': 'Consumer',
    'AMGN': 'BioHealth', 'GILD': 'BioHealth', 'ISRG': 'BioHealth', 'VRTX': 'BioHealth', 'REGN': 'BioHealth', 'DXCM': 'BioHealth', 'IDXX': 'BioHealth', 'AZN': 'BioHealth', 'LLY': 'BioHealth', 'UNH': 'BioHealth', 'JNJ': 'BioHealth', 'ABBV': 'BioHealth', 'MRK': 'BioHealth', 'TMO': 'BioHealth', 'ABT': 'BioHealth', 'DHR': 'BioHealth', 'PFE': 'BioHealth',
    'NFLX': 'MediaComm', 'CMCSA': 'MediaComm', 'CHTR': 'MediaComm', 'WBD': 'MediaComm', 'TMUS': 'MediaComm', 'VZ': 'MediaComm',
    'JPM': 'Financial', 'V': 'Financial', 'MA': 'Financial', 'BAC': 'Financial', 'WFC': 'Financial', 'MS': 'Financial', 'GS': 'Financial', 'BLK': 'Financial', 'AXP': 'Financial',
    'XOM': 'Energy', 'CVX': 'Energy', 'NEE': 'Energy',
    'HON': 'Industrial', 'CSX': 'Industrial', 'ODFL': 'Industrial', 'PCAR': 'Industrial', 'PYPL': 'Industrial', 'CPAY': 'Industrial', 'VRSK': 'Industrial', 'WBA': 'Industrial', 'WLTW': 'Industrial', 'XEL': 'Industrial', 'EXC': 'Industrial', 'AEP': 'Industrial', 'BKR': 'Industrial', 'CEG': 'Industrial', 'UNP': 'Industrial', 'GE': 'Industrial', 'CAT': 'Industrial', 'UPS': 'Industrial', 'BA': 'Industrial', 'RTX': 'Industrial'
};

const sharesProxy = {
    'AAPL': 150, 'MSFT': 70, 'AMZN': 100, 'GOOGL': 60, 'GOOG': 60, 'META': 25, 'NVDA': 240, 'TSLA': 30, 'AVGO': 4, 'PEP': 13,
    'COST': 4, 'NFLX': 4, 'AMD': 16, 'ADBE': 4, 'CSCO': 40, 'INTC': 42, 'QCOM': 11, 'TXN': 9, 'AMGN': 5, 'ISRG': 3,
    'HON': 6, 'CMCSA': 40, 'SBUX': 11, 'AMAT': 8, 'BKNG': 0.3, 'GILD': 12, 'MDLZ': 13, 'ADI': 5, 'TMUS': 11, 'LRCX': 1,
    'MU': 11, 'VRTX': 2, 'CSX': 20, 'REGN': 1, 'MELI': 0.5, 'ABNB': 6, 'ASML': 4, 'KLA': 1, 'PANW': 3, 'PLTR': 22,
    'MSTR': 0.1, 'AXON': 0.7, 'PYPL': 10, 'ADSK': 2, 'AEP': 5, 'ANSS': 0.8, 'AZN': 15, 'BKR': 10, 'CDNS': 2, 'CEG': 3,
    'CHTR': 1, 'CPAY': 0.7, 'CPRT': 9, 'CRWD': 2, 'CTAS': 1, 'CTSH': 5, 'DASH': 4, 'DDOG': 3, 'DLTR': 2, 'DXCM': 4,
    'EA': 2, 'EBAY': 5, 'EXC': 10, 'FAST': 5, 'FTNT': 7, 'IDXX': 0.8, 'INTU': 2, 'KDP': 14, 'LULU': 1, 'MAR': 2,
    'MCHP': 5, 'MDB': 0.7, 'MNST': 10, 'NXPI': 2, 'ODFL': 1, 'ON': 4, 'ORLY': 0.6, 'PAYX': 3, 'PCAR': 5, 'PDD': 13,
    'ROP': 1, 'ROST': 3, 'SNPS': 1, 'TEAM': 2, 'VRSK': 1, 'WBA': 8, 'WBD': 24, 'WDAY': 2, 'WLTW': 1, 'WMT': 80,
    'XEL': 5, 'ZS': 1,
    'JPM': 29, 'LLY': 9, 'V': 21, 'UNH': 9, 'XOM': 44, 'MA': 9, 'JNJ': 24, 'PG': 24, 'HD': 10, 'ABBV': 18, 'CVX': 18, 'MRK': 25, 'BAC': 79, 'KO': 43, 'TMO': 4, 'MCD': 7, 'ACN': 6, 'ABT': 17, 'DHR': 7, 'DIS': 18, 'WFC': 36, 'VZ': 42, 'NEE': 20, 'PFE': 56, 'MS': 16, 'NKE': 15, 'PM': 15, 'UNP': 6, 'IBM': 9, 'GS': 3, 'GE': 11, 'CAT': 5, 'UPS': 9, 'BA': 6, 'BLK': 1.5, 'RTX': 15, 'AXP': 7, 'LOW': 6, 'NOW': 2
};

function getMarketCap(stockCode, price) {
    const shares = sharesProxy[stockCode] || 1;
    return Math.round(price * shares * 0.1); 
}

window.openTab = function(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) tabContents[i].classList.remove("active");
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) tabLinks[i].classList.remove("active");
    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.classList.add("active");
    if (evt && evt.currentTarget) evt.currentTarget.classList.add("active");
    if (tabName === 'bubble-tab' && bubbleChart) bubbleChart.reflow();
    if (tabName === 'analysis-tab' && stockChart) {
        setTimeout(() => { if (stockChart) stockChart.reflow(); }, 10);
    }
    if (tabName !== 'bubble-tab' && bubbleAnimationInterval) toggleBubbleAnimation();
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('./stock.json')
        .then(r => r.json())
        .then(data => {
            allStocksData = data;
            switchDashboard(currentCategory);
        });

    document.getElementById('dashboard-select').addEventListener('change', e => {
        switchDashboard(e.target.value);
    });

    document.getElementById('stock-search').addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        populateStockSelect(currentCategoryData.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)));
    });

    ['daily', 'weekly', 'monthly'].forEach(tf => {
        const btn = document.getElementById(`timeframe-${tf}`);
        if (btn) btn.addEventListener('click', () => setTimeframe(tf.charAt(0).toUpperCase() + tf.slice(1)));
    });

    document.getElementById('play-bubble').addEventListener('click', toggleBubbleAnimation);
    document.getElementById('speed-control').addEventListener('input', e => {
        animationSpeed = parseInt(e.target.value);
    });

    document.getElementById('date-slider').addEventListener('input', e => {
        if (bubbleAnimationInterval) { clearInterval(bubbleAnimationInterval); bubbleAnimationInterval = null; document.getElementById('play-bubble').textContent = '재생'; }
        const idx = parseInt(e.target.value);
        if (filteredBubbleDates[idx]) {
            currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[idx]);
            updateBubbleChart(filteredBubbleDates[idx], 0);
        }
    });

    document.getElementById('bubble-start-date').addEventListener('change', () => {
        if (bubbleAnimationInterval) toggleBubbleAnimation();
        renderBubbleChart(currentCategoryData);
    });

    document.getElementById('stock-select').addEventListener('change', e => {
        selectStockByCode(e.target.value);
    });
});

function switchDashboard(category) {
    currentCategory = category;
    const titleMap = { 'NASDAQ100': '나스닥 100 대시보드', 'SP500': 'S&P 500 대시보드' };
    const indexCodeMap = { 'NASDAQ100': '^NDX', 'SP500': '^SPX' };
    
    document.getElementById('dashboard-title').textContent = titleMap[category];
    
    // Filter data for the category
    currentCategoryData = allStocksData.filter(s => s.category === category || s.category === undefined);
    
    populateStockSelect(currentCategoryData);
    
    const indexCode = indexCodeMap[category];
    const indexItem = currentCategoryData.find(s => s.code === indexCode);
    currentStock = indexItem || currentCategoryData[0];
    
    if (currentStock && currentStock.historicalData) {
        const sorted = [...currentStock.historicalData].sort((a,b) => new Date(a.Date) - new Date(b.Date));
        document.getElementById('start-date').value = sorted[0].Date;
        document.getElementById('end-date').value = sorted[sorted.length-1].Date;
        
        const startObj = new Date(sorted[sorted.length-1].Date);
        startObj.setMonth(startObj.getMonth() - 6);
        document.getElementById('bubble-start-date').value = startObj.toISOString().split('T')[0];
        
        updateStockDisplay(currentStock);
        renderChart(currentStock, currentChartTimeframe);
        renderBubbleChart(currentCategoryData);
    }
}

function toggleBubbleAnimation() {
    const btn = document.getElementById('play-bubble');
    if (bubbleAnimationInterval) { 
        clearInterval(bubbleAnimationInterval); 
        bubbleAnimationInterval = null; 
        btn.textContent = '재생'; 
    } else { 
        if (filteredBubbleDates.length > 0) { 
            btn.textContent = '일시정지'; 
            startAnimationLoop(); 
        } 
    }
}

function startAnimationLoop() {
    bubbleAnimationInterval = setInterval(() => {
        currentBubbleDateIndex++;
        if (currentBubbleDateIndex >= bubbleDates.length) currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[0]);
        const date = bubbleDates[currentBubbleDateIndex];
        updateBubbleChart(date, 0);
        const sIdx = filteredBubbleDates.indexOf(date);
        if (sIdx !== -1) document.getElementById('date-slider').value = sIdx;
    }, animationSpeed);
}

function updateBubbleChart(date, duration) {
    if (!bubbleChart) return;
    const startDate = document.getElementById('bubble-start-date').value;
    const bubbleData = getBubbleDataForDateRange(currentCategoryData, startDate, date);
    
    Object.keys(sectorConfig).forEach((sectorId, i) => {
        const sectorData = bubbleData.filter(d => d.sectorId === sectorId);
        if (bubbleChart.series[i]) {
            bubbleChart.series[i].setData(sectorData, false, false); 
        }
    });
    bubbleChart.redraw(false);
    document.getElementById('current-bubble-date').textContent = date;
}

function getBubbleDataForDateRange(stocks, startDate, currentDate) {
    const indices = ['^NDX', '^SPX'];
    return stocks.filter(s => !indices.includes(s.code)).map(stock => {
        const history = stock.historicalData;
        const currentIdx = history.findIndex(d => d.Date === currentDate);
        const startIdx = history.findIndex(d => d.Date >= startDate);
        if (currentIdx === -1 || startIdx === -1 || currentIdx < startIdx) return null;
        const current = history[currentIdx];
        const base = history[startIdx];
        const changePercent = Math.round(((current.Close - base.Close) / base.Close) * 100);
        const marketCap = getMarketCap(stock.code, current.Close);
        const sectorId = stockToSector[stock.code] || 'Industrial';
        return {
            id: stock.code, x: changePercent, y: marketCap, z: current.Volume,
            name: stock.name, code: stock.code, color: sectorConfig[sectorId].color,
            sectorId: sectorId, sectorName: sectorConfig[sectorId].name, basis: sectorConfig[sectorId].basis
        };
    }).filter(d => d !== null);
}

function selectStockByCode(code) {
    currentStock = allStocksData.find(s => s.code === code);
    if (currentStock) { 
        updateStockDisplay(currentStock); 
        renderChart(currentStock, currentChartTimeframe); 
    }
}

function renderBubbleChart(stocks) {
    bubbleDates = [...new Set(stocks.flatMap(s => s.historicalData ? s.historicalData.map(d => d.Date) : []))].sort();
    const startDate = document.getElementById('bubble-start-date').value || bubbleDates[0];
    filteredBubbleDates = bubbleDates.filter(d => d >= startDate);
    const slider = document.getElementById('date-slider');
    if (slider) {
        slider.max = Math.max(filteredBubbleDates.length - 1, 0);
        slider.value = 0;
    }

    const indices = ['^NDX', '^SPX'];
    const startMCs = stocks.filter(s => !indices.includes(s.code)).map(s => {
        const idx = s.historicalData ? s.historicalData.findIndex(d => d.Date >= startDate) : -1;
        return idx === -1 ? 0 : getMarketCap(s.code, s.historicalData[idx].Close);
    }).filter(v => v > 0);
    const maxMC = startMCs.length > 0 ? Math.max(...startMCs) : 1000;
    const minMC = startMCs.length > 0 ? Math.min(...startMCs) : 1;

    currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[0]);
    
    const series = Object.keys(sectorConfig).map(sectorId => ({
        name: sectorConfig[sectorId].name,
        color: sectorConfig[sectorId].color,
        data: [],
        id: sectorId
    }));

    bubbleChart = Highcharts.chart('bubble-container', {
        chart: { type: 'bubble', plotBorderWidth: 1, zoomType: 'xy', animation: false },
        title: { text: '' },
        xAxis: {
            gridLineWidth: 1, title: { text: '수익률 (%)', style: { fontWeight: 'bold' } }, 
            labels: { format: '{value}%' }, min: -50, max: 150,
            plotLines: [{ color: '#ccc', width: 1, value: 0, zIndex: 1 }]
        },
        yAxis: { 
            type: 'logarithmic', title: { text: '시가총액 규모 ($B)', style: { fontWeight: 'bold' } }, 
            min: minMC * 0.5, max: maxMC * 15 
        },
        tooltip: {
            useHTML: true, padding: 10,
            headerFormat: '<table>',
            pointFormat: '<tr><th colspan="2" style="font-size:1.1em; color:{point.color}">{point.name} ({point.code})</th></tr>' +
                         '<tr><td>섹터:</td><td style="text-align:right"><b>{point.sectorName}</b></td></tr>' +
                         '<tr><td>수익률:</td><td style="text-align:right"><b>{point.x}%</b></td></tr>' +
                         '<tr><td>추정시총:</td><td style="text-align:right"><b>${point.y}B</b></td></tr>',
            footerFormat: '</table>',
            followPointer: true
        },
        plotOptions: {
            series: {
                dataLabels: { enabled: true, format: '{point.code}', style: { fontSize: '10px', textOutline: 'none' } },
                cursor: 'pointer',
                point: { events: { click: function() { openTab(null, 'analysis-tab'); selectStockByCode(this.code); } } },
                marker: { fillOpacity: 0.6 },
                animation: false
            }
        },
        series: series,
        legend: { enabled: true, align: 'center', verticalAlign: 'bottom' }
    });
    updateBubbleChart(filteredBubbleDates[0], 0);
}

function populateStockSelect(stocks) {
    const el = document.getElementById('stock-select');
    if (!el) return;
    el.innerHTML = '';
    stocks.forEach(s => { const opt = document.createElement('option'); opt.value = s.code; opt.textContent = `${s.name} (${s.code})`; el.appendChild(opt); });
}

function updateStockDisplay(s) {
    if (document.getElementById('stock-name')) document.getElementById('stock-name').textContent = s.name;
    if (document.getElementById('stock-code')) document.getElementById('stock-code').textContent = s.code;
    if (document.getElementById('stock-select')) document.getElementById('stock-select').value = s.code;
}

function setTimeframe(tf) {
    document.querySelectorAll('#analysis-tab .controls button').forEach(b => b.classList.remove('active'));
    const btnId = `timeframe-${tf.toLowerCase()}`;
    if (document.getElementById(btnId)) document.getElementById(btnId).classList.add('active');
    currentChartTimeframe = tf;
    if (currentStock) renderChart(currentStock, currentChartTimeframe);
}

function renderChart(s, tf) {
    const start = document.getElementById('start-date').value;
    const end = document.getElementById('end-date').value;
    if (!s.historicalData) return;
    let data = s.historicalData.filter(d => (!start || d.Date >= start) && (!end || d.Date <= end));
    if (tf === 'Weekly') data = aggregateToWeekly(data); else if (tf === 'Monthly') data = aggregateToMonthly(data);
    data.sort((a,b) => new Date(a.Date) - new Date(b.Date));
    const ohlc = data.map(d => [new Date(d.Date).getTime(), d.Open, d.High, d.Low, d.Close]);
    const vol = data.map(d => [new Date(d.Date).getTime(), d.Volume]);
    
    stockChart = Highcharts.stockChart('container', {
        rangeSelector: { enabled: false },
        title: { text: `${s.name} 주가 분석` },
        yAxis: [{ labels: { align: 'right', x: -3 }, title: { text: '주가' }, height: '60%', lineWidth: 2, resize: { enabled: true } },
                { labels: { align: 'right', x: -3 }, title: { text: '거래량' }, top: '65%', height: '35%', offset: 0, lineWidth: 2 }],
        series: [{ type: 'candlestick', name: s.name, id: s.code, data: ohlc, color: '#0000FF', upColor: '#FF0000' },
                { type: 'column', name: 'Volume', data: vol, yAxis: 1 }]
    });
}

function aggregateToWeekly(data) {
    const res = []; let week = [];
    data.forEach((d, i) => {
        week.push(d); const next = data[i+1];
        if (!next || new Date(next.Date).getDay() === 1) {
            res.push({ Date: week[week.length-1].Date, Open: week[0].Open, High: Math.max(...week.map(w => w.High)), Low: Math.min(...week.map(w => w.Low)), Close: week[week.length-1].Close, Volume: week.reduce((s, w) => s + w.Volume, 0) });
            week = [];
        }
    });
    return res;
}

function aggregateToMonthly(data) {
    const res = []; let mon = [];
    data.forEach((d, i) => {
        mon.push(d); const next = data[i+1];
        if (!next || new Date(next.Date).getMonth() !== new Date(d.Date).getMonth()) {
            res.push({ Date: mon[mon.length-1].Date, Open: mon[0].Open, High: Math.max(...mon.map(m => m.High)), Low: Math.min(...mon.map(m => m.Low)), Close: mon[mon.length-1].Close, Volume: mon.reduce((s, m) => s + m.Volume, 0) });
            mon = [];
        }
    });
    return res;
}