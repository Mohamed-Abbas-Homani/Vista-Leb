import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AboutUs from "./pages/AboutUs";
import ProfilePage from "./pages/ProfilePage";
import ContactUs from "./pages/ContactUs";
import BusinessDetail from "./pages/businesses";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  {path: "/about-us", element: <AboutUs />},
  { path: "/profile/:id", element: <ProfilePage /> },
  {path: "/contact-us", element: <ContactUs />},
  { path: "/business/:id", element: <BusinessDetail /> }, // Add this route

]);

export default router;
