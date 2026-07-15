import pandas as pd

file_path = "c:/Users/Amatek/Desktop/Hackathon imene/1M_Final.csv"
print("Reading dataset...")
# Read the dataset. Since it's large, we might just read headers and memory info, and nulls
df = pd.read_csv(file_path, low_memory=False)

print("\n--- Dataset Info ---")
df.info()

print("\n--- Missing Values ---")
print(df.isnull().sum())

print("\n--- Duplicates ---")
print("Duplicate rows:", df.duplicated().sum())

print("\n--- Sample (First 2 Rows) ---")
print(df.head(2).to_dict('records'))
