import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00f0ff", // Spider Blue
      contrastText: "#0a0a0a",
    },
    secondary: {
      main: "#ff0055", // Spider Red
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#0a0a0a",
      secondary: "#0a0a0a",
    },
  },
  typography: {
    fontFamily: '"M PLUS Rounded 1c", "Space Grotesk", sans-serif',
    h1: { fontFamily: '"Bangers", "Russo One", sans-serif', textShadow: "4px 4px 0px #00f0ff" },
    h2: { fontFamily: '"Bangers", "Russo One", sans-serif', textShadow: "3px 3px 0px #00f0ff" },
    h3: { fontFamily: '"Bangers", "Russo One", sans-serif', textShadow: "3px 3px 0px #00f0ff" },
    h4: { fontFamily: '"Bangers", "Russo One", sans-serif', textShadow: "2px 2px 0px #00f0ff" },
    h5: { fontFamily: '"Bangers", "Russo One", sans-serif', textShadow: "2px 2px 0px #00f0ff" },
    h6: { fontFamily: '"Bangers", "Russo One", sans-serif', textShadow: "2px 2px 0px #00f0ff" },
    button: {
      fontFamily: '"Permanent Marker", "Russo One", sans-serif',
      letterSpacing: "1px",
      fontSize: "1.2rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "3px solid #0a0a0a",
          boxShadow: "5px 5px 0px #0a0a0a",
          textTransform: "uppercase",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translate(-2px, -2px)",
            boxShadow: "7px 7px 0px #0a0a0a",
          },
          "&:active": {
            transform: "translate(2px, 2px)",
            boxShadow: "2px 2px 0px #0a0a0a",
          },
        },
        containedPrimary: {
          backgroundColor: "#00f0ff",
          "&:hover": {
            backgroundColor: "#00dbe8",
          },
        },
        containedSecondary: {
          backgroundColor: "#ff0055",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#e6004c",
          },
        },
        outlined: {
          borderWidth: "3px",
          borderColor: "#0a0a0a",
          "&:hover": {
            borderWidth: "3px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "3px solid #0a0a0a",
          boxShadow: "8px 8px 0px #0a0a0a",
          overflow: "visible",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: "3px solid #0a0a0a",
          boxShadow: "5px 5px 0px #0a0a0a",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: "3px",
            borderColor: "#0a0a0a",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00f0ff",
            borderWidth: "3px",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ff0055",
            borderWidth: "3px",
            boxShadow: "4px 4px 0px #0a0a0a",
          },
          "& input": {
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 700,
            textTransform: "uppercase",
          },
          "& .MuiSelect-select": {
             fontFamily: '"Space Grotesk", sans-serif',
             fontWeight: 700,
             textTransform: "uppercase",
          }
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: '"Bangers", sans-serif',
          letterSpacing: "1px",
          color: "#0a0a0a",
          fontSize: "1.1rem",
          "&.Mui-focused": {
            color: "#ff0055",
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          textTransform: "uppercase",
          "&:hover": {
            backgroundColor: "#fcee0a",
            color: "#000",
          },
          "&.Mui-selected": {
            backgroundColor: "#00f0ff !important",
            color: "#000",
            borderLeft: "4px solid #000",
          },
        },
      },
    },
  },
});

export default theme;
