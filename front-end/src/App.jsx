// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import UserPage from "./pages/You";
import UploadVideo from "./pages/UploadVideo";
import UpdateAccountSettings from "./pages/UpdateAccountSettings";
import Tser from "./pages/Tser";
import User from "./pages/User";
import MyVideos from "./pages/MyVideos";
import VideoPlayer from "./pages/VideoPlayer";
import PlaylistVideo from "./pages/PlaylistVideo";
import Subscriptions from "./pages/Subscriptions";


function App() {
  return (
    <>
    <Router>
      <Navbar />
      <div className="container mx-auto mt-8">
        <Routes>
        <Route path="/" element={<Home />}/>
          <Route path="videos/:id" element={<VideoPlayer />} />
          <Route path="/you" element={<UserPage />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/MyVideos" element={<MyVideos />} />
          <Route path="/UploadVideo" element={<UploadVideo />} />
          <Route path="/UpdateAccount" element={<UpdateAccountSettings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/user/:username" element={<Tser />} />
          <Route path="/playlist/:playlistId" element={<PlaylistVideo />} />

        </Routes>
      </div>
    </Router>

</>
  );
}

export default App;
