import React, { useState } from "react";
import FormStepOne from "./components/FormStepOne";
import FormStepTwo from "./components/FormStepTwo";
import AdminDashboard from "./components/AdminDashboard";
import "./App.css";
import axios from 'axios';


function App() {
  const [step, setStep] = useState("form1");
  const [stepOneId, setStepOneId] = useState(null);
  const [adminAuth, setAdminAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [login, setLogin] = useState({ id: "", password: "" });
  const BASE_URL = process.env.REACT_APP_API_URL;


  const handleNext = (id) => {
    setStepOneId(id);
    setStep("form2");
  };

  const handleDone = () => {
    setStep("form1");
    setStepOneId(null);
  };

 const handleLogin = async () => {
  try {
    const res = await axios.post(`${BASE_URL}/login`, {
      username: login.id,
      password: login.password,
    });

    if (res.data.success) {
      setAdminAuth(true);
      setStep("admin");
      setShowLogin(false);        // ✅ Hide the popup
      setLogin({ id: "", password: "" });  // ✅ Reset the fields (optional)
    }
   else {
      alert("Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong. Please try again.");
  }
};

  return (
    <div className="App">
      <nav className="navbar">
        <h2>Manickbag Automobiles Pvt Ltd</h2>
        <div className="nav-buttons">
          <button onClick={() => setStep("form1")}>New Entry</button>
          <button onClick={() => setShowLogin(true)}>Admin Dashboard</button>
        </div>
      </nav>

      {showLogin && (
        <div className="login-popup">
          <div className="login-box">
            <h3>Admin Login</h3>
            <input
              type="text"
              placeholder="Login ID"
              value={login.id}
              onChange={(e) => setLogin({ ...login, id: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
            />
            <div className="login-actions">
              <button onClick={handleLogin}>Login</button>
              <button onClick={() => setShowLogin(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {step === "form1" && <FormStepOne onNext={handleNext} />}
      {step === "form2" && <FormStepTwo stepOneId={stepOneId} onDone={handleDone} />}
      {step === "admin" && adminAuth && <AdminDashboard />}
    </div>
  );
}

export default App;
