export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "guest" | "user" | "admin";
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  title: string;
  content: string;
  score: number;
  dataset?: string;
  url?: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  question: string;
  answer: string;
  sources: Source[];
  sessionId?: string;
  tokensUsed?: number;
  processingTime?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  _id: string;
  userId: string;
  conversationId: Conversation;
  note?: string;
  createdAt: string;
}

export interface Dataset {
  _id: string;
  name: string;
  description?: string;
  type: string;
  fileSize?: number;
  documentCount?: number;
  status: "pending" | "processing" | "indexed" | "error";
  errorMessage?: string;
  uploadedBy: { fullName: string; email: string };
  indexedAt?: string;
  createdAt: string;
}

export interface AskResult {
  conversationId: string;
  question: string;
  answer: string;
  sources: Source[];
  processingTime?: number;
  tokensUsed?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
