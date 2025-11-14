// frontend/src/pages/StaffAssignment.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useIssues } from "../contexts/IssueContext";
import { useAuth } from "../contexts/AuthContext";

const StaffAssignment = () => {
  const { user } = useAuth();
  const { issues, fetchIssues } = useIssues();
  const [staffList, setStaffList] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchIssues();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    const res = await fetch("http://localhost:5000/api/users/staff", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setStaffList(data.users);
  };

  const assignStaff = async (issueId, staffId) => {
    const res = await fetch(
      `http://localhost:5000/api/issues/${issueId}/assign`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ staffId }),
      }
    );

    const data = await res.json();
    if (data.success) fetchIssues();
  };

  const pending = useMemo(
    () => issues.filter((i) => i.assignedTo == null),
    [issues]
  );

  if (!user || user.role !== "admin")
    return <h2 style={{ paddingTop: 100 }}>Not Allowed</h2>;

  return (
    <div style={{ padding: "110px 20px" }}>
      <h1 className="page-title">Staff Assignment 🧑‍🔧</h1>

      <div className="card">
        <h2 className="section-title">Unassigned Issues</h2>

        {!pending.length ? (
          <p>All issues are assigned 🎉</p>
        ) : (
          pending.map((issue) => (
            <div
              key={issue._id}
              className="issue-row"
              style={{
                padding: 18,
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3>{issue.title}</h3>
                <p>{issue.description.slice(0, 80)}...</p>
              </div>

              <select
                className="form-input"
                onChange={(e) => assignStaff(issue._id, e.target.value)}
              >
                <option>Select Staff</option>
                {staffList.map((s) => (
                  <option value={s._id} key={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffAssignment;
