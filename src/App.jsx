import React, { useState } from "react";
import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";

// Components & Pages
import Sidebar from "./components/Sidebar";
import CreateOrder from './pages/CreateOrder';
import OrderListPage from './pages/DisplayOrdersList';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import { DEMO_USER } from "./demoUser";

// Make sure the demo account exists so visitors can log in right away.
const seedDemoUser = () => {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (!users.some((u) => u.email === DEMO_USER.email)) {
    localStorage.setItem("users", JSON.stringify([...users, DEMO_USER]));
  }
};

function App() {
  const [user, setUser] = useState(() => {
    seedDemoUser();
    return JSON.parse(localStorage.getItem("loggedInUser"));
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("loggedInUser");
  };

  // Save profile changes to both the session and the stored user list.
  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("loggedInUser", JSON.stringify(updated));
    const users = JSON.parse(localStorage.getItem("users")) || [];
    localStorage.setItem(
      "users",
      JSON.stringify(users.map((u) => (u.email === user.email ? updated : u)))
    );
  };

  return (
    <Router>
      {user ? (
        <Sidebar user={user} onLogout={handleLogout} updateUser={updateUser}>
          <Routes>
            <Route path="/home" element={<Home user={user} />} />
            <Route path="/create" element={<CreateOrder />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Sidebar>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
