import csv
import datetime
import os
import math
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DEMO_PATH = 'data/demo/samsung_galaxy_s25_ultra_12gb_256gb.csv'
demo_data = []

try:
    if os.path.exists(DEMO_PATH):
        with open(DEMO_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                demo_data.append(row)
    else:
        print(f"Warning: Demo data not found at {DEMO_PATH}")
except Exception as e:
    print(f"Error loading demo data: {e}")

def parse_date(date_str):
    if 'T' in date_str:
        return datetime.datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
    else:
        return datetime.datetime.strptime(date_str.split(' ')[0], '%Y-%m-%d').date()

def extract_features(raw_data):
    features = []
    for row in raw_data:
        try:
            d_str = row.get('timestamp') or row.get('date')
            dt = parse_date(d_str)
            price_val = row.get('extractedPrice') if 'extractedPrice' in row else row.get('price')
            price = float(price_val)
            features.append({'date': dt, 'price': price, 'day_index': dt.toordinal()})
        except Exception:
            continue
    features.sort(key=lambda x: x['date'])
    return features

def linear_regression(x, y):
    n = len(x)
    if n == 0:
        return 0, 0
    sum_x = sum(x)
    sum_y = sum(y)
    sum_x2 = sum(xi*xi for xi in x)
    sum_xy = sum(x[i]*y[i] for i in range(n))
    
    denominator = (n * sum_x2 - sum_x * sum_x)
    if denominator == 0:
        return 0, sum_y / n
    
    m = (n * sum_xy - sum_x * sum_y) / denominator
    b = (sum_y - m * sum_x) / n
    return m, b

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    is_demo = data.get('useDemo', False)
    
    raw_historical = []
    if is_demo and demo_data:
        raw_historical = demo_data
    elif 'observations' in data and len(data['observations']) >= 14:
        raw_historical = data['observations']
    else:
        return jsonify({'error': 'Insufficient data for prediction. Minimum 14 observations required.'}), 400
        
    features = extract_features(raw_historical)
    if len(features) < 14:
        return jsonify({'error': 'Insufficient clean data for prediction.'}), 400
        
    # Time-Aware Validation (80/20 split)
    split_idx = int(len(features) * 0.8)
    train_features = features[:split_idx]
    val_features = features[split_idx:]
    
    x_train = [f['day_index'] for f in train_features]
    y_train = [f['price'] for f in train_features]
    
    m, b = linear_regression(x_train, y_train)
    
    # Calculate confidence based on MAPE on validation set
    mape_sum = 0
    for f in val_features:
        pred_y = m * f['day_index'] + b
        mape_sum += abs((f['price'] - pred_y) / f['price'])
    mape = mape_sum / len(val_features)
    confidence = round(max(0.01, min(0.99, 1.0 - mape)), 2)
    
    # Retrain on full data
    x_all = [f['day_index'] for f in features]
    y_all = [f['price'] for f in features]
    m_final, b_final = linear_regression(x_all, y_all)
    
    # Predict 7 days out
    last_date = features[-1]['date']
    future_date = last_date + datetime.timedelta(days=7)
    future_day_index = future_date.toordinal()
    
    predicted_price = m_final * future_day_index + b_final
    current_price = features[-1]['price']
    
    # Trend Analysis
    trend = "stable"
    threshold = current_price * 0.02
    
    if predicted_price < (current_price - threshold):
        trend = "decreasing"
    elif predicted_price > (current_price + threshold):
        trend = "increasing"
        
    chart_data = []
    for f in features:
        chart_data.append({
            'date': f['date'].strftime('%Y-%m-%d'),
            'price': f['price']
        })
        
    hist_min = min(y_all)
    hist_max = max(y_all)
    
    return jsonify({
        'predicted_price_7d': round(predicted_price, 2),
        'trend': trend,
        'confidence': confidence,
        'historical_min': round(hist_min, 2),
        'historical_max': round(hist_max, 2),
        'data_points': len(features),
        'chart_data': chart_data
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'BeforeBuy ML Service (Pure Python OLS)'})

if __name__ == '__main__':
    app.run(port=5001, debug=True)
