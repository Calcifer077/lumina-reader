export type Book = {
  id: string;
  title: string;
  author: string | null;
  format: "pdf" | "epub";
  idFromStorage: string;
  filePath: string;
  coverUrl: string | null;
  fileSize: number | null;
  totalPages: number | null;
  uploadedAt: Date | null;
  lastOpenedAt: Date | null;
};

export type BookFromApi = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  format: string;
  progress: number;
  fileSize: number;
  totalPages: number;
  uploadedAt: string;
  lastOpenedAt: string | null;
};

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
