import React, { useEffect } from "react";
import { useIssues } from "../contexts/IssueContext";
import IssueMap from "../components/IssueMap";
import { useAuth } from "../contexts/AuthContext";

const AdminMap = () => {
  const { user } = useAuth();
  const { issues, fetchIssues } = useIssues();

  useEffect(() => {
    fetchIssues();
  }, []);

  if (!user || user.role !== "admin")
    return <h2 style={{ paddingTop: 100 }}>Not Allowed</h2>;

  return (
    <div style={{ padding: "110px 20px" }}>
      <h1 className="page-title">City Map View 🗺️</h1>
      <p className="page-subtitle">View all issues live on the map</p>

      <div className="card" style={{ height: "600px" }}>
        <IssueMap issues={issues} />
      </div>
    </div>
  );
};

export default AdminMap;
