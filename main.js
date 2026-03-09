let allStocksData = [];
let currentStock = null;
let currentChartTimeframe = 'Daily'; // Default timeframe

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fetch stock.json
    fetch('stock.json')
        .then(response => {
            if (!response.ok) {
                // If stock.json is not found, or other HTTP error
                if (response.status === 404) {
                    throw new Error('stock.json not found. Please run generate_stock_data.py first.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allStocksData = data;
            // 2. Populate stock selection dropdown
            populateStockSelect(allStocksData);

            // Select NASDAQ 100 Index by default if available, otherwise select the first stock
            if (allStocksData.length > 0) {
                const ndxIndex = allStocksData.findIndex(stock => stock.code === '^NDX');
                if (ndxIndex !== -1) {
                    currentStock = allStocksData[ndxIndex];
                } else {
                    currentStock = allStocksData[0];
                }
                
                // Explicitly set the dropdown value and update display
                document.getElementById('stock-select').value = currentStock.code;
                updateStockDisplay(currentStock);
                renderChart(currentStock, currentChartTimeframe);
            }
        })
        .catch(error => {
            console.error('Error fetching stock.json:', error);
            document.getElementById('stock-name').textContent = 'Error loading stock data: ' + error.message;
            document.getElementById('stock-code').textContent = '';
        });

    // Stock search functionality
    document.getElementById('stock-search').addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredStocks = allStocksData.filter(stock => 
            stock.name.toLowerCase().includes(query) || 
            stock.code.toLowerCase().includes(query)
        );
        populateStockSelect(filteredStocks);
        
        // Optionally select the first filtered result automatically
        if (filteredStocks.length > 0) {
             const firstStock = filteredStocks[0];
             // If the current stock is not in the filtered list, update to first filtered stock
             if (!filteredStocks.some(s => s.code === currentStock.code)) {
                 currentStock = firstStock;
                 updateStockDisplay(currentStock);
                 renderChart(currentStock, currentChartTimeframe);
             }
        }
    });

    // 3. Implement timeframe selection
    document.getElementById('timeframe-daily').addEventListener('click', () => setTimeframe('Daily'));
    document.getElementById('timeframe-weekly').addEventListener('click', () => setTimeframe('Weekly'));
    document.getElementById('timeframe-monthly').addEventListener('click', () => setTimeframe('Monthly'));

    // Handle stock selection changes
    document.getElementById('stock-select').addEventListener('change', (event) => {
        const selectedCode = event.target.value;
        currentStock = allStocksData.find(stock => stock.code === selectedCode);
        if (currentStock) {
            updateStockDisplay(currentStock);
            renderChart(currentStock, currentChartTimeframe);
        }
    });
});

function populateStockSelect(stocks) {
    const selectElement = document.getElementById('stock-select');
    selectElement.innerHTML = ''; // Clear previous options
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
}

function setTimeframe(timeframe) {
    // Remove 'active' class from all timeframe buttons
    document.querySelectorAll('.controls button').forEach(button => {
        button.classList.remove('active');
    });
    // Add 'active' class to the clicked button
    document.getElementById(`timeframe-${timeframe.toLowerCase()}`).classList.add('active');

    currentChartTimeframe = timeframe;
    if (currentStock) {
        renderChart(currentStock, currentChartTimeframe);
    }
}

// 4. Implement data aggregation functions
function aggregateToWeekly(dailyData) {
    const weeklyData = [];
    let currentWeek = [];

    // Ensure data is sorted by date ascending
    dailyData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    dailyData.forEach((day, index) => {
        const date = new Date(day.Date);
        currentWeek.push(day);

        // Determine if this is the end of a week or the last day of data
        // A week ends on Sunday (day 0), so we look for next day being Monday (day 1)
        // Or if it's the last entry
        const nextDayDate = index < dailyData.length - 1 ? new Date(dailyData[index + 1].Date) : null;
        const isEndOfWeek = nextDayDate ? nextDayDate.getDay() === 1 : true; // Monday is 1, Sunday is 0

        if (isEndOfWeek || index === dailyData.length - 1) {
            if (currentWeek.length > 0) {
                const open = currentWeek[0].Open;
                const high = Math.max(...currentWeek.map(d => d.High));
                const low = Math.min(...currentWeek.map(d => d.Low));
                const close = currentWeek[currentWeek.length - 1].Close;
                const volume = currentWeek.reduce((sum, d) => sum + d.Volume, 0);
                const weekEndDate = new Date(currentWeek[currentWeek.length - 1].Date);

                weeklyData.push({
                    Date: weekEndDate.toISOString().split('T')[0],
                    Open: open,
                    High: high,
                    Low: low,
                    Close: close,
                    Volume: volume
                });
            }
            currentWeek = []; // Reset for the next week
        }
    });
    return weeklyData;
}


