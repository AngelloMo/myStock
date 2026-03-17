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
    'Industrial': { color: '#A9A9A9', name: '산업재/장비', basis: '제조, 기계, 항공우주 및 방산' },
    'Transport': { color: '#708090', name: '물류/운송', basis: '철도, 항공, 해운 및 택배 물류' },
    'Utility': { color: '#008080', name: '유틸리티/인프라', basis: '전력, 가스, 수도 및 공공 인프라' }
};

const stockToSector = {
    'AAPL': 'Mag7', 'MSFT': 'Mag7', 'GOOGL': 'Mag7', 'GOOG': 'Mag7', 'AMZN': 'Mag7', 'META': 'Mag7', 'NVDA': 'Mag7', 'TSLA': 'Mag7',
    'AMD': 'Semicon', 'AVGO': 'Semicon', 'QCOM': 'Semicon', 'INTC': 'Semicon', 'TXN': 'Semicon', 'AMAT': 'Semicon', 'LRCX': 'Semicon', 'MU': 'Semicon', 'ASML': 'Semicon', 'ADI': 'Semicon', 'NXPI': 'Semicon', 'MCHP': 'Semicon', 'ON': 'Semicon', 'KLAC': 'Semicon',
    'ADBE': 'Software', 'PANW': 'Software', 'CDNS': 'Software', 'SNPS': 'Software', 'INTU': 'Software', 'WDAY': 'Software', 'TEAM': 'Software', 'ADSK': 'Software', 'MDB': 'Software', 'CRWD': 'Software', 'ZS': 'Software', 'PLTR': 'Software', 'NOW': 'Software', 'ACN': 'Software', 'IBM': 'Software',
    'COST': 'Consumer', 'WMT': 'Consumer', 'PEP': 'Consumer', 'MDLZ': 'Consumer', 'MNST': 'Consumer', 'KDP': 'Consumer', 'LULU': 'Consumer', 'MAR': 'Consumer', 'BKNG': 'Consumer', 'ABNB': 'Consumer', 'DASH': 'Consumer', 'PDD': 'Consumer', 'MELI': 'Consumer', 'SBUX': 'Consumer', 'ORLY': 'Consumer', 'ROST': 'Consumer', 'DLTR': 'Consumer', 'NKE': 'Consumer', 'KO': 'Consumer', 'PG': 'Consumer', 'HD': 'Consumer', 'MCD': 'Consumer', 'PM': 'Consumer', 'DIS': 'Consumer', 'LOW': 'Consumer',
    'AMGN': 'BioHealth', 'GILD': 'BioHealth', 'ISRG': 'BioHealth', 'VRTX': 'BioHealth', 'REGN': 'BioHealth', 'DXCM': 'BioHealth', 'IDXX': 'BioHealth', 'AZN': 'BioHealth', 'LLY': 'BioHealth', 'UNH': 'BioHealth', 'JNJ': 'BioHealth', 'ABBV': 'BioHealth', 'MRK': 'BioHealth', 'TMO': 'BioHealth', 'ABT': 'BioHealth', 'DHR': 'BioHealth', 'PFE': 'BioHealth', 'MRNA': 'BioHealth',
    'NFLX': 'MediaComm', 'CMCSA': 'MediaComm', 'CHTR': 'MediaComm', 'WBD': 'MediaComm', 'TMUS': 'MediaComm', 'VZ': 'MediaComm',
    'JPM': 'Financial', 'V': 'Financial', 'MA': 'Financial', 'BAC': 'Financial', 'WFC': 'Financial', 'MS': 'Financial', 'GS': 'Financial', 'BLK': 'Financial', 'AXP': 'Financial',
    'XOM': 'Energy', 'CVX': 'Energy', 'NEE': 'Energy',
    'HON': 'Industrial', 'GE': 'Industrial', 'CAT': 'Industrial', 'BA': 'Industrial', 'RTX': 'Industrial', 'MMM': 'Industrial', 'LMT': 'Industrial', 'GD': 'Industrial', 'NOC': 'Industrial',
    'CSX': 'Transport', 'ODFL': 'Transport', 'UNP': 'Transport', 'UPS': 'Transport', 'FDX': 'Transport', 'DAL': 'Transport', 'UAL': 'Transport',
    'XEL': 'Utility', 'EXC': 'Utility', 'AEP': 'Utility', 'NEE': 'Utility', 'DUK': 'Utility', 'SO': 'Utility', 'D': 'Utility',
    'PCAR': 'Industrial', 'PYPL': 'Financial', 'CPAY': 'Financial', 'VRSK': 'Industrial', 'WBA': 'Consumer', 'WLTW': 'Financial', 'BKR': 'Energy', 'CEG': 'Energy'
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

function getSectorId(stock) {
    const code = stock.s;
    const name = stock.n.toLowerCase();
    if (stockToSector[code]) return stockToSector[code];
    
    if (name.includes('bank') || name.includes('financial') || name.includes('insurance') || name.includes('trust') || name.includes('capital')) return 'Financial';
    if (name.includes('pharma') || name.includes('health') || name.includes('medical') || name.includes('biogen') || name.includes('science') || name.includes('lab') || name.includes('biotech') || name.includes('therapeutics')) return 'BioHealth';
    if (name.includes('energy') || name.includes('oil') || name.includes('gas') || name.includes('petroleum') || name.includes('resources')) return 'Energy';
    if (name.includes('tech') || name.includes('software') || name.includes('system') || name.includes('digital') || name.includes('cloud')) return 'Software';
    if (name.includes('consumer') || name.includes('retail') || name.includes('store') || name.includes('brand') || name.includes('beverage') || name.includes('food')) return 'Consumer';
    if (name.includes('comm') || name.includes('tele') || name.includes('media') || name.includes('network') || name.includes('entertainment')) return 'MediaComm';
    if (name.includes('electric') || name.includes('power') || name.includes('utility') || name.includes('water') || name.includes('infrastructure')) return 'Utility';
    if (name.includes('transport') || name.includes('rail') || name.includes('airline') || name.includes('logistics') || name.includes('express')) return 'Transport';
    
    return 'Industrial';
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

window.addEventListener('resize', () => {
    if (bubbleChart) bubbleChart.reflow();
    if (stockChart) stockChart.reflow();
});

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
        populateStockSelect(currentCategoryData.filter(s => s.n.toLowerCase().includes(q) || s.s.toLowerCase().includes(q)));
    });

    ['daily', 'weekly', 'monthly'].forEach(tf => {
        const btn = document.getElementById(`timeframe-${tf}`);
        if (btn) btn.addEventListener('click', () => setTimeframe(tf.charAt(0).toUpperCase() + tf.slice(1)));
    });

    document.getElementById('play-bubble').addEventListener('click', toggleBubbleAnimation);
    
    const BASE_SPEED = 300; 
    document.getElementById('speed-control').addEventListener('change', e => {
        const multiplier = parseFloat(e.target.value);
        animationSpeed = Math.round(BASE_SPEED / multiplier);

        // 실시간으로 애니메이션 속도를 변경하기 위해, 재생 중이라면 간격 재설정
        if (bubbleAnimationInterval) {
            clearInterval(bubbleAnimationInterval);
            startAnimationLoop();
        }
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
        renderBubbleChart();
    });

    document.getElementById('bubble-filter').addEventListener('change', () => {
        renderBubbleChart();
    });

    document.getElementById('stock-select').addEventListener('change', e => {
        selectStockByCode(e.target.value);
    });

    // Close multi-select when clicking outside
    window.addEventListener('click', e => {
        const ms = document.getElementById('sector-multi-select');
        if (ms && !ms.contains(e.target)) {
            document.getElementById('sector-checkboxes').classList.remove('active');
        }
    });
});

