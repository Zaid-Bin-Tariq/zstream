// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Check localStorage for existing user data
const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  isLoggedIn: !!user,  // If user data exists in localStorage, set loggedIn to true
  user: user ? user : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.user = action.payload;
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      // Remove user data from localStorage
      localStorage.removeItem("user");
    },
    allVideos: (state) => {
      
      state.allVideos = action.payload;
      // Remove user data from localStorage
      
    }, 
  },
});

export const { loginSuccess, logout, allVideos } = authSlice.actions;
export default authSlice.reducer;
