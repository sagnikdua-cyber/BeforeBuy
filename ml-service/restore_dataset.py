import pandas as pd
file_path = 'data/demo/samsung_galaxy_s25_ultra_12gb_256gb.csv'
df = pd.read_csv(file_path)
df.at[len(df)-1, 'price'] = 85000.0
df.to_csv(file_path, index=False)
print("Restored dataset!")
