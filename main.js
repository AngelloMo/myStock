let allStocksData = [];
let currentStock = null;
let currentChartTimeframe = 'Daily'; // Default timeframe
let bubbleChart = null;
let bubbleDates = [];
let currentBubbleDateIndex = 0;
let bubbleAnimationInterval = null;
let stockColors = {};

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
            
            // Assign fixed colors to stocks for consistency in bubble chart
            const colors = Highcharts.getOptions().colors;
            allStocksData.filter(s => s.code !== '^NDX').forEach((stock, i) => {
                stockColors[stock.code] = colors[i % colors.length];
            });

            // 2. Populate stock selection dropdown
            populateStockSelect(allStocksData);

            // 3. Render Bubble Chart for all stocks
            renderBubbleChart(allStocksData);

            // Select NASDAQ 100 Index by default if available, otherwise select the first stock
            if (allStocksData.length > 0) {
                const ndxIndex = allStocksData.findIndex(stock => stock.code === '^NDX');
                if (ndxIndex !== -1) {
                    currentStock = allStocksData[ndxIndex];
                } else {
                    currentStock = allStocksData[0];
                }
                
                // Set initial date range values
                if (currentStock.historicalData && currentStock.historicalData.length > 0) {
                    const sortedData = [...currentStock.historicalData].sort((a, b) => new Date(a.Date) - new Date(b.Date));
                    document.getElementById('start-date').value = sortedData[0].Date;
                    document.getElementById('end-date').value = sortedData[sortedData.length - 1].Date;
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

    // Date range change functionality
    document.getElementById('start-date').addEventListener('change', () => {
        if (currentStock) renderChart(currentStock, currentChartTimeframe);
    });
    document.getElementById('end-date').addEventListener('change', () => {
        if (currentStock) renderChart(currentStock, currentChartTimeframe);
    });

    // Handle stock selection changes
    document.getElementById('stock-select').addEventListener('change', (event) => {
        const selectedCode = event.target.value;
        selectStockByCode(selectedCode);
    });

    // Bubble animation play button
    document.getElementById('play-bubble').addEventListener('click', toggleBubbleAnimation);
});

function toggleBubbleAnimation() {
    const btn = document.getElementById('play-bubble');
    if (bubbleAnimationInterval) {
        clearInterval(bubbleAnimationInterval);
        bubbleAnimationInterval = null;
        btn.textContent = '재생 (Play)';
    } else {
        // Filter dates based on selected range
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        const filteredDates = bubbleDates.filter(d => {
            if (startDate && d < startDate) return false;
            if (endDate && d > endDate) return false;
            return true;
        });

        if (filteredDates.length === 0) return;

        // If current date is outside range or at the end, reset to start of range
        const currentDate = bubbleDates[currentBubbleDateIndex];
        if (currentDate < filteredDates[0] || currentDate >= filteredDates[filteredDates.length - 1]) {
            currentBubbleDateIndex = bubbleDates.indexOf(filteredDates[0]);
        }

        btn.textContent = '일시정지 (Pause)';
        
        // Update immediately to the start date if we just reset
        updateBubbleChart(bubbleDates[currentBubbleDateIndex]);

        bubbleAnimationInterval = setInterval(() => {
            currentBubbleDateIndex++;
            if (currentBubbleDateIndex >= bubbleDates.length || (endDate && bubbleDates[currentBubbleDateIndex] > endDate)) {
                // Wrap around or stop at range end
                const firstValidDate = startDate ? bubbleDates.find(d => d >= startDate) : bubbleDates[0];
                currentBubbleDateIndex = bubbleDates.indexOf(firstValidDate);
            }
            updateBubbleChart(bubbleDates[currentBubbleDateIndex]);
        }, 150); // Faster interval for smoother motion (150ms)
    }
}

function updateBubbleChart(date) {
    if (!bubbleChart) return;
    const bubbleData = getBubbleDataForDate(allStocksData, date);
    // Use setData with animation for smooth transition
    bubbleChart.series[0].setData(bubbleData, true, { duration: 150 });
    document.getElementById('current-bubble-date').textContent = date;
}

function getBubbleDataForDate(stocks, date) {
    return stocks.filter(s => s.code !== '^NDX').map(stock => {
        const history = stock.historicalData;
        const index = history.findIndex(d => d.Date === date);
        if (index < 1) return null;
        
        const current = history[index];
        const prev = history[index - 1];
        const changePercent = ((current.Close - prev.Close) / prev.Close) * 100;
        
        return {
            id: stock.code, // Fixed ID for Highcharts to track the same bubble
            x: parseFloat(changePercent.toFixed(2)),
            y: current.Volume,
            z: current.Volume,
            name: stock.name,
            code: stock.code,
            color: stockColors[stock.code] // Consistent color
        };
    }).filter(d => d !== null);
}

