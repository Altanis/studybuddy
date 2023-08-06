import React from "react";
import { Route, Routes } from 'react-router-dom';
import "./index.css";

import RadialBackground from "./components/RadialBackground";
import { AuthContextProvider } from "./context/AuthContext";

import Home from "./pages/Home";

import Profile from "./pages/Profile";
import Search from "./pages/Search";

import GameCreate from "./pages/GameCreate";
import Game from "./pages/Game"

import NotFound from "./pages/NotFound";

import { CookieContextProvider } from "./context/CookieContext";

export default function App() {
    return (
        <CookieContextProvider>
            <AuthContextProvider>
                <RadialBackground>
                    <Routes>
                        <Route path="/" element={<Home />} />

                        <Route path="/profile/:id" element={<Profile />} />
                        <Route path="/search/:query" element={<Search />} />

                        <Route path="/game/create" element={<GameCreate />} />
                        <Route path="/game/:id" element={<Game />} />
                        
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </RadialBackground>
            </AuthContextProvider>
        </CookieContextProvider>
    )
};