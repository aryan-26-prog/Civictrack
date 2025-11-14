import React, { useEffect, useState, useMemo } from "react";
import { useIssues } from "../contexts/IssueContext";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { issues, fetchIssues, loading } = useIssues();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchIssues();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div className="center-screen">
        <h2>Access Denied</h2>
        <p>You are not allowed to view this page.</p>
      </div>
    );
  }

  const filtered = useMemo(() => {
    if (activeTab === "all") return issues;
    return issues.filter((i) => i.status === activeTab);
  }, [issues, activeTab]);

  const getStatusText = (s) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ");

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "status-resolved";
      case "in-progress":
      case "under-review":
        return "status-in-progress";
      case "pending-verification":
        return "status-warning";
      default:
        return "status-pending";
    }
  };

  const updateStatus = async (id, newStatus) => {
    const res = await fetch(`http://localhost:5000/api/issues/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();
    if (data.success) fetchIssues();
  };

  const verifyProof = async (id) => {
    const res = await fetch(`http://localhost:5000/api/issues/${id}/verify`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) {
      alert("Issue Successfully Verified ✔");
      fetchIssues();
    }
  };

  const deleteIssue = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;

    const res = await fetch(`http://localhost:5000/api/issues/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (data.success) fetchIssues();
  };

  return (
    <div style={{ padding: "110px 20px", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1250px", margin: "0 auto" }}>

        {/* 🔥 HEADER */}
        <h1 className="admin-title">Admin Control Center ⚙️</h1>
        <p className="admin-subtitle">
          Manage reports, verify issues and control CivicTrack operations.
        </p>

        {/* 🔥 STATS SECTION */}
        <div className="admin-stats-grid">
          <AdminStatCard
            color="var(--primary)"
            icon="fas fa-list"
            label="Total Issues"
            value={issues.length}
          />
          <AdminStatCard
            color="var(--accent)"
            icon="fas fa-clock"
            label="Pending"
            value={issues.filter((i) => i.status === "pending").length}
          />
          <AdminStatCard
            color="var(--warning)"
            icon="fas fa-check-double"
            label="Pending Verification"
            value={issues.filter((i) => i.status === "pending-verification").length}
          />
          <AdminStatCard
            color="var(--success)"
            icon="fas fa-check-circle"
            label="Resolved"
            value={issues.filter((i) => i.status === "resolved").length}
          />
        </div>

        {/* 🔥 FILTER TABS */}
        <div className="glass-card" style={{ marginTop: 30 }}>
          <div className="filter-tabs">
            {["all", "pending", "under-review", "in-progress", "pending-verification", "resolved"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`filter-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {getStatusText(tab)}
                </button>
              )
            )}
          </div>
        </div>

        {/* 🔥 ISSUE ROWS */}
        <div className="glass-card" style={{ marginTop: 20 }}>
          <h2 className="section-title">Manage Issues</h2>

          {loading ? (
            <div className="loading"></div>
          ) : !filtered.length ? (
            <p style={{ textAlign: "center", color: "var(--gray)", padding: 20 }}>
              No issues to display.
            </p>
          ) : (
            filtered.map((issue) => (
              <div key={issue._id} className="issue-admin-row">
                <div>
                  <h3 className="issue-title">{issue.title}</h3>
                  <p className="issue-desc-small">
                    {issue.description.substring(0, 100)}...
                  </p>

                  <span className={`status-badge ${getStatusColor(issue.status)}`}>
                    {getStatusText(issue.status)}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="admin-actions">
                  <Link to={`/issue/${issue._id}`} className="btn btn-outline">
                    View
                  </Link>

                  {issue.status !== "resolved" && (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => updateStatus(issue._id, "under-review")}
                      >
                        Review
                      </button>

                      <button
                        className="btn btn-accent"
                        onClick={() => updateStatus(issue._id, "in-progress")}
                      >
                        Progress
                      </button>
                    </>
                  )}

                  {issue.status === "pending-verification" && (
                    <button
                      className="btn btn-success"
                      onClick={() => verifyProof(issue._id)}
                    >
                      Verify
                    </button>
                  )}

                  <button className="btn btn-danger" onClick={() => deleteIssue(issue._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

/* ⭐ PREMIUM CARD COMPONENT */
const AdminStatCard = ({ color, icon, label, value }) => (
  <div className="glass-card stat-box">
    <div className="stat-content">
      <div>
        <div className="stat-value" style={{ color }}>
          {value}
        </div>
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-icon" style={{ background: color }}>
        <i className={icon}></i>
      </div>
    </div>
  </div>
);
