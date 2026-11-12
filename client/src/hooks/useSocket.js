
import { useEffect, useState } from "react";
import { connectSocket } from "../services/socket";

const useSocket = (token) => {
  const [socket, setSocket] = useState(null);
  const [latestIncident, setLatestIncident] = useState(null);

  useEffect(() => {
    if (!token) return;

    const socketConnection = connectSocket(token);

    setSocket(socketConnection);

    socketConnection.on("incident:updated", (incident) => {
      console.log("Real-time incident received:", incident);
      setLatestIncident(incident);
    });

    return () => {
      socketConnection.disconnect();
      setSocket(null);
    };
  }, [token]);

  return { socket, latestIncident };
};

export default useSocket;
