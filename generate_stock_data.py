import requests
import datetime
import json
import csv
from io import StringIO
import time

def generate_stock_data():
    today = datetime.date.today()
    three_years_ago = today - datetime.timedelta(days=3*365 + 30) # Add buffer for 3 full years

    stock_codes = [ # Reverting to hardcoded list of 5 stocks
        {'name': 'Samsung Electronics', 'code': '005930'},
        {'name': 'SK Hynix', 'code': '000660'},
        {'name': 'LG Chem', 'code': '051910'},
        {'name': 'NAVER', 'code': '035420'},
        {'name': 'Hyundai Motor', 'code': '005380'},
    ]

    all_stock_data = []

    # No longer fetching all KOSPI stock codes from GitHub API
    # directly using the hardcoded list

    for stock_info in stock_codes:
        code = stock_info['code']
        name = stock_info['name']

        print(f"Fetching data for {name} ({code})...")
        try:
            url = f"https://raw.githubusercontent.com/gomjellie/kospi-kosdaq-csv/master/kospi/{code}.csv"
            response = requests.get(url)
            response.raise_for_status() # Raise an exception for HTTP errors

            csv_file = StringIO(response.text)
            reader = csv.DictReader(csv_file)

            stock_data = []
            for row in reader:
                # Ensure all required fields exist and are not empty
                if not all(k in row and row[k] for k in ['Date', 'Open', 'High', 'Low', 'Close', 'Volume']):
                    continue # Skip incomplete rows

                # Filter for data within the last 3 years
                row_date = datetime.datetime.strptime(row['Date'], '%Y-%m-%d').date()
                if row_date >= three_years_ago:
                    try:
                        stock_data.append({
                            'Date': row['Date'],
                            'Open': round(float(row['Open']), 2),
                            'High': round(float(row['High']), 2),
                            'Low': round(float(row['Low']), 2),
                            'Close': round(float(row['Close']), 2),
                            'Volume': int(float(row['Volume']))
                        })
                    except ValueError as ve:
                        print(f"Skipping row due to ValueError for {name} ({code}): {row} - {ve}")
                        continue
            
            # Sort by date ascending
            stock_data.sort(key=lambda x: x['Date'])

            all_stock_data.append({
                'name': name,
                'code': code,
                'historicalData': stock_data
            })
            time.sleep(0.1) # Be polite to GitHub API
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data for {name} ({code}): {e}")
        except Exception as e:
            print(f"An unexpected error occurred for {name} ({code}): {e}")

    # Save to stock.json
    with open('stock.json', 'w', encoding='utf-8') as f:
        json.dump(all_stock_data, f, ensure_ascii=False, indent=4)
    print(f"stock.json generated successfully with data for {len(all_stock_data)} stocks.")

if __name__ == '__main__':
    generate_stock_data()
