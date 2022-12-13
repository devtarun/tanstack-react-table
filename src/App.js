import { useMemo, useState } from "react";
import "./styles.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Fab from "@mui/material/Fab";
import Brightness4Icon from "@mui/icons-material/Brightness4";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import TableWrapper from "./Table/Table";

export default function App() {
  const [mode, setMode] = useState("light");

  const theme = createTheme({
    palette: {
      mode
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DiscoverWeb
          </Typography>
        </Toolbar>
      </AppBar>
      <Box>
        <TableWrapper />
      </Box>
      <Fab
        color="primary"
        id="theme-switcher"
        aria-label="add"
        size="medium"
        onClick={(e) =>
          setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
        }
      >
        <Brightness4Icon />
      </Fab>
    </ThemeProvider>
  );
}
