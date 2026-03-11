# 📈 NASDAQ 100 Stock Analysis Dashboard

[![Daily Data Update](https://github.com/AngelloMo/myStock/actions/workflows/daily_update.yml/badge.svg)](https://github.com/AngelloMo/myStock/actions/workflows/daily_update.yml)
[![Deploy to Pages](https://github.com/AngelloMo/myStock/actions/workflows/deploy.yml/badge.svg)](https://github.com/AngelloMo/myStock/actions/workflows/deploy.yml)

An interactive, high-performance web dashboard for visualizing and analyzing NASDAQ 100 constituents and S&P 500 stocks. 

---

## 🌟 Key Features

- **Real-time Data Visualization**: Interactive candlestick charts with volume using Highcharts Stock.
- **Multi-Timeframe Support**: Seamlessly switch between Daily, Weekly, and Monthly views.
- **Smart Search**: Quickly find stocks by ticker or company name.
- **Automated Updates**: Data is automatically updated daily via GitHub Actions.
- **Data Compression**: Optimized JSON format for fast loading and efficient storage.

---

## 📸 Screenshots

### 📊 Stock Analysis View
![Stock Analysis View](https://raw.githubusercontent.com/AngelloMo/myStock/main/docs/screenshots/nasdaq-60days.png)
*(Note: Replace this with your actual bubble chart or dashboard screenshot)*

---

## 🚀 Getting Started

### Prerequisites
- Python 3.x
- Nix (optional, for environment setup)

### Local Development

1. **Generate `stock.json`**:
   ```bash
   nix-shell --run "python3 generate_stock_data.py"
   ```
   *This fetches the latest year of historical data from Stooq.*

2. **Run Local Server**:
   ```bash
   python3 -m http.server 8080
   ```

3. **Access Dashboard**:
   Open your browser and navigate to `http://localhost:8080`.

---

## ⚙️ Automation

This project uses **GitHub Actions** to stay up-to-date:
- **Daily Update**: Runs every day at 00:00 UTC to fetch the latest market data.
- **Auto Deploy**: Automatically redeploys the site to GitHub Pages whenever data changes.

---

## 🛠 Tech Stack

- **Frontend**: HTML5, Vanilla CSS, JavaScript
- **Charting**: [Highcharts Stock](https://www.highcharts.com/products/stock/)
- **Data Processing**: Python (Pandas, Requests)
- **Deployment**: GitHub Pages

---

## 📄 License
This project is for educational and analysis purposes. Data provided by [Stooq](https://stooq.com).
