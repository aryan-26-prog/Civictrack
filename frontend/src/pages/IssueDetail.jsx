// frontend/src/pages/IssueDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useIssues } from "../contexts/IssueContext";
import IssueMap from "../components/IssueMap";

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addComment, voteIssue, fetchIssues } = useIssues();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofNotes, setProofNotes] = useState("");

  /* ------------------------------------------------------ */
  /*  FETCH ISSUE */
  /* ------------------------------------------------------ */
  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/issues/${id}`);
      const data = await res.json();
      if (data.success) setIssue(data.issue);
      else alert("Issue not found");
    } catch {
      alert("Error loading issue");
    }
    setLoading(false);
  };

  /* ------------------------------------------------------ */
  /*  COMMENT */
  /* ------------------------------------------------------ */
  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const res = await addComment(id, comment);
    if (res.success) {
      setIssue(res.data.issue);
      setComment("");
      fetchIssues();
    }
  };

  /* ------------------------------------------------------ */
  /*  VOTING */
  /* ------------------------------------------------------ */
  const handleVote = async (type) => {
    const res = await voteIssue(id, type);
    if (res.success) {
      setIssue(res.data.issue);
      fetchIssues();
    }
  };

  const userVoted = (type) =>
    issue?.votes?.some(
      (v) => String(v.user?._id || v.user) === String(user?.id) && v.type === type
    );

  /* ------------------------------------------------------ */
  /*  PROOF UPLOAD */
  /* ------------------------------------------------------ */
  const uploadProof = async () => {
    if (!proofFile) return alert("Upload proof image!");

    const formData = new FormData();
    formData.append("proof", proofFile);
    formData.append("notes", proofNotes);

    const res = await fetch(`http://localhost:5000/api/issues/${id}/resolve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      alert("Proof submitted!");
      setIssue(data.issue);
      fetchIssues();
    } else alert(data.message);
  };

  /* ------------------------------------------------------ */
  /*  ADMIN VERIFY */
  /* ------------------------------------------------------ */
  const verifyIssue = async () => {
    const res = await fetch(`http://localhost:5000/api/issues/${id}/verify`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await res.json();
    if (data.success) {
      alert("Issue Verified!");
      setIssue(data.issue);
      fetchIssues();
    }
  };

  /* ------------------------------------------------------ */
  /* HELPERS */
  /* ------------------------------------------------------ */
  const getStatusText = (s) =>
    s.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const getStatusColor = (s) => {
    if (s === "resolved") return "status-green";
    if (s === "pending-verification") return "status-yellow";
    if (s === "in-progress") return "status-blue";
    if (s === "under-review") return "status-orange";
    return "status-gray";
  };

  /* ------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------ */

  if (loading)
    return (
      <div className="center-screen">
        <div className="loading"></div>
      </div>
    );

  if (!issue)
    return (
      <div className="center-screen">
        <h2>Issue Not Found</h2>
        <Link to="/map" className="btn btn-primary">
          Back
        </Link>
      </div>
    );

  /* SAFE MAP COORDINATES */
  let center = [28.61, 77.21];
  if (issue.location?.coordinates?.length === 2) {
    const [lng, lat] = issue.location.coordinates;
    center = [lat, lng];
  }

  return (
    <div className="issue-detail-container">
      {/* TOP NAV */}
      <Link to="/map" className="back-btn">
        ← Back to Map
      </Link>

      {/* HEADER */}
      <div className="issue-header-card">
        <h1 className="issue-title-premium">{issue.title}</h1>
        <div className="issue-status-row">
          <span className={`badge-premium ${getStatusColor(issue.status)}`}>
            {getStatusText(issue.status)}
          </span>
          <span className="reported-by">
            <i className="fas fa-user"></i> {issue.reportedBy?.name}
          </span>
        </div>
      </div>

      <div className="issue-grid">
        {/* LEFT COLUMN */}
        <div className="left-section">

          {/* DESCRIPTION */}
          <div className="card-premium">
            <h3>Description</h3>
            <p>{issue.description}</p>
          </div>

          {/* MAP */}
          <div className="card-premium">
            <h3>Location</h3>
            <div style={{ height: "300px" }}>
              <IssueMap issues={[issue]} center={center} />
            </div>
            <p className="address">{issue.location?.address}</p>
          </div>

          {/* COMMENTS */}
          <div className="card-premium">
            <h3>Comments</h3>
            <form onSubmit={handleComment}>
              <textarea
                className="form-input"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="btn btn-primary">Add Comment</button>
            </form>

            {issue.comments?.map((c, i) => (
              <div className="comment-box-premium" key={i}>
                <strong>{c.user?.name}</strong>
                <p>{c.text}</p>
              </div>
            ))}
          </div>

          {/* PROOF UPLOAD */}
          {user?.id === issue.reportedBy?._id &&
            issue.status !== "pending-verification" &&
            issue.status !== "resolved" && (
              <div className="card-premium">
                <h3>Upload Proof of Fix</h3>

                <input
                  type="file"
                  onChange={(e) => setProofFile(e.target.files[0])}
                />

                <textarea
                  className="form-input"
                  placeholder="Notes (optional)"
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                />

                <button className="btn btn-primary" onClick={uploadProof}>
                  Submit Proof
                </button>
              </div>
            )}

          {/* SHOW PROOF */}
          {issue.resolutionProof && (
            <div className="card-premium">
              <h3>Submitted Proof</h3>
              <img src={issue.resolutionProof} className="proof-img" />
              <p>{issue.resolutionNotes}</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-section">

          {/* DETAILS */}
          <div className="card-premium">
            <h3>Issue Details</h3>
            <p><strong>Status:</strong> {getStatusText(issue.status)}</p>
            <p><strong>Severity:</strong> {issue.severity}</p>
            <p><strong>Created:</strong> {new Date(issue.createdAt).toDateString()}</p>
            <p><strong>Updated:</strong> {new Date(issue.updatedAt).toDateString()}</p>
          </div>

          {/* VOTES */}
          <div className="card-premium">
            <h3>Votes</h3>
            <div className="vote-row">
              <button
                className={`vote-btn ${userVoted("up") ? "voted-up" : ""}`}
                onClick={() => handleVote("up")}
              >
                👍 {issue.votes?.filter((v) => v.type === "up").length}
              </button>

              <button
                className={`vote-btn ${userVoted("down") ? "voted-down" : ""}`}
                onClick={() => handleVote("down")}
              >
                👎 {issue.votes?.filter((v) => v.type === "down").length}
              </button>
            </div>
          </div>

          {/* ADMIN VERIFY */}
          {user?.role === "admin" &&
            issue.status === "pending-verification" && (
              <div className="card-premium">
                <h3>Admin Controls</h3>
                <button className="btn btn-success" onClick={verifyIssue}>
                  Approve & Resolve
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
