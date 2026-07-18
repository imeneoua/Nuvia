import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
// components
import Hero from "./components/Hero/Hero";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Planner from "./components/planner/Planner";
import Recipes from "./components/recipes/Recipes";
// pages
import Auth from "./pages/Auth/AuthModal";
import Profile from "./pages/Profile/Profile";
import Explore from "./pages/Explore/Explore";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import "./App.css";

function App() {
  return (
    <GoogleOAuthProvider clientId="915899022511-pihrk13ddptloflcadn0idv1bd1jdo55.apps.googleusercontent.com">
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* HOME */}
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Recipes />
                <Footer />
              </>
            }
          />
          {/* AUTH */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          {/* OTHERS */}
          <Route path="/planner" element={<Planner />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
