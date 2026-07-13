import pandas as pd

# ---------- Food ----------
food = pd.read_csv("data/Food.csv")

food = food.rename(columns={
    "Title": "title",
    "Ingredients": "ingredients",
    "Instructions": "instructions"
})

food = food[["title", "ingredients", "instructions"]]
food["category"] = "Food"

# ---------- Smoothies ----------
smoothie = pd.read_csv("data/Smoothie.csv")

smoothie = smoothie.rename(columns={
    "Recipe Name": "title",
    "Ingredients": "ingredients",
    "Preperation Steps": "instructions"
})

smoothie = smoothie[["title", "ingredients", "instructions"]]
smoothie["category"] = "Smoothie"

# ---------- Drinks ----------
drinks = pd.read_csv("data/final.csv")

drinks = drinks.rename(columns={
    "Drinks": "title",
    "recipe_links": "instructions"
})

drinks["ingredients"] = ""

drinks = drinks[["title", "ingredients", "instructions"]]
drinks["category"] = "Drink"

# ---------- Desserts ----------
dessert = pd.read_csv(
    "data/Dessert.csv",
    sep=";",
    encoding="latin1",
    on_bad_lines="skip"
)

dessert = dessert.rename(columns={
    "Name": "title",
    "Ingredients": "ingredients",
    "Instructions": "instructions"
})

dessert = dessert[["title", "ingredients", "instructions"]]
dessert["category"] = "Dessert"

# ---------- Merge ----------
recipes = pd.concat(
    [food, smoothie, drinks, dessert],
    ignore_index=True
)

print(recipes.head())

recipes.to_csv(
    "data/recipes_clean.csv",
    index=False
)

print("Dataset saved successfully!")

print("Total recipes:", len(recipes))