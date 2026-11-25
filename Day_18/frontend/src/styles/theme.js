
import { createTheme } from "@mui/material/styles";

export const getAppTheme = (mode) => {
  const dark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#9875ff",
        light: "#b69dff",
        dark: "#8055f6"
      },
      secondary: {
        main: "#f47bbd"
      },
      success: {
        main: "#39c995"
      },
      warning: {
        main: "#ffbd69"
      },
      error: {
        main: "#ff7185"
      },
      background: {
        default: dark ? "#100d1c" : "#f7f5fc",
        paper: dark ? "#191529" : "#ffffff"
      },
      text: {
        primary: dark ? "#f5f1ff" : "#211a32",
        secondary: dark ? "#a9a2bb" : "#756d86"
      },
      divider: dark
        ? "rgba(255,255,255,0.08)"
        : "rgba(53,35,90,0.10)"
    },

    typography: {
      fontFamily: '"DM Sans", sans-serif',
      h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
      h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
      h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
      h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700 },
      h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 700 }
    },

    shape: {
      borderRadius: 14
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 18px",
            boxShadow: "none"
          },
          containedPrimary: {
            background: "linear-gradient(135deg, #9875ff, #8055f6)",
            "&:hover": {
              background: "linear-gradient(135deg, #a88aff, #8c65ff)",
              boxShadow: "0 8px 24px rgba(152,117,255,0.25)"
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            border: dark
              ? "1px solid rgba(255,255,255,0.07)"
              : "1px solid rgba(53,35,90,0.08)",
            boxShadow: "none"
          }
        }
      }
    }
  });
};
