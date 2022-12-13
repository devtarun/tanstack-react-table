const BASE_URL = `https://6396e71c77359127a025f847.mockapi.io/dw/users`;

export const fetchData = async (
  start = 1,
  size = 10,
  sorting = [],
  globalFilter,
  columnFilters = []
) => {
  const searchParams = new URLSearchParams();
  searchParams.append("page", start);
  searchParams.append("limit", size);
  if (sorting.length > 0) {
    const sort = sorting[0] || {};
    const { id, desc } = sort;
    searchParams.append("sortBy", id);
    searchParams.append("order", desc ? "desc" : "asc");
  }
  if (globalFilter) {
    searchParams.append("search", globalFilter);
  }
  if (columnFilters.length > 0) {
    for (const filter of columnFilters) {
      searchParams.append(filter.id, filter.value);
    }
  }
  const response = await fetch(`${BASE_URL}?${searchParams.toString()}`);
  const data = await response.json();
  return data;
};
