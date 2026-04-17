export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message: 'Data fetched successfully',
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}