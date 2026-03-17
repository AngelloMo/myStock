# NASDAQ 100 Stock Analysis Page

## Overview

This project is a single-page web application that allows users to view historical stock data for all NASDAQ 100 constituents and the index itself. Users can select a stock and view its candlestick chart across different timeframes (Daily, Weekly, Monthly).

## Features

*   **Stock Data Generation:** A Python script (`generate_stock_data.py`) fetches historical OHLCV (Open, High, Low, Close, Volume) data for all NASDAQ 100 stocks and the index (^NDX) from Stooq. This data is saved into a `stock.json` file.
*   **Stock Selection & Search:** Users can search for a specific stock by name or ticker and select it from a dropdown list to view its historical data.
*   **Timeframe Selection:** Users can switch between Daily, Weekly, and Monthly views of the stock chart.
*   **Data Aggregation:** The application aggregates daily data into weekly and monthly formats on the client-side to display charts for different timeframes.
*   **Interactive Chart:** Displays an interactive historical candlestick chart using Highcharts Stock, including volume data.
*   **Bubble Chart Animation & Filtering:** Visualizes stock price changes over time with animated bubbles. Includes play/pause controls, a date slider for manual navigation, and configurable speed multipliers (0.25x to 4x). **Stock filtering (e.g., Top 10 Gainers) is dynamically calculated based on the performance over the specified period (1 week, 1 month, etc.) starting FROM the selected reference date (기준일 기준), and the specific rank (Top X) and indicator values are displayed in the chart's tooltip.**
*   **Real-time Visitor Counter:** Tracks total and daily visitor counts using CounterAPI. Stats are viewable on the Admin page. Optimized for high performance (2026-03-16) by implementing direct API calls and parallel data fetching.

## Tech Stack

*   **Frontend:** HTML, CSS, JavaScript
*   **Charting Library:** Highcharts Stock
*   **Data Generation (Backend/Script):** Python (with `requests` library for fetching CSV data and `json` module for output).
*   **Data Source:** Stooq.com (historical CSV export).

## Implementation Details

*   The `generate_stock_data.py` script fetches data for nearly 100 NASDAQ 100 stocks and the index for the last 3 years.
*   The web application (`index.html`, `style.css`, `main.js`) loads the `stock.json` file.
*   `main.js` populates a dropdown with the available stocks and provides real-time filtering via a search input.
*   Users can select a stock and then choose a timeframe (Daily, Weekly, Monthly).
*   The `main.js` contains functions to aggregate daily historical data into weekly and monthly OHLCV data.
*   Highcharts Stock is used to render responsive and interactive candlestick charts, displaying Open, High, Low, Close, and Volume for the selected stock and timeframe.

## Automation

This project is configured with a GitHub Action (`.github/workflows/daily_update.yml`) that automatically updates the stock data every day.

*   **Schedule**: Runs daily at 00:00 UTC (approximately after the US market close).
*   **Process**:
    1.  Sets up a Python environment.
    2.  Installs dependencies (`requests`, `pandas`, `lxml`, `html5lib`).
    3.  Runs `generate_stock_data.py` to fetch the latest year of historical data from Stooq.
    4.  Commits and pushes the updated `stock.json` back to the repository.
    5.  This push triggers the `deploy.yml` workflow, which redeploys the site to GitHub Pages.

## How to run:

1.  **Generate `stock.json`**: Run the `generate_stock_data.py` script using `nix-shell --run "python3 generate_stock_data.py"`. This will create the `stock.json` file in the project root.
2.  **Serve the application**: Start a local web server (e.g., `python3 -m http.server 8080 --bind 0.0.0.0`).
3.  **Open in browser**: Navigate to `http://localhost:8080` in your web browser.
