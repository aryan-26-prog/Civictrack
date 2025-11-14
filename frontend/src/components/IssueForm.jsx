import React, { useState } from 'react';
import { useIssues } from '../contexts/IssueContext';
import { useAuth } from '../contexts/AuthContext';
import IssueMap from './IssueMap';

const IssueForm = ({ onSuccess }) => {
  const { createIssue } = useIssues();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "pothole",
    severity: "medium",
    location: null, // FIXED
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // When user picks location on map
  const handleLocationSelect = (latlng) => {
    setFormData((p) => ({
      ...p,
      location: {
        type: "Point",
        coordinates: [latlng.lng, latlng.lat], // FIXED
        address: `Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}`
      }
    }));
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.location) {
      setError("Please select a location on the map");
      setLoading(false);
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      severity: formData.severity,
      location: formData.location, // Already correct
    };

    console.log("Final Payload:", payload);

    const result = await createIssue(payload);

    if (result.success) {
      onSuccess();
      setFormData({
        title: "",
        description: "",
        category: "pothole",
        severity: "medium",
        location: null,
      });
    } else {
      setError(result.message || "Issue creation failed");
    }
    setLoading(false);
  };

  if (!user) return <h2>Please login first</h2>;

  return (
    <div>
      <h2>Report New Issue</h2>

      {error && (
        <div style={{ background: "red", color: "#fff", padding: 10 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* TITLE */}
        <div className="form-group">
          <label>Issue Title *</label>
          <input
            type="text"
            name="title"
            className="form-input"
            required
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            className="form-input"
            rows="4"
            required
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* CATEGORY + SEVERITY */}
        <div style={{ display: "flex", gap: 15 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Category *</label>
            <select
              className="form-input"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="pothole">Pothole</option>
              <option value="streetlight">Broken Streetlight</option>
              <option value="garbage">Garbage</option>
              <option value="water">Water Issue</option>
              <option value="sewage">Sewage</option>
              <option value="traffic">Traffic</option>
              <option value="parks">Park</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Severity *</label>
            <select
              className="form-input"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* LOCATION */}
        <label style={{ marginTop: 10 }}>Location *</label>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowMap(true)}
        >
          {formData.location ? "Change Location" : "Select Location"}
        </button>

        {formData.location && (
          <p style={{ marginTop: 10 }}>
            Selected: <b>{formData.location.address}</b>
          </p>
        )}

        {showMap && (
          <div style={{ height: "300px", marginTop: 10 }}>
            <IssueMap selectMode onLocationSelect={handleLocationSelect} />
          </div>
        )}

        <button className="btn btn-primary" style={{ marginTop: 20 }}>
          {loading ? "Reporting..." : "Report Issue"}
        </button>
      </form>
    </div>
  );
};

export default IssueForm;
