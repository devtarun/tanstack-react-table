import { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Close,
  FilterAltOff,
  Search,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  CancelOutlined,
} from "@mui/icons-material";
import ArrowDropUpOutlinedIcon from "@mui/icons-material/ArrowDropUpOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
} from "@tanstack/react-table";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { rankItem } from "@tanstack/match-sorter-utils";

import { fetchData } from "../Service";
import { COLUMN_DEFS } from "./ColumnDefs";
import DebouncedInput from "./DebouncedInput";
import ColumnFilter from "./Filter";

const SORT_ICON = {
  asc: <ArrowDropUpOutlinedIcon />,
  desc: <ArrowDropDownOutlinedIcon />,
};

const TableComponent = () => {
  const fetchSize = useRef(10);
  const tableContainerRef = useRef(null);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnPinning, setColumnPinning] = useState({});

  const columns = useMemo(() => [...COLUMN_DEFS], []);

  const { data, fetchNextPage, isFetching, isLoading } = useInfiniteQuery(
    ["users-data", sorting, globalFilter, columnFilters],
    async ({ pageParam = 0 }) => {
      const fetchedData = await fetchData(
        pageParam,
        fetchSize.current,
        sorting,
        globalFilter,
        columnFilters
      );
      return fetchedData;
    },
    {
      getNextPageParam: (_lastGroup, groups) => groups.length,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  //we must flatten the array of arrays from the useInfiniteQuery hook
  const flatData = useMemo(() => {
    return data?.pages?.flatMap((page) => page.items) ?? [];
  }, [data]);

  const totalDBRowCount = data?.pages[0]?.count ?? 0;
  const totalFetched = flatData.length;

  //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = useCallback(
    (el) => {
      if (el) {
        const { scrollHeight, scrollTop, clientHeight } = el;
        //once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
        if (
          scrollHeight - scrollTop - clientHeight < 50 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnOrder,
      columnPinning,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),

    debugTable: true,
  });

  const { rows } = table.getRowModel();

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<FilterAltOff />}
          size="small"
          onClick={(e) => {
            setGlobalFilter("");
            setColumnFilters([]);
            setColumnOrder([]);
            setColumnPinning({});
          }}
        >
          Clear filters
        </Button>
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <Search />
          <DebouncedInput
            className="debounced-input"
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search all columns..."
          />
          {globalFilter && <Close onClick={(e) => setGlobalFilter("")} />}
        </Box>
      </div>
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
        }}
      >
        <TableContainer
          sx={{ maxHeight: 540 }}
          ref={tableContainerRef}
          onScroll={(e) => fetchMoreOnBottomReached(e.target)}
        >
          <Table stickyHeader sx={{ minWidth: 650 }}>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    console.log("header", header);
                    return (
                      <TableCell
                        key={header.id}
                        colSpan={header.colSpan}
                        align="center"
                        sx={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            style={{
                              cursor: header.column.getCanSort()
                                ? "pointer"
                                : "initial",
                              userSelect: "none",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {SORT_ICON[header.column.getIsSorted()] ?? null}
                          </div>
                        )}
                        {!header.column.getCanFilter() ? null : (
                          <Box sx={{ margin: "0 auto" }}>
                            <ColumnFilter
                              column={header.column}
                              table={table}
                            />
                          </Box>
                        )}
                        {!header.isPlaceholder && header.column.getCanPin() && (
                          <div>
                            {console.log("header", header.column.getIsPinned())}
                            {header.column.getIsPinned() !== "left" ? (
                              <IconButton aria-label="delete">
                                <KeyboardDoubleArrowLeft
                                  onClick={() => {
                                    header.column.pin("left");
                                  }}
                                />
                              </IconButton>
                            ) : null}
                            {header.column.getIsPinned() ? (
                              <IconButton aria-label="delete">
                                <CancelOutlined
                                  onClick={() => {
                                    header.column.pin(false);
                                  }}
                                />
                              </IconButton>
                            ) : null}
                            {header.column.getIsPinned() !== "right" ? (
                              <IconButton aria-label="delete">
                                <KeyboardDoubleArrowRight
                                  onClick={() => {
                                    header.column.pin("right");
                                  }}
                                />
                              </IconButton>
                            ) : null}
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {rows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id} align="center">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Typography mt={1}>
        Fetched <strong>{flatData.length}</strong> out of{" "}
        <strong>{totalDBRowCount}</strong> rows.
      </Typography>
    </>
  );
};

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const queryClient = new QueryClient();

const TableWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TableComponent />
    </QueryClientProvider>
  );
};

export default memo(TableWrapper);
