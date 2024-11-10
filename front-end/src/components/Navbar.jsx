// src/components/Navbar.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [userData, setUserData] = useState({});
  const dispatch = useDispatch();

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        { withCredentials: true }
      );
      //setIsLoggedIn(false);
      console.log("User logged out successfully");
      dispatch(logout());
      navigate("/")
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isLoggedIn = false;

  return (
    <nav className="bg-white shadow-md py-4 px-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Link
            to="/"
            className="text-gray-700 font-semibold hover:text-blue-500"
          >
            Home
          </Link>
          <Link
            to="/subscriptions"
            className="text-gray-700 font-semibold hover:text-blue-500"
          >
            Subscriptions
          </Link>
          <Link
            to="/you"
            className="text-gray-700 font-semibold hover:text-blue-500"
          >
            You
          </Link>
        </div>

        <div className="flex space-x-4">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
