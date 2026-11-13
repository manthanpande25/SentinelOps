
import { useEffect, useState } from "react";
import { connectSocket } from "../services/socket";

const useLiveLogs = (token) => {
  const [socket, setSocket] = useState(null);
  const [liveLogs, setLiveLogs] = useState([]);

  useEffect(() => {
    if (!token) return;

    const socketConnection = connectSocket(token);

    setSocket(socketConnection);

    socketConnection.on("log:created", (log) => {
      console.log("New live log received:", log);

      setLiveLogs((previousLogs) => [
        log,
        ...previousLogs,
      ]);
    });

    return () => {
      socketConnection.disconnect();
      setSocket(null);
    };
  }, [token]);

  return { socket, liveLogs };
};

export default useLiveLogs;
