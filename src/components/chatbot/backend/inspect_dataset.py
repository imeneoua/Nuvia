import pandas as pd

datasets = {
    "Food": "data/Food.csv",
    "Smoothie": "data/Smoothie.csv",
    "Drinks": "data/final.csv",
    "Dessert": "data/Dessert.csv"
}

for name, path in datasets.items():

    if name == "Dessert": 
        df = pd.read_csv(path, sep=";", encoding="latin1", on_bad_lines="skip")
    else:
        df = pd.read_csv(path)

    print("=" * 60)
    print(name)

    print("Rows:", len(df))
    print("Columns:", len(df.columns))