const DisciplineEvent = require("../models/DisplineEvent");
const User = require("../models/User");
const Saving = require("../models/Savings");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

function calculateGrade(consistencyScore) {
  if (consistencyScore >= 90) return "A";
  if (consistencyScore >= 80) return "B";
  if (consistencyScore >= 70) return "C";
  if (consistencyScore >= 60) return "D";
  return "F";
}

/**
 * Export user savings & events as CSV
 */
exports.exportCSV = async (userId) => {
  const savings = await Saving.find({ userId }).sort({ date: 1 }).lean();
  const events = await DisciplineEvent.find({ userId })
    .sort({ date: 1 })
    .lean();

  const savingsCSV = new Parser().parse(savings);
  const eventsCSV = new Parser().parse(events);

  return { savingsCSV, eventsCSV };
};

/**
 * Export user savings & events as PDF
 * Returns a PDFBuffer
 */
exports.exportPDF = async (userId) => {
  const savings = await Saving.find({ userId }).sort({ date: 1 }).lean();
  const events = await DisciplineEvent.find({ userId })
    .sort({ date: 1 })
    .lean();

  const totalSaved = savings.reduce((sum, s) => sum + s.amount, 0);
  const savedDays = savings.length;
  const missedDays = events.filter((e) => e.type === "MISSED").length;
  const longestStreak = Math.max(
    ...events.map((e) => e.metadata?.streak || 0),
    0
  );

  const user = await User.findById(userId).lean();

  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
  });

  const buffers = [];
  doc.on("data", buffers.push.bind(buffers));

  /* ---------- REPORT HEADER ---------- */

  drawHeader(doc, "Financial Discipline Report");

  //   const pageWidth = doc.page.width;
  //   const margin = doc.page.margins.left;

  //   // Title
  //   doc
  //     .font("Helvetica-Bold")
  //     .fontSize(26)
  //     .fillColor("#111")
  //     .text("Savings & Discipline Audit Report", {
  //       align: "center",
  //     });

  //   // Subtitle
  //   doc
  //     .moveDown(0.3)
  //     .font("Helvetica")
  //     .fontSize(12)
  //     .fillColor("gray")
  //     .text("Personal Financial Discipline & Savings Performance", {
  //       align: "center",
  //     });

  //   // Separator line
  //   doc
  //     .moveDown(0.8)
  //     .strokeColor("#E0E0E0")
  //     .lineWidth(1.5)
  //     .moveTo(margin, doc.y)
  //     .lineTo(pageWidth - margin, doc.y)
  //     .stroke();

  //   // Space after header
  //   doc.moveDown(1.5);

  // Reset color
  doc.fillColor("black");

  doc
    .fontSize(10)
    .fillColor("gray")
    .font("Helvetica-Bold")
    .text(`User ID: ${userId}`)
    .text(`Name: ${user.name || "N/A"}`)
    .text(`Email: ${user.email || "N/A"}`)
    .text(`Generated on: ${new Date().toDateString()}`)
    .moveDown();

  doc.fillColor("black");
  doc.moveDown(1.5);

  /* ---------- SUMMARY + GRADE ---------- */

  doc.fontSize(14).text("Summary", { underline: true }).font("Helvetica-Bold");

  const summaryStartY = doc.y + 10;

  // Summary text (left)
  doc.fontSize(11);
  doc
    .font("Helvetica-Bold")
    .text(`Total Saved: ${totalSaved}`, 40, summaryStartY)
    .text(`Days Saved: ${savedDays}`)
    .text(`Missed Days: ${missedDays}`)
    .text(`Longest Streak: ${longestStreak} days`);

  // Grade badge (right)
  const consistencyScore =
    savedDays + missedDays === 0
      ? 0
      : Math.round((savedDays / (savedDays + missedDays)) * 100);

  const grade = calculateGrade(consistencyScore);

  drawGradeBadge(doc, grade, doc.page.width - 120, summaryStartY - 5);

  doc.moveDown(4);

  doc.addPage();
  drawHeader(doc, "Financial Discipline Report");
  /* ---------- SAVINGS TABLE ---------- */
  doc.fontSize(16).text("Savings Records").moveDown();

  drawTableHeader(doc, ["Date", "Amount", "Category", "Source"]);

  savings.forEach((s) => {
    drawTableRow(doc, [s.date, s.amount.toString(), s.category, s.source]);
  });

  doc.addPage();
  drawHeader(doc, "Financial Discipline Report");
  /* ---------- DISCIPLINE EVENTS TABLE ---------- */
  doc.fontSize(16).text("Discipline Events").moveDown();

  drawTableHeader(doc, ["Date", "Event Type"]);

  events.forEach((e) => {
    drawTableRow(doc, [e.date, e.type]);
  });

  /* ---------- FOOTER (FIXED) ---------- */

  drawFooter(doc);

  doc.end();

  return new Promise((resolve) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
  });
};

/* ---------- TABLE HELPERS ---------- */

function drawTableHeader(doc, headers) {
  const startY = doc.y; // LOCK Y POSITION
  const startX = 40;
  const colWidth = 130;

  doc.fontSize(11).fillColor("black");

  headers.forEach((header, index) => {
    doc.text(header, startX + index * colWidth, startY, {
      width: colWidth,
      align: "left",
    });
  });

  doc.moveDown(1);
  doc
    .moveTo(startX, doc.y)
    .lineTo(startX + headers.length * colWidth, doc.y)
    .stroke();

  doc.moveDown(0.5);
}

function drawTableRow(doc, row) {
  const startY = doc.y;
  const startX = 40;
  const colWidth = 130;

  row.forEach((cell, index) => {
    doc.text(String(cell), startX + index * colWidth, startY, {
      width: colWidth,
      align: "left",
    });
  });

  doc.moveDown(1);

  if (doc.y > 750) {
    doc.addPage();
  }
}

function drawGradeBadge(doc, grade, x, y) {
  const size = 60;
  const colorMap = {
    A: "green",
    B: "blue",
    C: "orange",
    D: "black",
    F: "red",
  };

  // Border
  doc.rect(x, y, size, size).lineWidth(2).stroke();

  // Grade letter
  doc
    .fontSize(28)
    .font("Helvetica-Bold")
    .fillColor(colorMap[grade] || "gray")
    .text(grade, x, y + 12, {
      width: size,
      align: "center",
    });

  // Label
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("gray")
    .text("GRADE", x, y + 42, {
      width: size,
      align: "center",
    });

  doc.fillColor("black");
}

function drawHeader(doc, title) {
  const margin = doc.page.margins.left;

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor("#111")
    .text(title, margin, 30);

  doc
    .fontSize(10)
    .fillColor("gray")
    .text("Savings & Discipline Audit Report", margin, 50);

  doc
    .strokeColor("#DDD")
    .lineWidth(1)
    .moveTo(margin, 65)
    .lineTo(doc.page.width - margin, 65)
    .stroke();

  doc.moveDown(3);
}

function drawFooter(doc) {
  const footerText =
    "This document contains confidential financial data intended solely for the authorized individual. Unauthorized distribution, copying, or disclosure is strictly prohibited.";

  const margin = 50;
  const footerY = doc.page.height - 60;

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("gray")
    .text(footerText, margin, footerY, {
      width: doc.page.width - margin * 2,
      align: "center",
    });
}
