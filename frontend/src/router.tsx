import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AboutUs from "./pages/AboutUs";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {path: "/about-us", element: <AboutUs />},
]);

export default router;
