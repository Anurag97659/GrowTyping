import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./components/login";
import Registration from "./components/registration";
import TypingPage from "./components/typing";
import Dashboard from "./components/dashboard";
import Settings from "./components/settings";
import ChangeDetails from "./components/change-details";
import ChangePassword from "./components/change-password";
import VerifyEmail from "./components/verify-email";
import Friends from "./components/friends";
import Leaderboard from "./components/leaderboard";
import OAuthCallback from "./components/oauth-callback";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<TypingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/typing" element={<TypingPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/edit-profile" element={<ChangeDetails />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
