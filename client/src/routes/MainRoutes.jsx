import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Signup from "../components/signup/Signup";
import Login from "../components/login/Login";
import { useAuthContext } from "../context/AuthContext";

const MainRoutes = () => {
  const { authUser } = useAuthContext();
  return (
    <Routes>
      <Route
        path="/"
        element={authUser ? <Home /> : <Navigate to={"/login"} />}
      />
      <Route
        path="/login"
        element={authUser ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/signup"
        element={authUser ? <Navigate to="/" /> : <Signup />}
      />
      <Route path="*" element={<h2>404 : Page not found</h2>} />
    </Routes>
  );
};

export default MainRoutes;
