import pandas as pd
import ast
import time
import os

input_file = "1M_Final.csv"
output_file = "1M_Final_Cleaned_V3.csv"
chunksize = 50000

print(f"Starting to clean {input_file}...")
start_time = time.time()

def clean_list_str(col):
    # Fast vectorized string replacement
    return col.astype(str) \
              .str.replace(r"^\[|\]$", "", regex=True) \
              .str.replace(r"', '", ", ", regex=False) \
              .str.replace(r"\", \"", ", ", regex=False) \
              .str.replace("'", "", regex=False) \
              .str.replace('"', "", regex=False)

seen_ids = set()
total_original_rows = 0
total_cleaned_rows = 0

# Remove existing output file if it exists
if os.path.exists(output_file):
    os.remove(output_file)

with open(output_file, 'w', encoding='utf-8', newline='') as f:
    for i, chunk in enumerate(pd.read_csv(input_file, chunksize=chunksize, low_memory=False)):
        total_original_rows += len(chunk)
        
        # 1. Filter to keep only the necessary columns (plus 'id' for deduplication)
        columns_to_keep = ['id', 'title', 'primary_classification', 'secondary_classification', 'ingredients', 'NER', 'instructions']
        chunk = chunk[[col for col in columns_to_keep if col in chunk.columns]]
            
        # 2. Drop rows with critical missing values
        chunk = chunk.dropna(subset=['id', 'title', 'ingredients'])
        
        # 3. Deduplicate based on 'id' across all chunks
        chunk = chunk[~chunk['id'].isin(seen_ids)]
        seen_ids.update(chunk['id'].tolist())
        
        # Also drop duplicate titles within the chunk (basic title deduplication)
        chunk = chunk.drop_duplicates(subset=['title'])
        
        # 4. Clean list-like strings
        for col in ['secondary_classification', 'ingredients', 'NER', 'instructions']:
            if col in chunk.columns:
                # Only apply to non-null values to avoid turning NaN into "nan" string
                mask = chunk[col].notna()
                chunk.loc[mask, col] = clean_list_str(chunk.loc[mask, col])
                
        # 5. Format Text (strip whitespaces)
        for col in ['title', 'meal_type']:
            if col in chunk.columns:
                mask = chunk[col].notna()
                chunk.loc[mask, col] = chunk.loc[mask, col].astype(str).str.strip()
                
        total_cleaned_rows += len(chunk)
        
        # Drop 'id' column before saving since you don't need it in the final dataset
        if 'id' in chunk.columns:
            chunk = chunk.drop(columns=['id'])
            
        # Append to output CSV
            header = True if i == 0 else False
            chunk.to_csv(f, header=header, index=False)
            
            print(f"Processed chunk {i+1} ({(i+1)*chunksize} rows)...")

end_time = time.time()
print("\n--- Cleaning Complete ---")
print(f"Time taken: {end_time - start_time:.2f} seconds")
print(f"Original Rows: {total_original_rows:,}")
print(f"Cleaned Rows: {total_cleaned_rows:,}")
print(f"Rows Removed: {total_original_rows - total_cleaned_rows:,}")
print(f"Output saved to {output_file}")
