import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ParsedFinancialData {
  fileName: string;
  fileType: string;
  rawText: string;
  tableHeaders: string[];
  tableRows: (string | number)[][];
  summary: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
  };
}

/**
 * Parses uploaded Excel (.xlsx, .xls), CSV, or TXT financial files
 */
export async function parseFinancialFile(file: File): Promise<ParsedFinancialData> {
  const fileName = file.name;
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "";

  if (fileExt === "xlsx" || fileExt === "xls") {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON array
    const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(worksheet, { header: 1 });

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (jsonData.length > 0) {
      headers = (jsonData[0] || []).map((h) => String(h || ""));
      rows = jsonData.slice(1).filter((row) => row && row.length > 0);
    }

    // Convert sheet to CSV raw text
    const rawText = XLSX.utils.sheet_to_csv(worksheet);
    const summary = calculateFinancialSummary(headers, rows);

    return {
      fileName,
      fileType: fileExt,
      rawText,
      tableHeaders: headers,
      tableRows: rows,
      summary,
    };
  } else {
    // CSV or TXT
    const textContent = await file.text();
    const lines = textContent.split(/\r?\n/).filter((line) => line.trim().length > 0);

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (lines.length > 0) {
      // Determine delimiter (comma, tab, or pipe)
      const firstLine = lines[0];
      const delimiter = firstLine.includes("\t") ? "\t" : firstLine.includes("|") ? "|" : ",";

      headers = firstLine.split(delimiter).map((col) => col.trim().replace(/^["']|["']$/g, ""));

      rows = lines.slice(1).map((line) => {
        return line.split(delimiter).map((val) => {
          const trimmed = val.trim().replace(/^["']|["']$/g, "");
          const num = Number(trimmed);
          return isNaN(num) || trimmed === "" ? trimmed : num;
        });
      });
    }

    const summary = calculateFinancialSummary(headers, rows);

    return {
      fileName,
      fileType: fileExt,
      rawText: textContent,
      tableHeaders: headers,
      tableRows: rows,
      summary,
    };
  }
}

/**
 * Helper to extract income and expense metrics from parsed rows
 */
function calculateFinancialSummary(headers: string[], rows: (string | number)[][]) {
  let totalIncome = 0;
  let totalExpense = 0;

  let amountIdx = -1;
  let typeIdx = -1;

  headers.forEach((h, idx) => {
    const lower = h.toLowerCase();
    if (lower.includes("amount") || lower.includes("จํานวน") || lower.includes("ราคา") || lower.includes("ยอด")) {
      amountIdx = idx;
    }
    if (lower.includes("type") || lower.includes("ประเภท") || lower.includes("รายการ")) {
      typeIdx = idx;
    }
  });

  rows.forEach((row) => {
    let rowVal = 0;
    if (amountIdx !== -1 && row[amountIdx] !== undefined) {
      rowVal = typeof row[amountIdx] === "number" ? (row[amountIdx] as number) : Number(row[amountIdx]) || 0;
    } else {
      const numCell = row.find((cell) => typeof cell === "number" || (!isNaN(Number(cell)) && String(cell).trim() !== ""));
      if (numCell !== undefined) rowVal = Number(numCell) || 0;
    }

    const typeStr = typeIdx !== -1 ? String(row[typeIdx] || "").toLowerCase() : "";

    if (typeStr.includes("expense") || typeStr.includes("จ่าย") || typeStr.includes("ออก") || rowVal < 0) {
      totalExpense += Math.abs(rowVal);
    } else {
      totalIncome += Math.abs(rowVal);
    }
  });

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
  };
}

/**
 * Helper to extract table headers and rows from Markdown AI response
 */
export function extractTableFromMarkdown(markdownText: string): { headers: string[]; rows: (string | number)[][] } {
  const cleanStr = (s: string) => s.replace(/\*\*/g, "").replace(/`/g, "").trim();

  const lines = markdownText.split("\n");
  const tableLines: string[] = [];

  for (const line of lines) {
    if (line.includes("|") && line.trim().startsWith("|")) {
      tableLines.push(line);
    }
  }

  if (tableLines.length >= 2) {
    const parseRow = (l: string) => l.split("|").slice(1, -1).map(cleanStr);
    const headers = parseRow(tableLines[0]);

    // Filter out separator row (e.g. |---|---|)
    const dataRowLines = tableLines.slice(1).filter((l) => !l.includes("---"));
    const rows = dataRowLines.map(parseRow);

    return { headers, rows };
  }

  // Fallback: extract list items or key-value pairs (e.g. - รายรวม: 3,500,000 บาท)
  const rows: (string | number)[][] = [];
  lines.forEach((l) => {
    const trimmed = cleanStr(l);
    if ((trimmed.includes(":") || trimmed.includes("-")) && !trimmed.startsWith("วิธีทำ") && !trimmed.startsWith("รับทราบ")) {
      const separatorIdx = trimmed.indexOf(":") !== -1 ? trimmed.indexOf(":") : trimmed.indexOf("-");
      if (separatorIdx > 0) {
        const key = cleanStr(trimmed.slice(0, separatorIdx).replace(/^[-*•\d+.]\s*/, ""));
        const val = cleanStr(trimmed.slice(separatorIdx + 1));
        if (key && val && key.length < 60) {
          rows.push([key, val]);
        }
      }
    }
  });

  const headers = ["รายการบัญชี (Account Item)", "ยอดเงิน / รายละเอียด (Amount / Details)"];
  return { headers, rows: rows.length > 0 ? rows : [["สรุปบัญชีการเงิน", cleanStr(markdownText.slice(0, 100))]] };
}

/**
 * Generates and downloads a formatted Excel (.xlsx) file
 */
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  summary?: { totalIncome: number; totalExpense: number; netProfit: number }
) {
  const wb = XLSX.utils.book_new();

  const exportData: (string | number)[][] = [];

  exportData.push(["รายงานสรุปบัญชีและการเงิน (Financial Accounting Report)"]);
  exportData.push([`วันที่ส่งออก: ${new Date().toLocaleDateString("th-TH")}`]);
  exportData.push([]); // Empty line

  if (headers.length > 0) {
    exportData.push(headers);
  }

  rows.forEach((r) => exportData.push(r));

  if (summary) {
    exportData.push([]);
    exportData.push(["--- สรุปยอดรวมทางบัญชี ---"]);
    exportData.push(["รวมรายรับทั้งหมด (Total Income)", summary.totalIncome]);
    exportData.push(["รวมรายจ่ายทั้งหมด (Total Expense)", summary.totalExpense]);
    exportData.push(["กำไรสุทธิ (Net Profit)", summary.netProfit]);
  }

  const ws = XLSX.utils.aoa_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, "Accounting Summary");

  const saveFileName = filename.toLowerCase().endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, saveFileName);
}

/**
 * Export complete AI message content to publication-grade PDF document
 */
export function exportMessageToPDF(messageContent: string, filename: string = "Financial_Accounting_Report.pdf") {
  const cleanStr = (s: string) => s.replace(/\*\*/g, "").replace(/`/g, "").trim();
  const doc = new jsPDF();

  // Document Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("FINANCIAL & ACCOUNTING AI REPORT", 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString("th-TH")} ${new Date().toLocaleTimeString("th-TH")} | Goomairu AI Specialist`, 14, 25);
  doc.setLineWidth(0.5);
  doc.line(14, 28, 196, 28);

  // Extract structured data tables
  const { headers, rows } = extractTableFromMarkdown(messageContent);

  let currentY = 35;

  if (headers.length > 0 && rows.length > 0) {
    const formattedRows = rows.map((r) => r.map((c) => String(c ?? "")));

    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body: formattedRows,
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // @ts-ignore
    currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : currentY + 30;
  }

  // Section Header: Full AI Analysis & Summary
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Detailed Accounting Analysis & Summary:", 14, currentY);
  currentY += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Clean raw AI response text
  const cleanContent = cleanStr(messageContent);
  const textLines = doc.splitTextToSize(cleanContent, 180);

  const pageHeight = doc.internal.pageSize.height;
  for (let i = 0; i < textLines.length; i++) {
    if (currentY > pageHeight - 15) {
      doc.addPage();
      currentY = 20;
    }
    doc.text(textLines[i], 14, currentY);
    currentY += 5;
  }

  const saveFileName = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(saveFileName);
}

/**
 * Export complete AI message content to Excel (.xlsx) workbook
 */
export function exportMessageToExcel(messageContent: string, filename: string = "Financial_Accounting_Report") {
  const cleanStr = (s: string) => s.replace(/\*\*/g, "").replace(/`/g, "").trim();
  const wb = XLSX.utils.book_new();

  const exportData: (string | number)[][] = [];

  // Header Title
  exportData.push(["รายงานสรุปการเงินและบัญชี (Financial Accounting Report - Goomairu AI)"]);
  exportData.push([`วันที่ส่งออก: ${new Date().toLocaleDateString("th-TH")} ${new Date().toLocaleTimeString("th-TH")}`]);
  exportData.push([]); // Empty line

  // Extract structured table
  const { headers, rows } = extractTableFromMarkdown(messageContent);
  if (headers.length > 0 && rows.length > 0) {
    exportData.push(headers);
    rows.forEach((r) => exportData.push(r));
    exportData.push([]);
  }

  // Add Full Text Response Paragraphs
  exportData.push(["--- รายละเอียดบทวิเคราะห์บัญชีเต็มรูปแบบ ---"]);
  const lines = messageContent.split("\n").map(cleanStr).filter((l) => l.length > 0);
  lines.forEach((l) => exportData.push([l]));

  const ws = XLSX.utils.aoa_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, "Financial Report");

  const saveFileName = filename.toLowerCase().endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, saveFileName);
}

export function exportToPDF(
  reportTitle: string,
  headers: string[],
  rows: (string | number)[][],
  summaryText?: string,
  filename: string = "Financial_Report.pdf"
) {
  exportMessageToPDF(summaryText || reportTitle, filename);
}
