import pandas as pd

# Read CSV file
df = pd.read_csv("recipes_data.csv")

# Display the first 5 rows
print(df.head())

# Display basic information
print(df.info())

# Display column names
print(df.columns)