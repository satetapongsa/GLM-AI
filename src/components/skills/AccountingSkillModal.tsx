"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileSpreadsheet, Upload, FileText, Download, Check, AlertCircle, Sparkles } from "lucide-react";
import { parseFinancialFile, exportToExcel, exportToPDF, ParsedFinancialData } from "@/lib/utils/accountingExporter";
import { useChatStore } from "@/lib/store/useChatStore";
import { useUIStore } from "@/lib/store/useUIStore";

interface AccountingSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountingSkillModal({ isOpen, onClose }: AccountingSkillModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFinancialData | null>(null);
  const [instruction, setInstruction] = useState("สรุปรายรับ-รายจ่าย คำนวณกำไรสุทธิ และทำรายงานบัญชีการเงิน");
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | "both">("both");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createNewConversation, sendMessage } = useChatStore();
  const { setActiveTab } = useUIStore();

  const handleFileChange = async (selectedFile: File) => {
    setErrorMsg("");
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const parsed = await parseFinancialFile(selectedFile);
      setParsedData(parsed);
    } catch (err: any) {
      console.error("Error parsing file:", err);
      setErrorMsg("ไม่สามารถอ่านไฟล์ได้ กรุณาตรวจสอบว่าเป็นไฟล์ Excel (.xlsx, .xls), CSV หรือ TXT ที่ถูกต้อง");
      setParsedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleStartAccountingAnalysis = async () => {
    if (!file && !instruction.trim()) return;

    let fileContext = "";
    if (parsedData) {
      const sampleRows = parsedData.tableRows.slice(0, 30).map((r) => r.join(" | ")).join("\n");
      fileContext = `
ข้อมูลในไฟล์ ${parsedData.fileName}:
- หัวข้อตาราง: ${parsedData.tableHeaders.join(" | ")}
- ยอดรวมคำนวณเบื้องต้น: รายรับประมาณ ${parsedData.summary.totalIncome.toLocaleString()} บาท | รายจ่ายประมาณ ${parsedData.summary.totalExpense.toLocaleString()} บาท | กำไรสุทธิประมาณ ${parsedData.summary.netProfit.toLocaleString()} บาท
- ข้อมูลรายการบัญชี (ตัวอย่าง 30 รายการแรก):
${sampleRows}
`;
    }

    const promptMessage = `คำร้องขอทำบัญชีและสร้างรายงานการเงิน (คำสั่งรูปแบบออกไฟล์: ${exportFormat.toUpperCase()})

ความต้องการ: ${instruction.trim() || "คำนวณงบบัญชี รายรับ-รายจ่าย กำไรสุทธิ และจัดทำรายงานการเงิน"}
${fileContext}

รบกวนวิเคราะห์บัญชีอย่างละเอียด คำนวณยอดรวมรายรับ รายจ่าย กำไรสุทธิ ตารางสรุปงบ และแนะนำทางบัญชีอย่างเป็นระเบียบครับ!`;

    // Create a new conversation pre-configured for Accounting
    createNewConversation(`บัญชีการเงิน - ${file ? file.name : "วิเคราะห์บัญชี"}`, "gemini-3.1-flash-lite");

    // Automatically trigger PDF / Excel export if data exists
    if (parsedData) {
      if (exportFormat === "excel" || exportFormat === "both") {
        setTimeout(() => {
          exportToExcel(`Financial_Report_${Date.now()}`, parsedData.tableHeaders, parsedData.tableRows, parsedData.summary);
        }, 500);
      }
      if (exportFormat === "pdf" || exportFormat === "both") {
        setTimeout(() => {
          exportToPDF(
            `รายงานบัญชีการเงิน: ${parsedData.fileName}`,
            parsedData.tableHeaders,
            parsedData.tableRows,
            `ยอดรวมรายรับ: ${parsedData.summary.totalIncome.toLocaleString()} บาท\nยอดรวมรายจ่าย: ${parsedData.summary.totalExpense.toLocaleString()} บาท\nกำไรสุทธิ: ${parsedData.summary.netProfit.toLocaleString()} บาท`,
            `Financial_Report_${Date.now()}.pdf`
          );
        }, 1000);
      }
    }

    onClose();
    setActiveTab("chat");

    setTimeout(() => {
      sendMessage(promptMessage);
    }, 200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="lg">
      <div className="flex flex-col gap-4 p-1 -mt-3">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>สกิลผู้ช่วยบัญชีและทำรายงานการเงิน</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PDF & Excel
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              โยนไฟล์ Excel (.xlsx, .xls), CSV หรือ TXT ลงไปเพื่อคำนวณบัญชี สรุปกำไรสุทธิ และส่งออกรายงานเป็น PDF หรือ Excel
            </p>
          </div>
        </div>

        {/* Drag & Drop File Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>แนบไฟล์บัญชี (.xlsx, .xls, .csv, .txt)</span>
            <span className="text-slate-400 font-normal text-[11px]">รองรับ Excel & Text</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
            accept=".xlsx,.xls,.csv,.txt"
            className="hidden"
          />

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-900/60 hover:bg-slate-900 group"
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-xs">{file.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB • {parsedData ? `${parsedData.tableRows.length} รายการ` : "กำลังอ่านข้อมูล..."}
                  </p>
                </div>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  เปลี่ยนไฟล์
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Upload className="h-7 w-7 text-emerald-400 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-200">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-[11px] text-slate-400">
                  รองรับไฟล์ Excel (.xlsx, .xls), CSV หรือ TXT บัญชีรายรับ-รายจ่าย
                </p>
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}
        </div>

        {/* Export Format Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            รูปแบบไฟล์รายงานที่ต้องการออกให้
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setExportFormat("pdf")}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                exportFormat === "pdf"
                  ? "bg-rose-500/20 text-rose-200 border-rose-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>ไฟล์ PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat("excel")}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                exportFormat === "excel"
                  ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>ไฟล์ Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={() => setExportFormat("both")}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                exportFormat === "both"
                  ? "bg-sky-500/20 text-sky-200 border-sky-500/50"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>ทั้ง PDF & Excel</span>
            </button>
          </div>
        </div>

        {/* Input 3: Custom Financial Instruction */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            คำสั่งและคำแนะนำการทำบัญชีเพิ่มเติม
          </label>
          <textarea
            rows={2}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="เช่น สรุปแยกหมวดหมู่รายจ่าย คำนวณภาษีมูลค่าเพิ่ม หรือสรุปงบกำไรขาดทุนประจำเดือน..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose} type="button">
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            disabled={isProcessing || (!file && !instruction.trim())}
            onClick={handleStartAccountingAnalysis}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-xl border border-emerald-400/40 cursor-pointer disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-2" />
            <span>คำนวณบัญชี & ออกไฟล์รายงาน</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
