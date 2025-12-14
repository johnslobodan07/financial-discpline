const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { exportCSV, exportPDF } = require("../services/export.service");

// CSV Export
router.get("/csv", auth, async (req, res) => {
  try {
    const { savingsCSV, eventsCSV } = await exportCSV(req.user.id);
    res.setHeader("Content-Disposition", "attachment; filename=audit.csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(savingsCSV + "\n\n" + eventsCSV);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PDF Export
router.get("/pdf", auth, async (req, res) => {
  try {
    const pdfBuffer = await exportPDF(req.user.id);
    res.setHeader("Content-Disposition", "attachment; filename=audit.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
