export const COLUMN_DEFS = [
  {
    header: "#",
    columns: [{ header: "ID", accessorKey: "id" }],
  },
  {
    header: "Name",
    columns: [
      {
        accessorKey: "firstname",
        header: "First Name",
      },
      {
        accessorKey: "lastname",
        header: "Last Name",
      },
    ],
  },
  {
    header: "Info",
    columns: [
      {
        accessorKey: "address",
        header: "Address",
      },
      {
        accessorKey: "state",
        header: "State",
      },
      {
        accessorKey: "phone",
        header: "Phone",
      },
    ],
  },
];