function selectStockByCode(selectedCode) {
    currentStock = allStocksData.find(stock => stock.code === selectedCode);
    if (currentStock) {
        // Update dates for new stock
        if (currentStock.historicalData && currentStock.historicalData.length > 0) {
            const sortedData = [...currentStock.historicalData].sort((a, b) => new Date(a.Date) - new Date(b.Date));
            document.getElementById('start-date').value = sortedData[0].Date;
            document.getElementById('end-date').value = sortedData[sortedData.length - 1].Date;
        }
        document.getElementById('stock-select').value = currentStock.code;
        updateStockDisplay(currentStock);
        renderChart(currentStock, currentChartTimeframe);
        
        // Scroll to chart
        document.getElementById('recommendation').scrollIntoView({ behavior: 'smooth' });
    }
}

function renderBubbleChart(stocks) {
    // Get all unique dates from all stocks
    bubbleDates = [...new Set(stocks.flatMap(s => s.historicalData.map(d => d.Date)))].sort();
    
    // Find max volume across ALL data to fix Y axis
    const allVolumes = stocks.flatMap(s => s.historicalData.map(d => d.Volume));
    const maxVolume = Math.max(...allVolumes);

    currentBubbleDateIndex = bubbleDates.length - 1;
    const initialDate = bubbleDates[currentBubbleDateIndex];
    
    const bubbleData = getBubbleDataForDate(stocks, initialDate);
    document.getElementById('current-bubble-date').textContent = initialDate;

    bubbleChart = Highcharts.chart('bubble-container', {
        chart: {
            type: 'bubble',
            plotBorderWidth: 1,
            zoomType: 'xy',
            animation: {
                duration: 150
            }
        },
        title: {
            text: ''
        },
        xAxis: {
            gridLineWidth: 1,
            title: {
                text: '등락률 (%)'
            },
            labels: {
                format: '{value}%'
            },
            plotLines: [{
                color: 'black',
                dashStyle: 'dot',
                width: 2,
                value: 0,
                label: {
                    rotation: 0,
                    y: 15,
                    style: {
                        fontStyle: 'italic'
                    },
                    text: '보합'
                },
                zIndex: 3
            }],
            min: -15, // Wider range for more movement
            max: 15
        },
        yAxis: {
            startOnTick: false,
            endOnTick: false,
            title: {
                text: '거래량'
            },
            labels: {
                format: '{value}'
            },
            min: 0,
            max: maxVolume * 1.1 // Fixed Y axis based on global max
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<table>',
            pointFormat: '<tr><th colspan="2"><h3>{point.name} ({point.code})</h3></th></tr>' +
                '<tr><th>등락률:</th><td>{point.x}%</td></tr>' +
                '<tr><th>거래량:</th><td>{point.y}</td></tr>',
            footerFormat: '</table>',
            followPointer: true
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.code}',
                    style: {
                        fontSize: '9px'
                    }
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            selectStockByCode(this.code);
                        }
                    }
                },
                animation: {
                    duration: 150
                },
                marker: {
                    fillOpacity: 0.7
                }
            }
        },
        series: [{
            name: '종목별 등락',
            data: bubbleData,
            colorByPoint: false // Handled by fixed colors in data
        }]
    });
}

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

    // Filter by Date Range
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    let filteredData = stock.historicalData;
    if (startDate || endDate) {
        filteredData = stock.historicalData.filter(d => {
            let matches = true;
            if (startDate && d.Date < startDate) matches = false;
            if (endDate && d.Date > endDate) matches = false;
            return matches;
        });
    }

    switch (timeframe) {
        case 'Daily':
            dataToRender = filteredData;
            processedStockName += ' (일봉)';
            break;
        case 'Weekly':
            dataToRender = aggregateToWeekly(filteredData);
            processedStockName += ' (주봉)';
            break;
        case 'Monthly':
            dataToRender = aggregateToMonthly(filteredData);
            processedStockName += ' (월봉)';
            break;
        default:
            dataToRender = filteredData;
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
            enabled: false // Using our own date inputs
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

    // Filter by Date Range
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    let filteredData = stock.historicalData;
    if (startDate || endDate) {
        filteredData = stock.historicalData.filter(d => {
            let matches = true;
            if (startDate && d.Date < startDate) matches = false;
            if (endDate && d.Date > endDate) matches = false;
            return matches;
        });
    }

    switch (timeframe) {
        case 'Daily':
            dataToRender = filteredData;
            processedStockName += ' (일봉)';
            break;
        case 'Weekly':
            dataToRender = aggregateToWeekly(filteredData);
            processedStockName += ' (주봉)';
            break;
        case 'Monthly':
            dataToRender = aggregateToMonthly(filteredData);
            processedStockName += ' (월봉)';
            break;
        default:
            dataToRender = filteredData;
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
            enabled: false // Using our own date inputs
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