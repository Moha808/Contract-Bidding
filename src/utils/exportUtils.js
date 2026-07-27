import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToPDF = (projects, bids) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // primary indigo
  doc.text("Contract Bidding System - Report", 14, 22);
  
  // Projects Table
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("Recent Projects", 14, 35);
  
  const projectColumns = ["Title", "Budget (N)", "Deadline (days)", "Category"];
  const projectRows = projects.map(p => [p.title, p.budget, p.deadline, p.category]);
  
  doc.autoTable({
    head: [projectColumns],
    body: projectRows,
    startY: 40,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }
  });

  // Bids Table
  const finalY = doc.lastAutoTable.finalY || 40;
  doc.text("Latest Bids", 14, finalY + 15);
  
  const bidColumns = ["Project", "Contractor", "Amount (N)", "Duration", "Experience", "Quality", "On-Time", "Disputes"];
  const bidRows = bids.map(b => [b.projectName, b.contractor, b.amount, `${b.duration} days`, `${b.experience} yrs`, `${b.qualityScore}%`, b.onTimeRate, b.pastDisputes]);
  
  doc.autoTable({
    head: [bidColumns],
    body: bidRows,
    startY: finalY + 20,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] }
  });

  doc.save("contract-bidding-report.pdf");
};

export const exportToExcel = (projects, bids) => {
  const wb = XLSX.utils.book_new();

  // Projects Sheet
  const projectsData = projects.map(p => ({
    Title: p.title,
    "Budget (N)": p.budget,
    "Deadline (days)": p.deadline,
    Category: p.category
  }));
  const wsProjects = XLSX.utils.json_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(wb, wsProjects, "Projects");

  // Bids Sheet
  const bidsData = bids.map(b => ({
    Project: b.projectName,
    Contractor: b.contractor,
    "Amount (N)": b.amount,
    "Duration (days)": b.duration,
    "Experience (years)": b.experience,
    "Quality Rating (%)": b.qualityScore,
    "On-Time Rate": b.onTimeRate,
    "Past Disputes": b.pastDisputes
  }));
  const wsBids = XLSX.utils.json_to_sheet(bidsData);
  XLSX.utils.book_append_sheet(wb, wsBids, "Bids");

  // Save File
  XLSX.writeFile(wb, "contract-bidding-data.xlsx");
};
