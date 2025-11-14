// frontend/src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setUsers(data.users);
  };

  const updateRole = async (id, role) => {
    const res = await fetch(`http://localhost:5000/api/users/${id}/role`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();
    if (data.success) fetchUsers();
  };

  const toggleActive = async (id) => {
    const res = await fetch(
      `http://localhost:5000/api/users/${id}/toggle`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (data.success) fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete user permanently?")) return;

    const res = await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) fetchUsers();
  };

  if (!user || user.role !== "admin")
    return <h2 style={{ paddingTop: 100 }}>Not Allowed</h2>;

  return (
    <div style={{ padding: "110px 20px" }}>
      <h1 className="page-title">User Management 👥</h1>
      <p className="page-subtitle">
        Manage all registered users, staff & admins
      </p>

      <div className="card">
        <h2 className="section-title">All Users</h2>

        {!users.length ? (
          <p>No users found.</p>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              className="issue-row"
              style={{
                padding: 18,
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3>{u.name}</h3>
                <p style={{ margin: "4px 0" }}>{u.email}</p>
                <p style={{ color: "gray" }}>Role: {u.role}</p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                {/* ROLE UPDATE */}
                <select
                  className="form-input"
                  value={u.role}
                  onChange={(e) => updateRole(u._id, e.target.value)}
                >
                  <option value="citizen">Citizen</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>

                {/* ACTIVATE / DEACTIVATE */}
                <button
                  className={`btn ${
                    u.isActive ? "btn-danger" : "btn-success"
                  }`}
                  onClick={() => toggleActive(u._id)}
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => deleteUser(u._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
