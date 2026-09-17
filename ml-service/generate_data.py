import pandas as pd
import numpy as np
import datetime
import os

# Ensure data directory exists
os.makedirs('data/demo', exist_ok=True)

# Generate synthetic dataset for Samsung Galaxy S25 Ultra
# Starting point roughly 120,000 INR dropping over 180 days

np.random.seed(42)
days = 180
start_date = datetime.datetime.now() - datetime.timedelta(days=days)

dates = [start_date + datetime.timedelta(days=i) for i in range(days)]
base_price = 129999.0

prices = []
for i in range(days):
    # Simulated price drop over time (exponential decay + some random noise)
    decay = np.exp(-i / 100.0)
    noise = np.random.normal(0, 1500) # Noise of 1500 INR
    
    # Occasional random sales drops
    sale_drop = 0
    if np.random.random() < 0.05:
        sale_drop = np.random.uniform(3000, 8000)
        
    price = (base_price * decay) + noise - sale_drop
    
    # Floor price
    price = max(price, 85000.0)
    prices.append(round(price, 2))

df = pd.DataFrame({
    'date': dates,
    'price': prices,
    'merchant': 'DemoSource',
    'product': 'Samsung Galaxy S25 Ultra 5G (12GB/256GB)'
})

output_path = 'data/demo/samsung_galaxy_s25_ultra_12gb_256gb.csv'
df.to_csv(output_path, index=False)
print(f"Synthetic demo dataset generated at {output_path}")
