from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uvicorn
import os
import sqlite3
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
app = FastAPI()

# Enable CORS so the React app can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    otp: str = None  # Make OTP optional for backwards compatibility, but required for the new flow

class OTPRequest(BaseModel):
    email: str

class GoogleAuthRequest(BaseModel):
    token: str

class LoginRequest(BaseModel):
    email: str
    password: str

# TODO: Replace with your real Gmail credentials
SMTP_EMAIL = "courseteam6@gmail.com"
SMTP_PASSWORD = "ypatiiyzpjvpotfo"

# In-memory storage for OTPs (For production, use Redis or a DB table)
otp_storage = {}

def send_email(to_email: str, subject: str, body: str):
    if SMTP_EMAIL == "votre.email@gmail.com":
        print(f"Simulation email à {to_email} : {subject}\n{body}")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email envoyé avec succès à {to_email}")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email : {e}")

@app.post("/api/auth/send-otp")
def send_otp(req: OTPRequest, background_tasks: BackgroundTasks):
    # Generate a 6-digit OTP
    otp_code = str(random.randint(100000, 999999))
    otp_storage[req.email] = otp_code
    
    subject = "Votre code de vérification Nuvia"
    body = f"Bonjour,\n\nVotre code de vérification (OTP) pour Nuvia est : {otp_code}\n\nCe code expirera bientôt. Ne le partagez avec personne.\n\nL'équipe Nuvia"
    
    # Send email in background
    background_tasks.add_task(send_email, req.email, subject, body)
    return {"message": "OTP envoyé avec succès"}

@app.post("/api/auth/register")
def register(req: RegisterRequest, background_tasks: BackgroundTasks):
    if req.otp is not None:
        if req.email not in otp_storage or otp_storage[req.email] != req.otp:
            raise HTTPException(status_code=400, detail="Code OTP invalide ou expiré.")
        
    try:
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (req.name, req.email, req.password))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        
        # Clean up OTP storage
        if req.email in otp_storage:
            del otp_storage[req.email]
        
        # Send welcome email
        subject = "Bienvenue sur Nuvia !"
        body = f"Bonjour {req.name},\n\nBienvenue sur Nuvia, votre assistant culinaire intelligent ! Votre compte a été créé avec succès.\n\nBon appétit !\nL'équipe Nuvia"
        background_tasks.add_task(send_email, req.email, subject, body)
        
        return {
            "token": f"fake-jwt-token-{user_id}",
            "user": {"id": user_id, "name": req.name, "email": req.email}
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="L'email existe déjà.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT id, name, email FROM users WHERE email=? AND password=?", (req.email, req.password))
    user = c.fetchone()
    conn.close()
    
    if user:
        return {
            "token": f"fake-jwt-token-{user[0]}",
            "user": {"id": user[0], "name": user[1], "email": user[2]}
        }
    else:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")

@app.post("/api/auth/google")
def google_login(req: GoogleAuthRequest):
    CLIENT_ID = "915899022511-pihrk13ddptloflcadn0idv1bd1jdo55.apps.googleusercontent.com"
    try:
        # Verify the Google JWT token
        idinfo = id_token.verify_oauth2_token(req.token, requests.Request(), CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute("SELECT id, name, email FROM users WHERE email=?", (email,))
        user = c.fetchone()
        
        if not user:
            # Create user if it doesn't exist
            c.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, "google-oauth"))
            conn.commit()
            user_id = c.lastrowid
            user = (user_id, name, email)
            
        conn.close()
        return {
            "token": f"fake-jwt-token-{user[0]}",
            "user": {"id": user[0], "name": user[1], "email": user[2]}
        }
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=400, detail="Token Google invalide.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/users", response_class=HTMLResponse)
def view_users():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute("SELECT id, name, email FROM users")
    users = c.fetchall()
    conn.close()
    
    html_content = """
    <html>
        <head>
            <title>Admin - Utilisateurs</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { border-collapse: collapse; width: 100%; max-width: 600px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <h1>Base de données des utilisateurs (SQLite)</h1>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Email</th>
                </tr>
    """
    
    for u in users:
        html_content += f"<tr><td>{u[0]}</td><td>{u[1]}</td><td>{u[2]}</td></tr>"
        
    html_content += """
            </table>
        </body>
    </html>
    """
    return html_content

# Go up one directory to find the CSV
csv_path = os.path.join(os.path.dirname(__file__), '..', '1M_Final_Cleaned_V3.csv')

print("Loading dataset into memory... This might take a minute.")
df = pd.read_csv(csv_path, usecols=['title', 'ingredients', 'instructions', 'NER'])
df = df.dropna(subset=['title'])
print(f"Dataset loaded. Total recipes: {len(df)}")

@app.get("/search")
def search_recipe(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
        
    query = q.lower().strip()
    words = query.split()
    
    mask = pd.Series(True, index=df.index)
    
    # Filter rows that contain the keywords in the title or NER (ingredients)
    for word in words:
        # We ignore very short words like 'de', 'le', 'la', 'a' to improve search accuracy
        if len(word) <= 2:
            continue
            
        word_mask = (
            df['title'].str.lower().str.contains(word, na=False) | 
            df['NER'].str.lower().str.contains(word, na=False)
        )
        mask = mask & word_mask
        
    results = df[mask]
    
    if len(results) == 0:
        return {"found": False, "recipe": None}
        
    # Sort by title length so an exact match like "Tiramisu" comes before "Chocolate Tiramisu Cake"
    results = results.assign(title_len=results['title'].str.len())
    best_match = results.sort_values('title_len').iloc[0]
    
    # Format the response nicely
    recipe_text = f"**{best_match['title']}**\n\n**Ingrédients:**\n{best_match['ingredients']}\n\n**Préparation:**\n{best_match['instructions']}"
    
    return {
        "found": True,
        "recipe_text": recipe_text
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
