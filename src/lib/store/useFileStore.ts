import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FileItem } from "@/lib/types";
import { INITIAL_FILES } from "@/lib/config/defaultData";

interface FileState {
  files: FileItem[];
  filterType: FileItem["type"] | "all";
  searchQuery: string;
  isLoading: boolean;

  // Actions
  setFilterType: (type: FileItem["type"] | "all") => void;
  setSearchQuery: (query: string) => void;
  fetchFilesFromDb: (userEmail?: string) => Promise<void>;
  uploadFile: (file: Omit<FileItem, "id" | "uploadedAt">, fileData?: string, userEmail?: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  clearAllFiles: () => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      files: INITIAL_FILES,
      filterType: "all",
      searchQuery: "",
      isLoading: false,

      setFilterType: (type) => set({ filterType: type }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      fetchFilesFromDb: async (userEmail) => {
        set({ isLoading: true });
        try {
          const url = userEmail ? `/api/files?userEmail=${encodeURIComponent(userEmail)}` : "/api/files";
          const res = await fetch(url);
          const data = await res.json();
          if (data.success && Array.isArray(data.files)) {
            set({ files: data.files });
          }
        } catch {
          // fallback to cached store
        } finally {
          set({ isLoading: false });
        }
      },

      uploadFile: async (fileData, rawContent, userEmail) => {
        const fileId = `file-${Date.now()}`;
        const newFile: FileItem = {
          ...fileData,
          id: fileId,
          uploadedAt: new Date().toISOString(),
        };

        // Optimistic local update
        set((s) => ({ files: [newFile, ...s.files] }));

        // Persist to Neon PostgreSQL Database
        try {
          await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: fileId,
              userEmail: userEmail || "guest_user",
              fileName: fileData.name,
              fileType: fileData.type,
              mimeType: fileData.mimeType,
              fileSize: fileData.size,
              fileData: rawContent || null,
              tags: fileData.tags || [],
            }),
          });
        } catch (error) {
          console.error("Failed to sync uploaded file to Neon DB:", error);
        }
      },

      deleteFile: async (id) => {
        // Optimistic local delete
        set((s) => ({
          files: s.files.filter((f) => f.id !== id),
        }));

        // Delete from Neon PostgreSQL Database
        try {
          await fetch(`/api/files?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          });
        } catch (error) {
          console.error("Failed to delete file from Neon DB:", error);
        }
      },

      clearAllFiles: () => set({ files: [] }),
    }),
    {
      name: "gml-files-storage",
    }
  )
);
