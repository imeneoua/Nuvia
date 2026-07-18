import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import "./AuthModal.css";

const API = "http://localhost:8000/api/auth";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === "/register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (loading) return;

    if (!email || !password || (isRegister && !name)) {
      alert("Please fill all fields");
      return;
    }

    if (isRegister) {
      if (!otpSent) {
        // Step 1: Send OTP
        try {
          setLoading(true);
          const res = await fetch(`${API}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json().catch(() => null);
          if (!res.ok) throw new Error(data?.detail || "Failed to send OTP.");
          setOtpSent(true);
          alert("Un code OTP a été envoyé à votre adresse email !");
        } catch (err) {
          alert(err.message);
        } finally {
          setLoading(false);
        }
        return;
      } else {
        // Step 2: Verify OTP before registering
        if (!otp) {
          alert("Veuillez entrer le code OTP.");
          return;
        }
      }
    }

    const url = isRegister ? `${API}/register` : `${API}/login`;
    const body = isRegister
      ? { name, email, password, otp }
      : { email, password };

    try {
      setLoading(true);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || data?.message || "Authentication failed.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/profile");
    } catch (err) {
      const message =
        err.message === "Failed to fetch"
          ? "Unable to reach the auth server. Make sure your backend is running on http://localhost:8000."
          : err.message;
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || "Google Auth failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/profile");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Échec de la connexion avec Google.");
  };

  return (
    <main className="auth-page">
      <div className="auth-page-glow auth-page-glow-1" aria-hidden="true"></div>
      <div className="auth-page-glow auth-page-glow-2" aria-hidden="true"></div>
      <div className="auth-page-grain" aria-hidden="true"></div>

      <section className="auth-card">
        <div className="auth-card-topline" aria-hidden="true">
          <span className="topline-segment"></span>
          <span className="topline-dot"></span>
          <span className="topline-segment"></span>
        </div>

        <span className="auth-eyebrow">
          {isRegister ? "CREATE YOUR KITCHEN" : "WELCOME BACK"}
        </span>

        <h1>{isRegister ? "Join Nuvia" : "Login"}</h1>

        <p className="auth-sub">
          {isRegister
            ? "Create your personal cooking space and bring your weekly rituals to life."
            : "Return to your kitchen space and continue planning with intention."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="auth-field">
              <span className="auth-label">Full Name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={otpSent}
            />
          </label>

          {isRegister && otpSent && (
            <label className="auth-field">
              <span className="auth-label">Code OTP (reçu par email)</span>
              <input
                type="text"
                placeholder="Entrez les 6 chiffres"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </label>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
              ? otpSent
                ? "Verify & Create Account"
                : "Send OTP Code"
              : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() => navigate(isRegister ? "/login" : "/register")}
        >
          {isRegister
            ? "Already have an account? Login"
            : "No account yet? Register"}
        </button>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>
      </section>
    </main>
  );
}
