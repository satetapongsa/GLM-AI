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

  // Search for income / expense column indices
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
      // Find first numeric column
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
 * Generates and downloads a clean formatted Excel (.xlsx) file
 */
export function exportToExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
  summary?: { totalIncome: number; totalExpense: number; netProfit: number }
) {
  const wb = XLSX.utils.book_new();

  const exportData: (string | number)[][] = [];

  // Add Title & Header
  exportData.push(["รายงานสรุปบัญชีและการเงิน (Financial Accounting Report)"]);
  exportData.push([`วันที่ส่งออก: ${new Date().toLocaleDateString("th-TH")}`]);
  exportData.push([]); // Empty line

  // Add Headers
  if (headers.length > 0) {
    exportData.push(headers);
  }

  // Add Rows
  rows.forEach((r) => exportData.push(r));

  // Add Summary lines
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
 * Generates and downloads a PDF Financial Report using jsPDF & autoTable
 */
export function exportToPDF(
  reportTitle: string,
  headers: string[],
  rows: (string | number)[][],
  summaryText?: string,
  filename: string = "Financial_Report.pdf"
) {
  const doc = new jsPDF();

  // Header Title
  doc.setFontSize(18);
  doc.text(reportTitle || "Financial & Accounting Report", 14, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString("th-TH")} | Goomairu AI Accounting`, 14, 28);
  doc.line(14, 32, 196, 32);

  // Table
  if (headers.length > 0 && rows.length > 0) {
    const formattedRows = rows.map((r) => r.map((c) => String(c ?? "")));

    autoTable(doc, {
      startY: 38,
      head: [headers],
      body: formattedRows,
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
    });
  }

  // Add summary text at bottom
  if (summaryText) {
    // @ts-ignore
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 45;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Financial Summary:", 14, finalY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const splitText = doc.splitTextToSize(summaryText, 180);
    doc.text(splitText, 14, finalY + 7);
  }

  const saveFileName = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  doc.save(saveFileName);
}
