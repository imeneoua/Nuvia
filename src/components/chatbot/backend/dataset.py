import pandas as pd

files = [
    "data/Food.csv",
    "data/Smoothie.csv",
    "data/final.csv",
    "data/recipes_data.csv",
    "data/Dessert.csv"
]

for file in files:

    print("\n" + "="*60)
    print(file)

    if "Dessert" in file:
        df = pd.read_csv(file, sep=";", encoding="latin1")
    else:
        df = pd.read_csv(file)

    print(df.columns.tolist())
    print(df.head(2))