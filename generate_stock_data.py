import requests
import json
import datetime
import time
from io import StringIO
import csv

def generate_stock_data():
    # Expanded list of major NASDAQ 100 components + the index itself
    stock_codes = [
        {'name': '나스닥 100 지수 (NASDAQ 100 Index)', 'code': '^ndx'},
        {'name': 'Apple Inc.', 'code': 'aapl.us'},
        {'name': 'Microsoft Corporation', 'code': 'msft.us'},
        {'name': 'Amazon.com, Inc.', 'code': 'amzn.us'},
        {'name': 'Alphabet Inc. (Class A)', 'code': 'googl.us'},
        {'name': 'Alphabet Inc. (Class C)', 'code': 'goog.us'},
        {'name': 'Meta Platforms, Inc.', 'code': 'meta.us'},
        {'name': 'NVIDIA Corporation', 'code': 'nvda.us'},
        {'name': 'Tesla, Inc.', 'code': 'tsla.us'},
        {'name': 'Broadcom Inc.', 'code': 'avgo.us'},
        {'name': 'PepsiCo, Inc.', 'code': 'pep.us'},
        {'name': 'Costco Wholesale Corp.', 'code': 'cost.us'},
        {'name': 'Netflix, Inc.', 'code': 'nflx.us'},
        {'name': 'Advanced Micro Devices, Inc.', 'code': 'amd.us'},
        {'name': 'Adobe Inc.', 'code': 'adbe.us'},
        {'name': 'Cisco Systems, Inc.', 'code': 'csco.us'},
        {'name': 'Intel Corporation', 'code': 'intc.us'},
        {'name': 'Qualcomm Inc.', 'code': 'qcom.us'},
        {'name': 'Texas Instruments Inc.', 'code': 'txn.us'},
        {'name': 'Amgen Inc.', 'code': 'amgn.us'},
        {'name': 'Intuitive Surgical, Inc.', 'code': 'isrg.us'},
        {'name': 'Honeywell International Inc.', 'code': 'hon.us'},
        {'name': 'Comcast Corporation', 'code': 'cmcsa.us'},
        {'name': 'Starbucks Corporation', 'code': 'sbux.us'},
        {'name': 'Applied Materials, Inc.', 'code': 'amat.us'},
        {'name': 'Booking Holdings Inc.', 'code': 'bkng.us'},
        {'name': 'Gilead Sciences, Inc.', 'code': 'gild.us'},
        {'name': 'Mondelez International, Inc.', 'code': 'mdlz.us'},
        {'name': 'Analog Devices, Inc.', 'code': 'adi.us'},
        {'name': 'T-Mobile US, Inc.', 'code': 'tmus.us'},
        {'name': 'Lam Research Corporation', 'code': 'lrcx.us'},
        {'name': 'Micron Technology, Inc.', 'code': 'mu.us'},
        {'name': 'Vertex Pharmaceuticals Inc.', 'code': 'vrtx.us'},
        {'name': 'CSX Corporation', 'code': 'csx.us'},
        {'name': 'Regeneron Pharmaceuticals, Inc.', 'code': 'regn.us'},
        {'name': 'MercadoLibre, Inc.', 'code': 'meli.us'},
        {'name': 'Airbnb, Inc.', 'code': 'abnb.us'},
        {'name': 'ASML Holding N.V.', 'code': 'asml.us'},
        {'name': 'KLA Corporation', 'code': 'kla.us'},
        {'name': 'Palo Alto Networks, Inc.', 'code': 'panw.us'},
        {'name': 'Palantir Technologies Inc.', 'code': 'pltr.us'},
        {'name': 'MicroStrategy Incorporated', 'code': 'mstr.us'},
        {'name': 'Axon Enterprise, Inc.', 'code': 'axon.us'},
        {'name': 'PayPal Holdings, Inc.', 'code': 'pypl.us'},
        {'name': 'Autodesk, Inc.', 'code': 'adsk.us'},
        {'name': 'American Electric Power Company, Inc.', 'code': 'aep.us'},
        {'name': 'ANSYS, Inc.', 'code': 'anss.us'},
        {'name': 'AstraZeneca PLC', 'code': 'azn.us'},
        {'name': 'Baker Hughes Company', 'code': 'bkr.us'},
        {'name': 'Cadence Design Systems, Inc.', 'code': 'cdns.us'},
        {'name': 'Constellation Energy Corporation', 'code': 'ceg.us'},
        {'name': 'Charter Communications, Inc.', 'code': 'chtr.us'},
        {'name': 'Corpay, Inc.', 'code': 'cpay.us'},
        {'name': 'Copart, Inc.', 'code': 'cprt.us'},
        {'name': 'CrowdStrike Holdings, Inc.', 'code': 'crwd.us'},
        {'name': 'Cintas Corporation', 'code': 'ctas.us'},
        {'name': 'Cognizant Technology Solutions Corp.', 'code': 'ctsh.us'},
        {'name': 'DoorDash, Inc.', 'code': 'dash.us'},
        {'name': 'Datadog, Inc.', 'code': 'ddog.us'},
        {'name': 'Dollar Tree, Inc.', 'code': 'dltr.us'},
        {'name': 'Dexcom, Inc.', 'code': 'dxcm.us'},
        {'name': 'Electronic Arts Inc.', 'code': 'ea.us'},
        {'name': 'eBay Inc.', 'code': 'ebay.us'},
        {'name': 'Exelon Corporation', 'code': 'exc.us'},
        {'name': 'Fastenal Company', 'code': 'fast.us'},
        {'name': 'Fortinet, Inc.', 'code': 'ftnt.us'},
        {'name': 'IDEXX Laboratories, Inc.', 'code': 'idxx.us'},
        {'name': 'Intuit Inc.', 'code': 'intu.us'},
        {'name': 'Keurig Dr Pepper Inc.', 'code': 'kdp.us'},
        {'name': 'Lululemon Athletica Inc.', 'code': 'lulu.us'},
        {'name': 'Marriott International, Inc.', 'code': 'mar.us'},
        {'name': 'Microchip Technology Inc.', 'code': 'mchp.us'},
        {'name': 'MongoDB, Inc.', 'code': 'mdb.us'},
        {'name': 'Monster Beverage Corporation', 'code': 'mnst.us'},
        {'name': 'NXP Semiconductors N.V.', 'code': 'nxpi.us'},
        {'name': 'Old Dominion Freight Line, Inc.', 'code': 'odfl.us'},
        {'name': 'ON Semiconductor Corporation', 'code': 'on.us'},
        {'name': 'O\'Reilly Automotive, Inc.', 'code': 'orly.us'},
        {'name': 'Paychex, Inc.', 'code': 'payx.us'},
        {'name': 'PACCAR Inc.', 'code': 'pcar.us'},
        {'name': 'PDD Holdings Inc.', 'code': 'pdd.us'},
        {'name': 'Roper Technologies, Inc.', 'code': 'rop.us'},
        {'name': 'Ross Stores, Inc.', 'code': 'rost.us'},
        {'name': 'Synopsys, Inc.', 'code': 'snps.us'},
        {'name': 'Atlassian Corporation', 'code': 'team.us'},
        {'name': 'Verisk Analytics, Inc.', 'code': 'vrsk.us'},
        {'name': 'Walgreens Boots Alliance, Inc.', 'code': 'wba.us'},
        {'name': 'Warner Bros. Discovery, Inc.', 'code': 'wbd.us'},
        {'name': 'Workday, Inc.', 'code': 'wday.us'},
        {'name': 'Willis Towers Watson Public Limited Co.', 'code': 'wltw.us'},
        {'name': 'Walmart Inc.', 'code': 'wmt.us'},
        {'name': 'Xcel Energy Inc.', 'code': 'xel.us'},
        {'name': 'Zscaler, Inc.', 'code': 'zs.us'},
    ]

    all_stock_data = []
    today = datetime.date.today()
    three_years_ago = today - datetime.timedelta(days=3*365)

    for stock_info in stock_codes:
        code = stock_info['code']
        name = stock_info['name']

        print(f"Fetching data for {name} ({code})...")
        try:
            # Stooq CSV download URL
            url = f"https://stooq.com/q/d/l/?s={code}&i=d"
            response = requests.get(url)
            response.raise_for_status()

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
                print(f"No recent data found for {name} ({code})")
                continue

            stock_data.sort(key=lambda x: x['Date'])

            all_stock_data.append({
                'name': name,
                'code': code.upper().replace('.US', ''),
                'historicalData': stock_data
            })
            time.sleep(1) # Be polite to Stooq
        except Exception as e:
            print(f"Error fetching data for {name} ({code}): {e}")

    # Save to stock.json
    with open('stock.json', 'w', encoding='utf-8') as f:
        json.dump(all_stock_data, f, ensure_ascii=False, indent=4)
    print(f"stock.json generated successfully with data for {len(all_stock_data)} stocks.")

if __name__ == '__main__':
    generate_stock_data()