window.toggleSectorDropdown = function() {
    document.getElementById('sector-checkboxes').classList.toggle('active');
};

window.handleSectorChange = function(checkbox) {
    const checkboxes = document.querySelectorAll('#sector-checkboxes input[type="checkbox"]');
    const allCheckbox = checkboxes[0];
    const sectorCheckboxes = Array.from(checkboxes).slice(1);

    if (checkbox.value === 'all') {
        if (checkbox.checked) {
            sectorCheckboxes.forEach(cb => cb.checked = false);
        }
    } else {
        if (checkbox.checked) {
            allCheckbox.checked = false;
        }
    }

    // Ensure at least one is checked, if none, check 'all'
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
    if (!anyChecked) allCheckbox.checked = True;

    // Update display text
    const selectedSectors = Array.from(sectorCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.parentElement.textContent.trim());
    
    const textEl = document.getElementById('selected-sectors-text');
    if (allCheckbox.checked) {
        textEl.textContent = '전체 섹터';
    } else {
        if (selectedSectors.length > 2) {
            textEl.textContent = `${selectedSectors[0]} 외 ${selectedSectors.length - 1}개`;
        } else {
            textEl.textContent = selectedSectors.join(', ') || '선택 없음';
        }
    }

    renderBubbleChart();
};

function getSelectedSectors() {
    const checkboxes = document.querySelectorAll('#sector-checkboxes input[type="checkbox"]');
    const allCheckbox = checkboxes[0];
    if (allCheckbox.checked) return 'all';
    
    return Array.from(checkboxes)
        .slice(1)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

function getFilteredStocks() {
    const filterType = document.getElementById('bubble-filter').value;
    const selectedSectors = getSelectedSectors();
    const refDate = document.getElementById('bubble-start-date').value;
    const indices = ['^NDX', '^SPX'];
    
    let stocks = currentCategoryData.filter(s => !indices.includes(s.s));

    // 1. Sector Filter apply (only if not doing sector-top calculation)
    if (selectedSectors !== 'all' && !filterType.startsWith('sector-top')) {
        stocks = stocks.filter(s => selectedSectors.includes(getSectorId(s)));
    }

    // Helper to find index for reference date
    const getRefIdx = (h) => {
        if (!refDate) return h.length - 1;
        const idx = h.findIndex(item => item.d === refDate);
        return idx !== -1 ? idx : h.length - 1;
    };

    // Helper to calculate score based on timeframe (looking BACKWARD from reference date)
    const getMcapScore = (s, days, isAsc = false) => {
        const h = s.h || [];
        const refIdx = getRefIdx(h);
        if (refIdx < days) return isAsc ? 999999 : -999999;
        const now = h[refIdx].c;
        const prev = h[refIdx - days] ? h[refIdx - days].c : h[0].c;
        return (now - prev) / prev;
    };

    const getVolScore = (s, days, isAsc = false) => {
        const h = s.h || [];
        const refIdx = getRefIdx(h);
        if (refIdx < days * 2) return isAsc ? 999999 : -999999;
        const recent = h.slice(refIdx - days + 1, refIdx + 1).reduce((acc, curr) => acc + curr.v, 0);
        const prevIdx = refIdx - (days * 2) + 1;
        const prev = h.slice(prevIdx, refIdx - days + 1).reduce((acc, curr) => acc + curr.v, 0);
        return prev > 0 ? (recent / prev) : 0;
    };

    if (filterType === 'all') return stocks.map(s => ({ s, score: null, rank: null }));

    let scored = [];
    
    // 2. Handle Sector Top 5
    if (filterType.startsWith('sector-top')) {
        const days = filterType === 'sector-top-1w' ? 5 : 21;
        const allScored = stocks.map(s => ({ s, score: getMcapScore(s, days) }));
        
        // Group by sector
        const grouped = {};
        allScored.forEach(item => {
            const sid = getSectorId(item.s);
            if (!grouped[sid]) grouped[sid] = [];
            grouped[sid].push(item);
        });

        // Filter by selected sectors if needed
        let targetSectors = Object.keys(grouped);
        if (selectedSectors !== 'all') targetSectors = selectedSectors;

        let result = [];
        targetSectors.forEach(sid => {
            if (grouped[sid]) {
                const top5 = grouped[sid].sort((a, b) => b.score - a.score).slice(0, 5);
                top5.forEach((item, idx) => {
                    result.push({ ...item, rank: idx + 1 });
                });
            }
        });
        return result;
    }

    switch (filterType) {
        case 'mcap-up-1w':
            scored = stocks.map(s => ({ s, score: getMcapScore(s, 5) }));
            scored.sort((a, b) => b.score - a.score);
            break;
        case 'mcap-up-1m':
            scored = stocks.map(s => ({ s, score: getMcapScore(s, 21) }));
            scored.sort((a, b) => b.score - a.score);
            break;
        case 'mcap-up-3m':
            scored = stocks.map(s => ({ s, score: getMcapScore(s, 63) }));
            scored.sort((a, b) => b.score - a.score);
            break;
        case 'mcap-up-1y':
            scored = stocks.map(s => ({ s, score: getMcapScore(s, 252) }));
            scored.sort((a, b) => b.score - a.score);
            break;
        case 'mcap-down-1w':
            scored = stocks.map(s => ({ s, score: getMcapScore(s, 5) }));
            scored.sort((a, b) => a.score - b.score);
            break;
        case 'mcap-down-1m':
            scored = stocks.map(s => ({ s, score: getMcapScore(s, 21) }));
            scored.sort((a, b) => a.score - b.score);
            break;
        case 'mcap-down-3m':
            scored = stocks.map(s => ({ s, score: getMcapScore(s, 63) }));
            scored.sort((a, b) => a.score - b.score);
            break;
        case 'mcap-down-1y':
            scored = stocks.map(s => ({ s, score: getMcapScore(s, 252) }));
            scored.sort((a, b) => a.score - b.score);
            break;
        case 'vol-up-1w':
            scored = stocks.map(s => ({ s, score: getVolScore(s, 5) }));
            scored.sort((a, b) => b.score - a.score);
            break;
        case 'vol-up-1m':
            scored = stocks.map(s => ({ s, score: getVolScore(s, 21) }));
            scored.sort((a, b) => b.score - a.score);
            break;
        case 'vol-down-1w':
            scored = stocks.map(s => ({ s, score: getVolScore(s, 5, true) }));
            scored.sort((a, b) => a.score - b.score);
            break;
        case 'vol-down-1m':
            scored = stocks.map(s => ({ s, score: getVolScore(s, 21, true) }));
            scored.sort((a, b) => a.score - b.score);
            break;
        default:
            return stocks.map(s => ({ s, score: null, rank: null }));
    }

    return scored.slice(0, 10).map((item, index) => ({ ...item, rank: index + 1 }));
}

function switchDashboard(category) {
    currentCategory = category;
    const titleMap = { 
        'NASDAQ100': '나스닥 100 대시보드', 
        'SP500': 'S&P 500 대시보드',
        'SP500_EX_NDX': 'S&P 500 (나스닥 100 제외) 대시보드'
    };
    const indexCodeMap = { 
        'NASDAQ100': '^NDX', 
        'SP500': '^SPX',
        'SP500_EX_NDX': '^SPX'
    };
    
    document.getElementById('dashboard-title').textContent = titleMap[category];
    
    if (category === 'SP500_EX_NDX') {
        currentCategoryData = allStocksData.filter(s => s.t === 'SP500');
    } else {
        currentCategoryData = allStocksData.filter(s => s.t === category || s.t === 'BOTH' || s.t === undefined);
    }
    
    populateStockSelect(currentCategoryData);
    
    const indexCode = indexCodeMap[category];
    const indexItem = currentCategoryData.find(s => s.s === indexCode);
    currentStock = indexItem || currentCategoryData[0];
    
    if (currentStock && currentStock.h) {
        const sorted = [...currentStock.h].sort((a,b) => new Date(a.d) - new Date(b.d));
        document.getElementById('start-date').value = sorted[0].d;
        document.getElementById('end-date').value = sorted[sorted.length-1].d;
        
        const startObj = new Date(sorted[sorted.length-1].d);
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
    const scoredStocks = getFilteredStocks();
    const bubbleData = getBubbleDataForDateRange(scoredStocks, startDate, date);
    
    Object.keys(sectorConfig).forEach((sectorId, i) => {
        const sectorData = bubbleData.filter(d => d.sectorId === sectorId);
        if (bubbleChart.series[i]) {
            bubbleChart.series[i].setData(sectorData, false, false); 
        }
    });
    bubbleChart.redraw(false);
    document.getElementById('current-bubble-date').textContent = date;
}

function getBubbleDataForDateRange(scoredStocks, startDate, currentDate) {
    const filterType = document.getElementById('bubble-filter').value;
    const filterOption = document.querySelector(`#bubble-filter option[value="${filterType}"]`);
    const filterLabel = filterOption ? filterOption.textContent : '';

    return scoredStocks.map(item => {
        const stock = item.s;
        const score = item.score;
        const rank = item.rank;
        const history = stock.h;
        const currentIdx = history.findIndex(item => item.d === currentDate);
        const startIdx = history.findIndex(item => item.d >= startDate);
        if (currentIdx === -1 || startIdx === -1 || currentIdx < startIdx) return null;
        const current = history[currentIdx];
        const base = history[startIdx];
        const changePercent = Math.round(((current.c - base.c) / base.c) * 100);
        const marketCap = getMarketCap(stock.s, current.c);
        const sectorId = getSectorId(stock);

        let filterDisplay = '';
        if (score !== null) {
            const isVol = filterType.startsWith('vol');
            const scoreVal = isVol ? score.toFixed(2) : (score * 100).toFixed(1) + '%';
            filterDisplay = `<tr><td>순위:</td><td style="text-align:right"><b>Top ${rank}</b></td></tr>` +
                            `<tr><td>지표:</td><td style="text-align:right"><b>${scoreVal}</b></td></tr>` +
                            `<tr><td colspan="2" style="font-size:0.85em; color:#666; padding-top:4px;">※ 기준: ${filterLabel}</td></tr>`;
        }

        return {
            id: stock.s, x: changePercent, y: marketCap, z: current.v,
            name: stock.n, code: stock.s, color: sectorConfig[sectorId].color,
            sectorId: sectorId, sectorName: sectorConfig[sectorId].name, basis: sectorConfig[sectorId].basis,
            filterDisplay: filterDisplay
        };
    }).filter(d => d !== null);
}

function selectStockByCode(code) {
    currentStock = allStocksData.find(s => s.s === code);
    if (currentStock) { 
        updateStockDisplay(currentStock); 
        renderChart(currentStock, currentChartTimeframe); 
    }
}

function renderBubbleChart() {
    const scoredStocks = getFilteredStocks();
    bubbleDates = [...new Set(currentCategoryData.flatMap(s => s.h ? s.h.map(item => item.d) : []))].sort();
    if (bubbleDates.length === 0) return;
    const startDate = document.getElementById('bubble-start-date').value || bubbleDates[0];
    filteredBubbleDates = bubbleDates.filter(d => d >= startDate);
    const slider = document.getElementById('date-slider');
    if (slider) {
        slider.max = Math.max(filteredBubbleDates.length - 1, 0);
        slider.value = 0;
    }

    const indices = ['^NDX', '^SPX'];
    const allValidStocks = currentCategoryData.filter(s => !indices.includes(s.s));
    const startMCs = allValidStocks.map(s => {
        const idx = s.h ? s.h.findIndex(item => item.d >= startDate) : -1;
        return idx === -1 ? 0 : getMarketCap(s.s, s.h[idx].c);
    }).filter(v => v > 0);
    const maxMC = startMCs.length > 0 ? Math.max(...startMCs) : 1000;
    const minMC = startMCs.length > 0 ? Math.min(...startMCs) : 1;

    currentBubbleDateIndex = bubbleDates.indexOf(filteredBubbleDates[0]);
    if (currentBubbleDateIndex === -1) currentBubbleDateIndex = 0;
    
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
                         '<tr><td>기준일 이후 수익률:</td><td style="text-align:right"><b>{point.x}%</b></td></tr>' +
                         '<tr><td>추정시총:</td><td style="text-align:right"><b>${point.y}B</b></td></tr>' +
                         '<tr><td>거래량:</td><td style="text-align:right"><b>{point.z}</b></td></tr>' +
                         '{point.filterDisplay}',
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
    stocks.forEach(s => { const opt = document.createElement('option'); opt.value = s.s; opt.textContent = `${s.n} (${s.s})`; el.appendChild(opt); });
}

function updateStockDisplay(s) {
    if (document.getElementById('stock-name')) document.getElementById('stock-name').textContent = s.n;
    if (document.getElementById('stock-code')) document.getElementById('stock-code').textContent = s.s;
    if (document.getElementById('stock-select')) document.getElementById('stock-select').value = s.s;
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
    if (!s.h) return;
    let data = s.h.filter(item => (!start || item.d >= start) && (!end || item.d <= end));
    if (tf === 'Weekly') data = aggregateToWeekly(data); else if (tf === 'Monthly') data = aggregateToMonthly(data);
    data.sort((a,b) => new Date(a.d) - new Date(b.d));
    const ohlc = data.map(item => [new Date(item.d).getTime(), item.o, item.h, item.l, item.c]);
    const vol = data.map(item => [new Date(item.d).getTime(), item.v]);
    
    stockChart = Highcharts.stockChart('container', {
        rangeSelector: { enabled: false },
        title: { text: `${s.n} 주가 분석` },
        yAxis: [{ labels: { align: 'right', x: -3 }, title: { text: '주가' }, height: '60%', lineWidth: 2, resize: { enabled: true } },
                { labels: { align: 'right', x: -3 }, title: { text: '거래량' }, top: '65%', height: '35%', offset: 0, lineWidth: 2 }],
        series: [{ type: 'candlestick', name: s.n, id: s.s, data: ohlc, color: '#0000FF', upColor: '#FF0000' },
                { type: 'column', name: 'Volume', data: vol, yAxis: 1 }]
    });
}

function aggregateToWeekly(data) {
    const res = []; let week = [];
    data.forEach((d, i) => {
        week.push(d); const next = data[i+1];
        if (!next || new Date(next.d).getDay() === 1) {
            res.push({ d: week[week.length-1].d, o: week[0].o, h: Math.max(...week.map(w => w.h)), l: Math.min(...week.map(w => w.l)), c: week[week.length-1].c, v: week.reduce((s, w) => s + w.v, 0) });
            week = [];
        }
    });
    return res;
}

function aggregateToMonthly(data) {
    const res = []; let mon = [];
    data.forEach((d, i) => {
        mon.push(d); const next = data[i+1];
        if (!next || new Date(next.d).getMonth() !== new Date(d.d).getMonth()) {
            res.push({ d: mon[mon.length-1].d, o: mon[0].o, h: Math.max(...mon.map(m => m.h)), l: Math.min(...mon.map(m => m.l)), c: mon[mon.length-1].c, v: mon.reduce((s, m) => s + m.v, 0) });
            mon = [];
        }
    });
    return res;
}