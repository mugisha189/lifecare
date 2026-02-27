/**
 * Pagination utility types and functions
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Calculate pagination metadata
 * @param total Total number of items
 * @param page Current page number
 * @param limit Items per page
 * @returns Pagination metadata
 */
export function calculatePagination(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Calculate skip value for database queries
 * @param page Current page number
 * @param limit Items per page
 * @returns Number of items to skip
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Normalize pagination parameters with defaults
 * @param params Pagination parameters
 * @param defaultLimit Default limit if not provided
 * @returns Normalized pagination parameters
 */
export function normalizePagination(params: PaginationParams, defaultLimit = 10): Required<PaginationParams> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || defaultLimit)); // Cap at 100

  return { page, limit };
}
