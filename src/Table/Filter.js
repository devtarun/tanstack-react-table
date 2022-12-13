import { useState, useEffect } from "react";
import DebouncedInput from "./DebouncedInput";
const ColumnFilter = ({ column, table }) => {
  const columnFilterValue = column.getFilterValue();

  return (
    <DebouncedInput
      type="text"
      value={columnFilterValue ?? ""}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      list={column.id + "list"}
    />
  );
};

export default ColumnFilter;
