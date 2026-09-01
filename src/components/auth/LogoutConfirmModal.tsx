"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { LogOut } from "lucide-react";

export function LogoutConfirmModal() {
  const { user, isLogoutConfirmOpen, closeLogoutConfirm, logout } = useAuthStore();

  return (
    <Modal
      isOpen={isLogoutConfirmOpen}
      onClose={closeLogoutConfirm}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5 text-amber-400">
          <LogOut className="h-5 w-5" />
          <span className="text-base font-bold text-white">ยืนยันการออกจากระบบ?</span>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-[#131314] border border-amber-500/20 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p className="font-semibold text-amber-400 mb-1">⚠️ แจ้งเตือนการออกจากระบบ:</p>
          คุณต้องการออกจากระบบบัญชี{" "}
          <strong className="text-white font-bold">{user?.name || user?.email || "ของคุณ"}</strong>{" "}
          หรือไม่? ข้อมูลประวัติการสนทนาในเครื่องนี้จะยังคงอยู่ และสามารถเข้าสู่ระบบกลับมาใหม่ได้ตลอดเวลา
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeLogoutConfirm}
            className="px-4 py-2 text-xs cursor-pointer"
          >
            ยกเลิก
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={() => {
              logout();
              closeLogoutConfirm();
            }}
            leftIcon={<LogOut className="h-4 w-4" />}
            className="bg-red-600 hover:bg-red-700 text-white border-transparent px-4 py-2 text-xs font-semibold shadow-md cursor-pointer active:scale-95"
          >
            ยืนยันออกจากระบบ
          </Button>
        </div>
      </div>
    </Modal>
  );
}
