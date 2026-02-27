export interface ApiResponse<T = any> {
  ok: boolean;
  message?: string;
  data?: T;
}
