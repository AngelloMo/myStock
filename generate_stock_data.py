import requests
import json
import datetime
import time
from io import StringIO
import csv

def generate_stock_data():
    # Organized by category
    stock_configs = [
        # NASDAQ 100
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
        {'name': 'KLA Corporation', 'code': 'kla.us', 'category': 'NASDAQ100'},
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
        {'name': 'Walgreens Boots Alliance, Inc.', 'code': 'wba.us', 'category': 'NASDAQ100'},
        {'name': 'Warner Bros. Discovery, Inc.', 'code': 'wbd.us', 'category': 'NASDAQ100'},
        {'name': 'Workday, Inc.', 'code': 'wday.us', 'category': 'NASDAQ100'},
        {'name': 'Willis Towers Watson Public Limited Co.', 'code': 'wltw.us', 'category': 'NASDAQ100'},
        {'name': 'Walmart Inc.', 'code': 'wmt.us', 'category': 'NASDAQ100'},
        {'name': 'Xcel Energy Inc.', 'code': 'xel.us', 'category': 'NASDAQ100'},
        {'name': 'Zscaler, Inc.', 'code': 'zs.us', 'category': 'NASDAQ100'},

        # S&P 500 (Adding major ones not in NDX)
        {'name': 'S&P 500 지수 (S&P 500 Index)', 'code': '^spx', 'category': 'SP500'},
        {'name': 'Berkshire Hathaway Inc.', 'code': 'brk-b.us', 'category': 'SP500'},
        {'name': 'Eli Lilly and Company', 'code': 'lly.us', 'category': 'SP500'},
        {'name': 'JPMorgan Chase & Co.', 'code': 'jpm.us', 'category': 'SP500'},
        {'name': 'Broadcom Inc.', 'code': 'avgo.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'UnitedHealth Group Inc.', 'code': 'unh.us', 'category': 'SP500'},
        {'name': 'Visa Inc.', 'code': 'v.us', 'category': 'SP500'},
        {'name': 'Exxon Mobil Corporation', 'code': 'xom.us', 'category': 'SP500'},
        {'name': 'Mastercard Incorporated', 'code': 'ma.us', 'category': 'SP500'},
        {'name': 'Johnson & Johnson', 'code': 'jnj.us', 'category': 'SP500'},
        {'name': 'Procter & Gamble Co.', 'code': 'pg.us', 'category': 'SP500'},
        {'name': 'Home Depot, Inc.', 'code': 'hd.us', 'category': 'SP500'},
        {'name': 'AbbVie Inc.', 'code': 'abbv.us', 'category': 'SP500'},
        {'name': 'Chevron Corporation', 'code': 'cvx.us', 'category': 'SP500'},
        {'name': 'Merck & Co., Inc.', 'code': 'mrk.us', 'category': 'SP500'},
        {'name': 'Bank of America Corp.', 'code': 'bac.us', 'category': 'SP500'},
        {'name': 'Coca-Cola Co.', 'code': 'ko.us', 'category': 'SP500'},
        {'name': 'Adobe Inc.', 'code': 'adbe.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'PepsiCo, Inc.', 'code': 'pep.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'Thermo Fisher Scientific Inc.', 'code': 'tmo.us', 'category': 'SP500'},
        {'name': 'McDonald\'s Corporation', 'code': 'mcd.us', 'category': 'SP500'},
        {'name': 'Accenture plc', 'code': 'acn.us', 'category': 'SP500'},
        {'name': 'Abbott Laboratories', 'code': 'abt.us', 'category': 'SP500'},
        {'name': 'Danaher Corporation', 'code': 'dhr.us', 'category': 'SP500'},
        {'name': 'Walt Disney Co.', 'code': 'dis.us', 'category': 'SP500'},
        {'name': 'Wells Fargo & Company', 'code': 'wfc.us', 'category': 'SP500'},
        {'name': 'Intel Corporation', 'code': 'intc.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'Verizon Communications Inc.', 'code': 'vz.us', 'category': 'SP500'},
        {'name': 'NextEra Energy, Inc.', 'code': 'nee.us', 'category': 'SP500'},
        {'name': 'Pfizer Inc.', 'code': 'pfe.us', 'category': 'SP500'},
        {'name': 'Morgan Stanley', 'code': 'ms.us', 'category': 'SP500'},
        {'name': 'Nike, Inc.', 'code': 'nke.us', 'category': 'SP500'},
        {'name': 'Philip Morris International Inc.', 'code': 'pm.us', 'category': 'SP500'},
        {'name': 'Honeywell International Inc.', 'code': 'hon.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'Intuit Inc.', 'code': 'intu.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'Union Pacific Corporation', 'code': 'unp.us', 'category': 'SP500'},
        {'name': 'International Business Machines Corp.', 'code': 'ibm.us', 'category': 'SP500'},
        {'name': 'Amgen Inc.', 'code': 'amgn.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'Goldman Sachs Group, Inc.', 'code': 'gs.us', 'category': 'SP500'},
        {'name': 'General Electric Company', 'code': 'ge.us', 'category': 'SP500'},
        {'name': 'Caterpillar Inc.', 'code': 'cat.us', 'category': 'SP500'},
        {'name': 'United Parcel Service, Inc.', 'code': 'ups.us', 'category': 'SP500'},
        {'name': 'Boeing Company', 'code': 'ba.us', 'category': 'SP500'},
        {'name': 'BlackRock, Inc.', 'code': 'blk.us', 'category': 'SP500'},
        {'name': 'Applied Materials, Inc.', 'code': 'amat.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'Qualcomm Inc.', 'code': 'qcom.us', 'category': 'SP500'}, # Also in NDX
        {'name': 'Raytheon Technologies Corporation', 'code': 'rtx.us', 'category': 'SP500'},
        {'name': 'American Express Company', 'code': 'axp.us', 'category': 'SP500'},
        {'name': 'Lowes Companies, Inc.', 'code': 'low.us', 'category': 'SP500'},
        {'name': 'ServiceNow, Inc.', 'code': 'now.us', 'category': 'SP500'},
    ]

    all_stock_data = []
    today = datetime.date.today()
    three_years_ago = today - datetime.timedelta(days=3*365)

    # Use a set to avoid duplicate fetching but keep track of categories
    unique_codes = {}
    for config in stock_configs:
        code = config['code']
        if code not in unique_codes:
            unique_codes[code] = config
        else:
            # If already exists, maybe append category if we wanted multi-category, 
            # but for now just one is fine.
            pass

    for code, config in unique_codes.items():
        name = config['name']
        category = config['category']

        print(f"Fetching data for {name} ({code})...")
        try:
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
                'category': category,
                'historicalData': stock_data
            })
            time.sleep(0.5)
        except Exception as e:
            print(f"Error fetching data for {name} ({code}): {e}")

    with open('stock.json', 'w', encoding='utf-8') as f:
        json.dump(all_stock_data, f, ensure_ascii=False, indent=4)
    print(f"stock.json generated successfully with data for {len(all_stock_data)} stocks.")

if __name__ == '__main__':
    generate_stock_data()
