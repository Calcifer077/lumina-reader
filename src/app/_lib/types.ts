export interface Book {
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
}
