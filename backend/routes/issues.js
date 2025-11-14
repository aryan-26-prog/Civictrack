const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const auth = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");

/* ======================================================
   📌 CREATE NEW ISSUE  (REALTIME + GEOJSON FIXED)
====================================================== */
router.post("/", auth, async (req, res) => {
  try {
    const io = req.app.get("io"); // SOCKET.IO INSTANCE

    const { title, description, severity, category, location } = req.body;

    if (!title || !description || !severity || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (
      !location.coordinates ||
      !Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location format.",
      });
    }

    const [lng, lat] = location.coordinates;

    const issue = await Issue.create({
      title,
      description,
      severity,
      category,
      reportedBy: req.user.id,
      location: {
        type: "Point",
        coordinates: [lng, lat],
        address: location.address || "",
      },
    });

    // 🔥 REALTIME EVENT
    io.emit("issue-created", issue);

    res.status(201).json({
      success: true,
      message: "Issue reported successfully.",
      issue,
    });

  } catch (err) {
    console.log("❌ Create Issue Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Could not create issue.",
    });
  }
});


/* ======================================================
   📌 GET ALL ISSUES
====================================================== */
router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("reportedBy", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, issues });
  } catch (err) {
    console.log("❌ Get All Issues Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* ======================================================
   📌 GET SINGLE ISSUE
====================================================== */
router.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "name email")
      .populate("comments.user", "name email");

    if (!issue)
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });

    res.json({ success: true, issue });
  } catch (err) {
    console.log("❌ Get Issue Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* ======================================================
   📌 ADMIN: UPDATE STATUS  (REALTIME)
====================================================== */
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const io = req.app.get("io");

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update issue status.",
      });
    }

    const validStatuses = [
      "pending",
      "under-review",
      "in-progress",
      "pending-verification",
      "resolved",
    ];

    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!issue)
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });

    // 🔥 REALTIME
    io.emit("issue-updated", issue);

    res.json({ success: true, issue });

  } catch (err) {
    console.log("❌ Status Update Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* ======================================================
   📌 CITIZEN: UPLOAD PROOF (REALTIME)
====================================================== */
router.patch(
  "/:id/resolve",
  auth,
  upload.single("proof"),
  handleUploadError,
  async (req, res) => {
    try {
      const io = req.app.get("io");

      const issue = await Issue.findById(req.params.id);

      if (!issue)
        return res.status(404).json({
          success: false,
          message: "Issue not found",
        });

      if (String(issue.reportedBy) !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can upload proof only for your own issues.",
        });
      }

      if (!req.file)
        return res.status(400).json({
          success: false,
          message: "Proof image is required.",
        });

      issue.resolutionProof = `/uploads/${req.file.filename}`;
      issue.resolutionNotes = req.body.notes || "";
      issue.status = "pending-verification";
      await issue.save();

      // 🔥 REALTIME
      io.emit("issue-updated", issue);

      res.json({
        success: true,
        message: "Proof submitted (pending admin verification).",
        issue,
      });

    } catch (err) {
      console.log("❌ Upload Proof Error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);


/* ======================================================
   📌 ADMIN VERIFY ISSUE  (REALTIME)
====================================================== */
router.patch("/:id/verify", auth, async (req, res) => {
  try {
    const io = req.app.get("io");

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can verify issues.",
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });

    if (issue.status !== "pending-verification") {
      return res.status(400).json({
        success: false,
        message: "Issue is not awaiting verification.",
      });
    }

    issue.status = "resolved";
    await issue.save();

    // 🔥 REALTIME
    io.emit("issue-verified", issue);
    io.emit("issue-updated", issue);

    res.json({
      success: true,
      message: "Issue verified & marked resolved.",
      issue,
    });

  } catch (err) {
    console.log("❌ Verify Issue Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* ======================================================
   📌 ADD COMMENT (REALTIME)
====================================================== */
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const io = req.app.get("io");

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({ success: false, message: "Issue not found" });

    issue.comments.push({
      user: req.user.id,
      text,
      createdAt: new Date(),
    });

    await issue.save();

    // 🔥 REALTIME
    io.emit("issue-comment", issue);

    res.json({ success: true, message: "Comment added", issue });

  } catch (err) {
    console.log("❌ Add Comment Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* ======================================================
   📌 UPVOTE / DOWNVOTE  (REALTIME)
====================================================== */
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const io = req.app.get("io");

    const { type } = req.body;

    if (!["up", "down"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid vote type.",
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue)
      return res.status(404).json({ success: false, message: "Issue not found" });

    issue.votes = issue.votes.filter((v) => String(v.user) !== req.user.id);

    issue.votes.push({
      user: req.user.id,
      type,
    });

    await issue.save();

    // 🔥 REALTIME
    io.emit("issue-voted", issue);

    res.json({
      success: true,
      message: "Vote updated",
      issue,
    });

  } catch (err) {
    console.log("❌ Vote Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* ======================================================
   📌 DELETE ISSUE  (ADMIN ONLY)
====================================================== */
router.delete("/:id", auth, async (req, res) => {
  try {
    const io = req.app.get("io");

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete issues.",
      });
    }

    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue)
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });

    // 🔥 REALTIME
    io.emit("issue-deleted", req.params.id);

    res.json({
      success: true,
      message: "Issue deleted successfully.",
    });

  } catch (err) {
    console.log("❌ Delete Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
