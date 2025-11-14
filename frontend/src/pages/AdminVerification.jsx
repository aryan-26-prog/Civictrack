import React, { useEffect, useState } from "react";
import { useIssues } from "../contexts/IssueContext";
import { useAuth } from "../contexts/AuthContext";

const AdminVerification = () => {
  const { issues, fetchIssues } = useIssues();
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [pendingIssues, setPendingIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  useEffect(() => {
    setPendingIssues(
      issues.filter((i) => i.status === "pending-verification")
    );
  }, [issues]);

  if (!user || user.role !== "admin") {
    return (
      <div className="center-screen">
        <h2>Access Denied</h2>
      </div>
    );
  }

  const approveIssue = async (id) => {
    const res = await fetch(
      `http://localhost:5000/api/issues/${id}/verify`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    if (data.success) {
      alert("Issue Verified Successfully ✔");
      fetchIssues();
    }
  };

  const rejectIssue = async (id) => {
    const res = await fetch(
      `http://localhost:5000/api/issues/${id}/reject`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    if (data.success) {
      alert("Issue Rejected ❌");
      fetchIssues();
    }
  };

  return (
    <div style={{ padding: "110px 20px", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1250px", margin: "0 auto" }}>

        {/* HEADER */}
        <h1 className="admin-title">Verification Center 🔍</h1>
        <p className="admin-subtitle">
          Review user-submitted resolution proofs & verify them.
        </p>

        {/* MAIN CARD */}
        <div className="glass-card" style={{ marginTop: 20 }}>
          <h2 className="section-title">Pending Verification</h2>

          {pendingIssues.length === 0 ? (
            <p style={{ color: "var(--gray)", textAlign: "center", padding: 40 }}>
              No issues waiting for verification 🎉
            </p>
          ) : (
            pendingIssues.map((issue) => (
              <div className="verify-row" key={issue._id}>
                {/* LEFT CONTENT */}
                <div style={{ flex: 1 }}>
                  <h3 className="issue-title">{issue.title}</h3>
                  <p className="issue-desc-small">
                    {issue.description.substring(0, 110)}...
                  </p>

                  <p style={{ color: "#ccc", marginTop: 6 }}>
                    <i className="fas fa-user"></i> {issue.reportedBy?.name}
                  </p>

                  {/* PROOF NOTES */}
                  {issue.resolutionNotes && (
                    <p style={{ marginTop: 10, color: "#ddd" }}>
                      <strong>Notes:</strong> {issue.resolutionNotes}
                    </p>
                  )}
                </div>

                {/* PROOF IMAGE */}
                <div style={{ marginRight: 20 }}>
                  {issue.resolutionProof ? (
                    <img
                      src={issue.resolutionProof}
                      alt="proof"
                      style={{
                        width: "200px",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                      }}
                    />
                  ) : (
                    <p style={{ color: "#aaa" }}>No image uploaded</p>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="verify-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => approveIssue(issue._id)}
                  >
                    Approve ✔
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => rejectIssue(issue._id)}
                  >
                    Reject ✖
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

export default AdminVerification;
