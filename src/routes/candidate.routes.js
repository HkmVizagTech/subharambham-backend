const express = require("express");
const { CandidateController } = require("../controllers/Candidate.controller");
const {
  authenticateToken,
  requireRole,
} = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const CandidateRouter = express.Router();

// Preview which Gupshup template would be used for a given gender (ensure this is before parameter routes)
CandidateRouter.get("/template-preview", CandidateController.templatePreview);

CandidateRouter.get(
  "/attendance-list",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.attendanceList
);
CandidateRouter.get(
  "/admin/scanned-list",
  authenticateToken,
  requireRole(["admin", "user"]),
  CandidateController.adminScannedList
);
CandidateRouter.get(
  "/eligible-for-certificate",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.getEligibleCandidatesForCertificate
);
CandidateRouter.get("/verify-payment/:id", CandidateController.verifyPaymentId);
CandidateRouter.get(
  "/force-check-payment/:candidateId",
  CandidateController.forceCheckPayment
);
CandidateRouter.get(
  "/send",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.sendTemplate
);
CandidateRouter.get(
  "/certificate-statistics",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.getCertificateStatistics
);
CandidateRouter.get(
  "/certificate-system-health",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.getCertificateSystemHealth
);
CandidateRouter.get(
  "/certificate/:documentId",
  CandidateController.getCertificateByDocumentId
);
CandidateRouter.get(
  "/",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.getAllCandidates
);

// Preview which Gupshup template would be used for a given gender
CandidateRouter.get("/template-preview", CandidateController.templatePreview);

CandidateRouter.post(
  "/send-certificates",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.sendCertificates
);
CandidateRouter.post(
  "/send-single-certificate",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.sendSingleCertificate
);
CandidateRouter.post(
  "/resend-certificate",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.resendCertificate
);
CandidateRouter.post("/create-order", CandidateController.createOrder);
CandidateRouter.post(
  "/create-order-with-file",
  upload.single("studentIdCard"),
  CandidateController.createOrderWithFile
);
CandidateRouter.post("/verify-payment", CandidateController.verifyPayment);
CandidateRouter.post(
  "/verify-payment-immediately",
  CandidateController.verifyPaymentImmediately
);
CandidateRouter.post(
  "/check-pending-payments",
  CandidateController.checkPendingPayments
);
CandidateRouter.post("/", CandidateController.createCandidate);
CandidateRouter.post("/mark-attendance", CandidateController.markAttendance);
CandidateRouter.post("/get-qr-codes", CandidateController.getQRCodesByPhone);
CandidateRouter.post(
  "/admin/attendance-scan",
  authenticateToken,
  requireRole(["admin", "user"]),
  CandidateController.adminAttendanceScan
);
CandidateRouter.post(
  "/generate-single-certificate",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.generateSingleCertificateOnly
);

// Admin Action Routes
CandidateRouter.post(
  "/admin/accept/:candidateId",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.acceptCandidate
);
CandidateRouter.post(
  "/admin/reject/:candidateId",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.rejectCandidate
);
CandidateRouter.post(
  "/admin/refund/:candidateId",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.refundCandidate
);

CandidateRouter.put(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.updateCandidate
);
CandidateRouter.delete(
  "/asm",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.deleteByName
);

// Danger zone: destructive admin operations
CandidateRouter.delete(
  "/admin/wipe-all",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.wipeAllCandidates
);
CandidateRouter.post(
  "/admin/reset-attendance",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.resetAttendanceData
);
CandidateRouter.delete(
  "/:id",
  authenticateToken,
  requireRole(["admin"]),
  CandidateController.deleteCandidate
);

CandidateRouter.get("/:id", CandidateController.getCandidateById);

module.exports = { CandidateRouter };
