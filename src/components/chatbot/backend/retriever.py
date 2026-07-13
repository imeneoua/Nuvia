import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

recipes = pd.read_csv("data/recipes_clean.csv")

print("Recipes loaded:", len(recipes))
recipes["search_text"] = (
    recipes["title"].fillna("") + " " +
    recipes["ingredients"].fillna("") + " " +
    recipes["instructions"].fillna("")
)

vectorizer = TfidfVectorizer(stop_words="english")

recipe_vectors = vectorizer.fit_transform(
    recipes["search_text"]
)

def search_recipes(query, top_k=3):

    query_vector = vectorizer.transform([query])

    similarities = cosine_similarity(
        query_vector,
        recipe_vectors
    )

    best = similarities.argsort()[0][-top_k:][::-1]

    return recipes.iloc[best]

