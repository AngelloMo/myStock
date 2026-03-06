# KOSPI 200 Stock Analysis Page

## Overview

This project is a single-page web application that allows users to view historical stock data for selected KOSPI 200 constituents. Users can select a stock and view its candlestick chart across different timeframes (Daily, Weekly, Monthly).

## Features

*   **Stock Data Generation:** A Python script (`generate_stock_data.py`) fetches historical OHLCV (Open, High, Low, Close, Volume) data for a predefined list of KOSPI stocks from a public GitHub repository. This data is then saved into a `stock.json` file.
*   **Stock Selection:** Users can select a specific stock from a dropdown list to view its historical data.
*   **Timeframe Selection:** Users can switch between Daily, Weekly, and Monthly views of the stock chart.
*   **Data Aggregation:** The application aggregates daily data into weekly and monthly formats on the client-side to display charts for different timeframes.
*   **Interactive Chart:** Displays an interactive historical candlestick chart using Highcharts Stock, including volume data.

## Tech Stack

*   **Frontend:** HTML, CSS, JavaScript
*   **Charting Library:** Highcharts Stock
*   **Data Generation (Backend/Script):** Python (with `requests` library for fetching CSV data and `json` module for output).
*   **Data Source:** CSV files from the `gomjellie/kospi-kosdaq-csv` GitHub repository.

## Implementation Details

*   The `generate_stock_data.py` script fetches data for a hardcoded list of 5 popular KOSPI stocks (Samsung Electronics, SK Hynix, LG Chem, NAVER, Hyundai Motor) for the last 3 years.
*   The web application (`index.html`, `style.css`, `main.js`) loads the `stock.json` file.
*   `main.js` populates a dropdown with the available stocks.
*   Users can select a stock and then choose a timeframe (Daily, Weekly, Monthly).
*   The `main.js` contains functions to aggregate daily historical data into weekly and monthly OHLCV data.
*   Highcharts Stock is used to render responsive and interactive candlestick charts, displaying Open, High, Low, Close, and Volume for the selected stock and timeframe.

## How to run:

1.  **Generate `stock.json`**: Run the `generate_stock_data.py` script using `nix-shell --run "python3 generate_stock_data.py"`. This will create the `stock.json` file in the project root.
2.  **Serve the application**: Start a local web server (e.g., `python3 -m http.server 8080 --bind 0.0.0.0`).
3.  **Open in browser**: Navigate to `http://localhost:8080` in your web browser.
