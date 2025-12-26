const express = require("express");
const {
  listColleges,
  createCollege,
  updateCollege,
  deleteCollege,
} = require("../controllers/college.controller");
const {
  authenticateToken,
  requireRole,
} = require("../middlewares/auth.middleware");

const collegeRouter = express.Router();

// Public (used by registration form)
collegeRouter.get("/", listColleges);

// Admin-only mutations
collegeRouter.post(
  "/",
  authenticateToken,
  requireRole(["admin"]),
  createCollege
);
collegeRouter.put(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  updateCollege
);
collegeRouter.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  deleteCollege
);

module.exports = { collegeRouter };