function aggregateToMonthly(dailyData) {
    const monthlyData = [];
    let currentMonth = [];

    // Ensure data is sorted by date ascending
    dailyData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    dailyData.forEach((day, index) => {
        const date = new Date(day.Date);
        currentMonth.push(day);

        // Determine if this is the end of a month or the last day of data
        const nextDayDate = index < dailyData.length - 1 ? new Date(dailyData[index + 1].Date) : null;
        const isEndOfMonth = nextDayDate ? nextDayDate.getMonth() !== date.getMonth() : true;

        if (isEndOfMonth || index === dailyData.length - 1) {
            if (currentMonth.length > 0) {
                const open = currentMonth[0].Open;
                const high = Math.max(...currentMonth.map(d => d.High));
                const low = Math.min(...currentMonth.map(d => d.Low));
                const close = currentMonth[currentMonth.length - 1].Close;
                const volume = currentMonth.reduce((sum, d) => sum + d.Volume, 0);
                const monthEndDate = new Date(currentMonth[currentMonth.length - 1].Date);

                monthlyData.push({
                    Date: monthEndDate.toISOString().split('T')[0],
                    Open: open,
                    High: high,
                    Low: low,
                    Close: close,
                    Volume: volume
                });
            }
            currentMonth = []; // Reset for the next month
        }
    });
    return monthlyData;
}


// 5 & 6. Update Highcharts rendering logic and handle stock selection changes
function renderChart(stock, timeframe) {
    let dataToRender = [];
    let processedStockName = stock.name;

    switch (timeframe) {
        case 'Daily':
            dataToRender = stock.historicalData;
            processedStockName += ' (일봉)';
            break;
        case 'Weekly':
            dataToRender = aggregateToWeekly(stock.historicalData);
            processedStockName += ' (주봉)';
            break;
        case 'Monthly':
            dataToRender = aggregateToMonthly(stock.historicalData);
            processedStockName += ' (월봉)';
            break;
        default:
            dataToRender = stock.historicalData;
            processedStockName += ' (일봉)';
    }

    // Ensure dataToRender is sorted by date before mapping for Highcharts
    dataToRender.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const ohlc = dataToRender.map(d => [new Date(d.Date).getTime(), d.Open, d.High, d.Low, d.Close]);
    const volume = dataToRender.map(d => [new Date(d.Date).getTime(), d.Volume]);

    Highcharts.stockChart('container', {
        chart: {
            height: 500
        },
        rangeSelector: {
            selected: 1 // 1 month
        },
        title: {
            text: `${processedStockName} 주가`
        },
        yAxis: [{
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: '주가 (OHLC)'
            },
            height: '60%',
            lineWidth: 2,
            resize: {
                enabled: true
            }
        }, {
            labels: {
                align: 'right',
                x: -3
            },
            title: {
                text: '거래량'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],
        tooltip: {
            split: true
        },
        series: [{
            type: 'candlestick',
            name: stock.name,
            id: stock.code,
            zIndex: 2,
            data: ohlc,
            // Highcharts' built-in data grouping might override custom aggregation
            // We disable it here as we are doing manual aggregation
            dataGrouping: {
                enabled: false
            },
            color: '#0000FF', // 하락 시 파란색 (Blue)
            lineColor: '#0000FF',
            upColor: '#FF0000', // 상승 시 빨간색 (Red)
            upLineColor: '#FF0000'
        }, {
            type: 'column',
            name: 'Volume',
            id: 'volume',
            data: volume,
            yAxis: 1,
            dataGrouping: {
                enabled: false
            }
        }]
    });
}