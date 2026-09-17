import pandas as pd
import numpy as np
df = pd.read_csv('data/demo/samsung_galaxy_s25_ultra_12gb_256gb.csv')
df['date'] = pd.to_datetime(df['date'])
df.sort_values('date', inplace=True)
print(f"Record Count: {len(df)}")
print(f"Date Range: {df['date'].min()} to {df['date'].max()}")
print(f"Min Price: {df['price'].min()}")
print(f"Max Price: {df['price'].max()}")
print(f"Mean Price: {df['price'].mean():.2f}")
print(f"Median Price: {df['price'].median()}")
print(f"Std Dev: {df['price'].std():.2f}")
print(f"First Price: {df['price'].iloc[0]}")
print(f"Latest Price: {df['price'].iloc[-1]}")
print(f"Price Change: {df['price'].iloc[-1] - df['price'].iloc[0]}")
print(f"Unique Dates: {df['date'].nunique()}")
print(f"Duplicates: {df.duplicated().sum()}")
print(f"Missing Values: {df.isnull().sum().sum()}")
print(f"Invalid Prices: {(df['price'] <= 0).sum()}")

print(f"Recent 7-day Avg: {df['price'].tail(7).mean():.2f}")
print(f"Recent 14-day Avg: {df['price'].tail(14).mean():.2f}")
print(f"Recent 30-day Avg: {df['price'].tail(30).mean():.2f}")
print(f"Overall Avg: {df['price'].mean():.2f}")

# Slope calculations
import scipy.stats as stats
recent_30 = df.tail(30)
slope_30, _, _, _, _ = stats.linregress(range(30), recent_30['price'])
slope_overall, _, _, _, _ = stats.linregress(range(len(df)), df['price'])
print(f"Recent 30-day trend slope: {slope_30:.2f}")
print(f"Overall trend slope: {slope_overall:.2f}")
