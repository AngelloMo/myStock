import requests
import json
import datetime
import time
from io import StringIO
import csv
import pandas as pd

def get_sp500_tickers():
    """Fetches S&P 500 tickers from Wikipedia with User-Agent to avoid 403."""
    url = 'https://en.wikipedia.org/wiki/List_of_S%26P_500_companies'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        tables = pd.read_html(StringIO(response.text))
        df = tables[0]
        tickers = []
        for _, row in df.iterrows():
            symbol = row['Symbol'].replace('.', '-') # Stooq/Yahoo compatibility
            tickers.append({
                'name': row['Security'],
                'code': f"{symbol.lower()}.us",
                'category': 'SP500'
            })
        print(f"Successfully fetched {len(tickers)} S&P 500 tickers from Wikipedia.")
        return tickers
    except Exception as e:
        print(f"Error fetching S&P 500 list: {e}")
        return []

def generate_stock_data():
    # Base NASDAQ 100 components
    nasdaq100_configs = [
        {'name': '나스닥 100 지수 (NASDAQ 100 Index)', 'code': '^ndx', 'category': 'NASDAQ100'},
        {'name': 'Apple Inc.', 'code': 'aapl.us', 'category': 'NASDAQ100'},
        {'name': 'Microsoft Corporation', 'code': 'msft.us', 'category': 'NASDAQ100'},
        {'name': 'Amazon.com, Inc.', 'code': 'amzn.us', 'category': 'NASDAQ100'},
        {'name': 'Alphabet Inc. (Class A)', 'code': 'googl.us', 'category': 'NASDAQ100'},
        {'name': 'Alphabet Inc. (Class C)', 'code': 'goog.us', 'category': 'NASDAQ100'},
        {'name': 'Meta Platforms, Inc.', 'code': 'meta.us', 'category': 'NASDAQ100'},
        {'name': 'NVIDIA Corporation', 'code': 'nvda.us', 'category': 'NASDAQ100'},
        {'name': 'Tesla, Inc.', 'code': 'tsla.us', 'category': 'NASDAQ100'},
        {'name': 'Broadcom Inc.', 'code': 'avgo.us', 'category': 'NASDAQ100'},
        {'name': 'PepsiCo, Inc.', 'code': 'pep.us', 'category': 'NASDAQ100'},
        {'name': 'Costco Wholesale Corp.', 'code': 'cost.us', 'category': 'NASDAQ100'},
        {'name': 'Netflix, Inc.', 'code': 'nflx.us', 'category': 'NASDAQ100'},
        {'name': 'Advanced Micro Devices, Inc.', 'code': 'amd.us', 'category': 'NASDAQ100'},
        {'name': 'Adobe Inc.', 'code': 'adbe.us', 'category': 'NASDAQ100'},
        {'name': 'Cisco Systems, Inc.', 'code': 'csco.us', 'category': 'NASDAQ100'},
        {'name': 'Intel Corporation', 'code': 'intc.us', 'category': 'NASDAQ100'},
        {'name': 'Qualcomm Inc.', 'code': 'qcom.us', 'category': 'NASDAQ100'},
        {'name': 'Texas Instruments Inc.', 'code': 'txn.us', 'category': 'NASDAQ100'},
        {'name': 'Amgen Inc.', 'code': 'amgn.us', 'category': 'NASDAQ100'},
        {'name': 'Intuitive Surgical, Inc.', 'code': 'isrg.us', 'category': 'NASDAQ100'},
        {'name': 'Honeywell International Inc.', 'code': 'hon.us', 'category': 'NASDAQ100'},
        {'name': 'Comcast Corporation', 'code': 'cmcsa.us', 'category': 'NASDAQ100'},
        {'name': 'Starbucks Corporation', 'code': 'sbux.us', 'category': 'NASDAQ100'},
        {'name': 'Applied Materials, Inc.', 'code': 'amat.us', 'category': 'NASDAQ100'},
        {'name': 'Booking Holdings Inc.', 'code': 'bkng.us', 'category': 'NASDAQ100'},
        {'name': 'Gilead Sciences, Inc.', 'code': 'gild.us', 'category': 'NASDAQ100'},
        {'name': 'Mondelez International, Inc.', 'code': 'mdlz.us', 'category': 'NASDAQ100'},
        {'name': 'Analog Devices, Inc.', 'code': 'adi.us', 'category': 'NASDAQ100'},
        {'name': 'T-Mobile US, Inc.', 'code': 'tmus.us', 'category': 'NASDAQ100'},
        {'name': 'Lam Research Corporation', 'code': 'lrcx.us', 'category': 'NASDAQ100'},
        {'name': 'Micron Technology, Inc.', 'code': 'mu.us', 'category': 'NASDAQ100'},
        {'name': 'Vertex Pharmaceuticals Inc.', 'code': 'vrtx.us', 'category': 'NASDAQ100'},
        {'name': 'CSX Corporation', 'code': 'csx.us', 'category': 'NASDAQ100'},
        {'name': 'Regeneron Pharmaceuticals, Inc.', 'code': 'regn.us', 'category': 'NASDAQ100'},
        {'name': 'MercadoLibre, Inc.', 'code': 'meli.us', 'category': 'NASDAQ100'},
        {'name': 'Airbnb, Inc.', 'code': 'abnb.us', 'category': 'NASDAQ100'},
        {'name': 'ASML Holding N.V.', 'code': 'asml.us', 'category': 'NASDAQ100'},
        {'name': 'Palo Alto Networks, Inc.', 'code': 'panw.us', 'category': 'NASDAQ100'},
        {'name': 'Palantir Technologies Inc.', 'code': 'pltr.us', 'category': 'NASDAQ100'},
        {'name': 'MicroStrategy Incorporated', 'code': 'mstr.us', 'category': 'NASDAQ100'},
        {'name': 'Axon Enterprise, Inc.', 'code': 'axon.us', 'category': 'NASDAQ100'},
        {'name': 'PayPal Holdings, Inc.', 'code': 'pypl.us', 'category': 'NASDAQ100'},
        {'name': 'Autodesk, Inc.', 'code': 'adsk.us', 'category': 'NASDAQ100'},
        {'name': 'American Electric Power Company, Inc.', 'code': 'aep.us', 'category': 'NASDAQ100'},
        {'name': 'ANSYS, Inc.', 'code': 'anss.us', 'category': 'NASDAQ100'},
        {'name': 'AstraZeneca PLC', 'code': 'azn.us', 'category': 'NASDAQ100'},
        {'name': 'Baker Hughes Company', 'code': 'bkr.us', 'category': 'NASDAQ100'},
        {'name': 'Cadence Design Systems, Inc.', 'code': 'cdns.us', 'category': 'NASDAQ100'},
        {'name': 'Constellation Energy Corporation', 'code': 'ceg.us', 'category': 'NASDAQ100'},
        {'name': 'Charter Communications, Inc.', 'code': 'chtr.us', 'category': 'NASDAQ100'},
        {'name': 'Corpay, Inc.', 'code': 'cpay.us', 'category': 'NASDAQ100'},
        {'name': 'Copart, Inc.', 'code': 'cprt.us', 'category': 'NASDAQ100'},
        {'name': 'CrowdStrike Holdings, Inc.', 'code': 'crwd.us', 'category': 'NASDAQ100'},
        {'name': 'Cintas Corporation', 'code': 'ctas.us', 'category': 'NASDAQ100'},
        {'name': 'Cognizant Technology Solutions Corp.', 'code': 'ctsh.us', 'category': 'NASDAQ100'},
        {'name': 'DoorDash, Inc.', 'code': 'dash.us', 'category': 'NASDAQ100'},
        {'name': 'Datadog, Inc.', 'code': 'ddog.us', 'category': 'NASDAQ100'},
        {'name': 'Dollar Tree, Inc.', 'code': 'dltr.us', 'category': 'NASDAQ100'},
        {'name': 'Dexcom, Inc.', 'code': 'dxcm.us', 'category': 'NASDAQ100'},
        {'name': 'Electronic Arts Inc.', 'code': 'ea.us', 'category': 'NASDAQ100'},
        {'name': 'eBay Inc.', 'code': 'ebay.us', 'category': 'NASDAQ100'},
        {'name': 'Exelon Corporation', 'code': 'exc.us', 'category': 'NASDAQ100'},
        {'name': 'Fastenal Company', 'code': 'fast.us', 'category': 'NASDAQ100'},
        {'name': 'Fortinet, Inc.', 'code': 'ftnt.us', 'category': 'NASDAQ100'},
        {'name': 'IDEXX Laboratories, Inc.', 'code': 'idxx.us', 'category': 'NASDAQ100'},
        {'name': 'Intuit Inc.', 'code': 'intu.us', 'category': 'NASDAQ100'},
        {'name': 'Keurig Dr Pepper Inc.', 'code': 'kdp.us', 'category': 'NASDAQ100'},
        {'name': 'Lululemon Athletica Inc.', 'code': 'lulu.us', 'category': 'NASDAQ100'},
        {'name': 'Marriott International, Inc.', 'code': 'mar.us', 'category': 'NASDAQ100'},
        {'name': 'Microchip Technology Inc.', 'code': 'mchp.us', 'category': 'NASDAQ100'},
        {'name': 'MongoDB, Inc.', 'code': 'mdb.us', 'category': 'NASDAQ100'},
        {'name': 'Monster Beverage Corporation', 'code': 'mnst.us', 'category': 'NASDAQ100'},
        {'name': 'NXP Semiconductors N.V.', 'code': 'nxpi.us', 'category': 'NASDAQ100'},
        {'name': 'Old Dominion Freight Line, Inc.', 'code': 'odfl.us', 'category': 'NASDAQ100'},
        {'name': 'ON Semiconductor Corporation', 'code': 'on.us', 'category': 'NASDAQ100'},
        {'name': 'O\'Reilly Automotive, Inc.', 'code': 'orly.us', 'category': 'NASDAQ100'},
        {'name': 'Paychex, Inc.', 'code': 'payx.us', 'category': 'NASDAQ100'},
        {'name': 'PACCAR Inc.', 'code': 'pcar.us', 'category': 'NASDAQ100'},
        {'name': 'PDD Holdings Inc.', 'code': 'pdd.us', 'category': 'NASDAQ100'},
        {'name': 'Roper Technologies, Inc.', 'code': 'rop.us', 'category': 'NASDAQ100'},
        {'name': 'Ross Stores, Inc.', 'code': 'rost.us', 'category': 'NASDAQ100'},
        {'name': 'Synopsys, Inc.', 'code': 'snps.us', 'category': 'NASDAQ100'},
        {'name': 'Atlassian Corporation', 'code': 'team.us', 'category': 'NASDAQ100'},
        {'name': 'Verisk Analytics, Inc.', 'code': 'vrsk.us', 'category': 'NASDAQ100'},
        {'name': 'Warner Bros. Discovery, Inc.', 'code': 'wbd.us', 'category': 'NASDAQ100'},
        {'name': 'Workday, Inc.', 'code': 'wday.us', 'category': 'NASDAQ100'},
        {'name': 'Walmart Inc.', 'code': 'wmt.us', 'category': 'NASDAQ100'},
        {'name': 'Xcel Energy Inc.', 'code': 'xel.us', 'category': 'NASDAQ100'},
        {'name': 'Zscaler, Inc.', 'code': 'zs.us', 'category': 'NASDAQ100'},
    ]

    print("Fetching S&P 500 ticker list...")
    sp500_configs = get_sp500_tickers()
    sp500_index = [{'name': 'S&P 500 지수 (S&P 500 Index)', 'code': '^spx', 'category': 'SP500'}]
    
    all_configs = nasdaq100_configs + sp500_index + sp500_configs

    all_stock_data = []
    today = datetime.date.today()
    three_years_ago = today - datetime.timedelta(days=3*365)

    # Use unique codes to avoid double fetching
    unique_codes = {}
    for config in all_configs:
        code = config['code']
        if code not in unique_codes:
            unique_codes[code] = config
        else:
            # If a stock is in both, mark it as BOTH to be visible in both dashboards
            if unique_codes[code]['category'] != config['category']:
                unique_codes[code]['category'] = 'BOTH'

    print(f"Total unique stocks to fetch: {len(unique_codes)}")

    # FETCH LIMIT for safety and time - fetching 500+ takes a while. 
    # For now, let's fetch ALL as requested, but maybe with a slightly faster pace or skipping failures quickly.
    
    for i, (code, config) in enumerate(unique_codes.items()):
        name = config['name']
        category = config['category']

        print(f"[{i+1}/{len(unique_codes)}] Fetching data for {name} ({code})...")
        try:
            url = f"https://stooq.com/q/d/l/?s={code}&i=d"
            response = requests.get(url)
            response.raise_for_status()

            if "Date,Open,High,Low,Close,Volume" not in response.text:
                 print(f"   Invalid data format for {name} ({code})")
                 continue

            csv_file = StringIO(response.text)
            reader = csv.DictReader(csv_file)

            stock_data = []
            for row in reader:
                if not all(k in row and row[k] for k in ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']):
                    continue
                
                try:
                    row_date = datetime.datetime.strptime(row['Date'], '%Y-%m-%d').date()
                except ValueError:
                    continue

                if row_date >= three_years_ago:
                    stock_data.append({
                        'Date': row['Date'],
                        'Open': round(float(row['Open']), 2),
                        'High': round(float(row['High']), 2),
                        'Low': round(float(row['Low']), 2),
                        'Close': round(float(row['Close']), 2),
                        'Volume': int(float(row['Volume'])) if row['Volume'] else 0
                    })

            if not stock_data:
                print(f"   No recent data found for {name} ({code})")
                continue

            stock_data.sort(key=lambda x: x['Date'])

            all_stock_data.append({
                'name': name,
                'code': code.upper().replace('.US', ''),
                'category': category,
                'historicalData': stock_data
            })
            # Pacing - slightly faster to finish in reasonable time
            time.sleep(0.1) 
        except Exception as e:
            print(f"   Error fetching data for {name} ({code}): {e}")

    with open('stock.json', 'w', encoding='utf-8') as f:
        json.dump(all_stock_data, f, ensure_ascii=False, indent=4)
    print(f"stock.json generated successfully with data for {len(all_stock_data)} stocks.")

if __name__ == '__main__':
    generate_stock_data()
