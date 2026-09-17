import pandas as pd
df = pd.read_csv('data/demo/samsung_galaxy_s25_ultra_12gb_256gb.csv')
print("Records:", len(df))
print("Min Price:", df['price'].min())
print("Max Price:", df['price'].max())
print("Start Date:", df['date'].min())
print("End Date:", df['date'].max())
print("Unique Dates:", df['date'].str.slice(0, 10).nunique())
print("Product Identity:", df['product'].unique()[0])
