import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getSocket } from "../utils/socket";

const AdminNotifications = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const socket = getSocket();

    socket.on("new-issue", (issue) => {
      addLog(`🆕 New Issue: ${issue.title}`);
    });

    socket.on("issue-updated", (issue) => {
      addLog(`🔄 Issue Updated: ${issue.title}`);
    });

    socket.on("proof-uploaded", (issue) => {
      addLog(`📸 Proof Uploaded: ${issue.title}`);
    });

    return () => {
      socket.off("new-issue");
      socket.off("issue-updated");
      socket.off("proof-uploaded");
    };
  }, [user]);

  const addLog = (msg) => {
    setLogs((prev) => [{ text: msg, time: new Date() }, ...prev]);
  };

  if (!user || user.role !== "admin")
    return <h2 style={{ paddingTop: 100 }}>Not Allowed</h2>;

  return (
    <div style={{ padding: "110px 20px" }}>
      <h1 className="page-title">Notifications 🔔</h1>

      <div className="card" style={{ maxHeight: 600, overflowY: "auto" }}>
        {!logs.length ? (
          <p>No notifications yet.</p>
        ) : (
          logs.map((l, i) => (
            <div
              key={i}
              style={{
                padding: 10,
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{l.text}</strong>
              <p style={{ fontSize: 12, color: "gray" }}>
                {l.time.toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
