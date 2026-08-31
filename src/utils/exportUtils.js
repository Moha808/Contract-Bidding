import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToPDF = (projects, bids) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229);
  doc.text("FCAH&PT Vom - Contract Bidding Report", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
  
  // Projects Table
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("Published Projects", 14, 45);
  
  const projectColumns = ["Title", "Budget (N)", "Deadline (days)", "Category", "Total Bids"];
  const projectRows = projects.map(p => [
    p.title, 
    Number(p.budget).toLocaleString(), 
    p.deadline, 
    p.category,
    bids.filter(b => b.projectName?.toLowerCase() === p.title?.toLowerCase()).length
  ]);
  
  doc.autoTable({
    head: [projectColumns],
    body: projectRows,
    startY: 50,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 }
  });

  // Bids Table
  const finalY = doc.lastAutoTable.finalY || 50;
  doc.setFontSize(14);
  doc.text("All Submitted Proposals", 14, finalY + 15);
  
  const bidColumns = ["Project", "Contractor", "Amount (N)", "Duration", "Quality", "Disputes", "Status"];
  const bidRows = bids.map(b => [
    b.projectName, 
    b.contractor, 
    Number(b.amount).toLocaleString(), 
    `${b.duration}d`, 
    `${b.qualityScore}%`, 
    b.pastDisputes,
    b.status || 'Pending'
  ]);
  
  doc.autoTable({
    head: [bidColumns],
    body: bidRows,
    startY: finalY + 20,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { fontSize: 9 }
  });

  doc.save("FCAHPT-Contract-Report.pdf");
};

export const exportToExcel = (projects, bids) => {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData = [
    { Metric: "Report Generated", Value: new Date().toLocaleString() },
    { Metric: "Total Projects", Value: projects.length },
    { Metric: "Total Bids Received", Value: bids.length },
    { Metric: "Total Accepted Bids", Value: bids.filter(b => b.status === 'Accepted').length },
    { Metric: "Total Budget", Value: `N ${projects.reduce((a, p) => a + Number(p.budget || 0), 0).toLocaleString()}` }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  // adjust column widths for summary
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // 2. Projects Sheet
  const projectsData = projects.map(p => ({
    "Project Title": p.title,
    "Budget (Naira)": Number(p.budget),
    "Deadline (Days)": p.deadline,
    "Category": p.category,
    "Bids Received": bids.filter(b => b.projectName?.toLowerCase() === p.title?.toLowerCase()).length
  }));
  const wsProjects = XLSX.utils.json_to_sheet(projectsData);
  wsProjects['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsProjects, "Projects");

  // 3. Bids Sheet
  const bidsData = bids.map(b => ({
    "Project Name": b.projectName,
    "Contractor Name": b.contractor,
    "Bid Amount (Naira)": Number(b.amount),
    "Duration (Days)": b.duration,
    "Experience (Years)": b.experience,
    "Quality Rating (%)": b.qualityScore,
    "On-Time Rate (%)": b.onTimeRate,
    "Past Disputes": b.pastDisputes,
    "Status": b.status || 'Pending'
  }));
  const wsBids = XLSX.utils.json_to_sheet(bidsData);
  wsBids['!cols'] = [{ wch: 40 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsBids, "Bids");

  // Save File
  XLSX.writeFile(wb, "FCAHPT-Contract-Data.xlsx");
};
