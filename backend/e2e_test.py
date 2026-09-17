import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

print("Starting E2E API Verification...")

# 1. Test Search API
print("\n--- Testing /search ---")
try:
    res = requests.get(f"{BASE_URL}/search?q=samsung+galaxy+s25+ultra+5g")
    print(f"Status: {res.status_code}")
    data = res.json()
    if 'products' in data and len(data['products']) > 0:
        print(f"PASS: Search returned {len(data['products'])} products.")
        print(f"Lowest Price Extracted: {data.get('lowestPrice', {}).get('extractedPrice')}")
    else:
        print("FAIL: No products returned")
except Exception as e:
    print(f"FAIL: {e}")

# 2. Test Analyze API (Demo Data Trigger)
print("\n--- Testing /analyze (Demo Data) ---")
try:
    res = requests.get(f"{BASE_URL}/analyze?productKey=samsung-galaxy-s25-ultra-5g-12gb-256gb")
    print(f"Status: {res.status_code}")
    data = res.json()
    if 'history' in data and len(data['history']) > 0:
        print(f"PASS: Analyze returned {len(data['history'])} historical points.")
        print(f"Source: {data.get('source')}")
        print(f"Forecast 7-day: {data.get('mlAnalysis', {}).get('predicted_price_7d')}")
        print(f"Trend: {data.get('mlAnalysis', {}).get('trend')}")
        print(f"Confidence: {data.get('mlAnalysis', {}).get('confidence')}")
    else:
        print("FAIL: No history returned")
except Exception as e:
    print(f"FAIL: {e}")

# 3. Test Analyze API (Variant Safety)
print("\n--- Testing /analyze (Variant Protection) ---")
try:
    res = requests.get(f"{BASE_URL}/analyze?productKey=samsung-galaxy-s25-ultra-5g-12gb-512gb")
    print(f"Status: {res.status_code}")
    data = res.json()
    # Expect either MongoDB or insufficient history, but NOT demo data.
    if data.get('source') == 'DEMO':
        print("FAIL: 512GB variant incorrectly used DEMO data.")
    else:
        print(f"PASS: Variant protected. Source used: {data.get('source', 'None')}")
except Exception as e:
    print(f"FAIL: {e}")

# 4. Test Track Product Flow
print("\n--- Testing /track/check ---")
try:
    payload = {
        "productKey": "samsung-galaxy-s25-ultra-5g",
        "targetPrice": 90000
    }
    res = requests.post(f"{BASE_URL}/track/check", json=payload)
    print(f"Status: {res.status_code}")
    data = res.json()
    if 'currentPrice' in data:
        print(f"PASS: Track check returned current price: {data['currentPrice']}")
    else:
        print("FAIL: Track check did not return currentPrice")
except Exception as e:
    print(f"FAIL: {e}")

print("\nVerification Complete.")
