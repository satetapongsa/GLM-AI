import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FileItem } from "@/lib/types";
import { INITIAL_FILES } from "@/lib/config/defaultData";

interface FileState {
  files: FileItem[];
  filterType: FileItem["type"] | "all";
  searchQuery: string;

  // Actions
  setFilterType: (type: FileItem["type"] | "all") => void;
  setSearchQuery: (query: string) => void;
  uploadFile: (file: Omit<FileItem, "id" | "uploadedAt">) => void;
  deleteFile: (id: string) => void;
  clearAllFiles: () => void;
}

export const useFileStore = create<FileState>()(
  persist(
    (set) => ({
      files: INITIAL_FILES,
      filterType: "all",
      searchQuery: "",

      setFilterType: (type) => set({ filterType: type }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      uploadFile: (fileData) => {
        const newFile: FileItem = {
          ...fileData,
          id: `file-${Date.now()}`,
          uploadedAt: new Date().toISOString(),
        };
        set((s) => ({ files: [newFile, ...s.files] }));
      },

      deleteFile: (id) =>
        set((s) => ({
          files: s.files.filter((f) => f.id !== id),
        })),

      clearAllFiles: () => set({ files: [] }),
    }),
    {
      name: "gml-files-storage",
    }
  )
);
