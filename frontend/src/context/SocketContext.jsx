import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../lib/api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [raceInvites, setRaceInvites] = useState([]); 
  const usernameRef = useRef(null);

  const getUsername = useCallback(() => {
    return window.localStorage.getItem("growtyping.username") || null;
  }, []);

  useEffect(() => {
    const username = getUsername();
    usernameRef.current = username;

    const socket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      auth: { username: username || "" },
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on("race-invite", ({ fromUsername, code }) => {
      const id = `${fromUsername}-${code}-${Date.now()}`;
      setRaceInvites((prev) => [...prev, { fromUsername, code, id }]);

      setTimeout(() => {
        setRaceInvites((prev) => prev.filter((inv) => inv.id !== id));
      }, 15000);
    });

    return () => {
      socket.disconnect();
    };
  }, []); 

  const dismissInvite = useCallback((id) => {
    setRaceInvites((prev) => prev.filter((inv) => inv.id !== id));
  }, []);

  const updateSocketUsername = useCallback((username) => {
    usernameRef.current = username;
    window.localStorage.setItem("growtyping.username", username);
    if (socketRef.current) {
      socketRef.current.auth = { username };
      socketRef.current.disconnect().connect();
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        socketRef,
        raceInvites,
        dismissInvite,
        updateSocketUsername,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
