# NASDAQ 100 Stock Analysis

나스닥 100 주요 종목 및 지수 데이터 시각화 페이지입니다.

## 실행 방법

1. 데이터 생성:
   ```bash
   nix-shell --run "python3 generate_stock_data.py"
   ```

2. 웹 서버 실행:
   ```bash
   python3 -m http.server 8080
   ```

3. 브라우저에서 `http://localhost:8080` 접속
