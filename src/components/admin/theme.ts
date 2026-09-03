"use client";

import { createTheme } from "@mui/material/styles";

/**
 * Ported from the Materio MUI Next.js admin template (MIT) —
 * https://github.com/themeselection/materio-mui-nextjs-admin-template-free
 *
 * Its spacing unit, 6px radius, shadow scale, typography ramp and neutral
 * palette are kept as-is; only the brand colours are the choir's.
 */

// Materio derives every neutral from one channel triplet.
const MAIN = "46 38 61";
const SHADOW = `rgb(${MAIN} / 0.2)`;

const CARDINAL = "#BC0424";
const AMBER = "#FDB321";

export const adminTheme = createTheme({
  cssVariables: true,

  spacing: (factor: number) => `${0.25 * factor}rem`,

  shape: { borderRadius: 6 },

  palette: {
    primary: { main: CARDINAL, light: "#D93A55", dark: "#A6031F", contrastText: "#fff" },
    secondary: { main: AMBER, light: "#FFC652", dark: "#B87809", contrastText: "#2E263D" },
    error: { main: "#FF4C51", light: "#FF7074", dark: "#E64449", contrastText: "#fff" },
    warning: { main: "#FFB400", light: "#FFC333", dark: "#E6A200", contrastText: "#fff" },
    info: { main: "#16B1FF", light: "#45C1FF", dark: "#149FE6", contrastText: "#fff" },
    success: { main: "#56CA00", light: "#78D533", dark: "#4DB600", contrastText: "#fff" },
    text: {
      primary: `rgb(${MAIN} / 0.9)`,
      secondary: `rgb(${MAIN} / 0.7)`,
      disabled: `rgb(${MAIN} / 0.4)`,
    },
    divider: `rgb(${MAIN} / 0.12)`,
    background: { default: "#F4F5FA", paper: "#FFFFFF" },
    action: {
      active: `rgb(${MAIN} / 0.6)`,
      hover: `rgb(${MAIN} / 0.04)`,
      selected: `rgb(${MAIN} / 0.08)`,
      disabled: `rgb(${MAIN} / 0.3)`,
      disabledBackground: `rgb(${MAIN} / 0.12)`,
      focus: `rgb(${MAIN} / 0.12)`,
    },
  },

  typography: {
    fontFamily: "var(--font-sans), Inter, sans-serif",
    fontSize: 13.125,
    h1: { fontSize: "2.875rem", fontWeight: 500, lineHeight: 1.478261 },
    h2: { fontSize: "2.375rem", fontWeight: 500, lineHeight: 1.47368421 },
    h3: { fontSize: "1.75rem", fontWeight: 500, lineHeight: 1.5 },
    h4: { fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.58334 },
    h5: { fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.5556 },
    h6: { fontSize: "0.9375rem", fontWeight: 500, lineHeight: 1.46667 },
    subtitle1: { fontSize: "0.9375rem", lineHeight: 1.46667 },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 400, lineHeight: 1.53846154 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.46667 },
    body2: { fontSize: "0.8125rem", lineHeight: 1.53846154 },
    button: { fontSize: "0.9375rem", lineHeight: 1.46667, textTransform: "none" },
    caption: { fontSize: "0.8125rem", lineHeight: 1.38462, letterSpacing: "0.4px" },
    overline: { fontSize: "0.75rem", lineHeight: 1.16667, letterSpacing: "0.8px" },
  },

  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          boxShadow: `0px 4px 10px ${SHADOW}`,
          backgroundImage: "none",
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          "& + .MuiCardContent-root, & + .MuiCardActions-root": {
            paddingBlockStart: 0,
          },
        }),
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(5),
          color: "var(--mui-palette-text-secondary)",
          "&:last-child": { paddingBlockEnd: theme.spacing(5) },
          "& + .MuiCardHeader-root, & + .MuiCardContent-root, & + .MuiCardActions-root": {
            paddingBlockStart: 0,
          },
        }),
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: ({ theme }) => ({ padding: theme.spacing(5) }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          padding: theme.spacing(2, 5),
          fontWeight: 500,
        }),
        contained: { boxShadow: `0px 2px 4px ${SHADOW}` },
        outlined: {
          borderWidth: 1.5,
          "&:hover": { borderWidth: 1.5 },
          // Used for Cancel / secondary actions.
          "&.MuiButton-outlinedInherit": {
            borderColor: `rgb(${MAIN} / 0.24)`,
            color: `rgb(${MAIN} / 0.75)`,
            "&:hover": {
              borderColor: `rgb(${MAIN} / 0.4)`,
              backgroundColor: `rgb(${MAIN} / 0.04)`,
            },
          },
        },
        sizeSmall: ({ theme }) => ({ padding: theme.spacing(1.5, 3.5) }),
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 500 },
        sizeSmall: { fontSize: "0.75rem" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 500,
          fontSize: "0.8125rem",
          letterSpacing: "0.4px",
          textTransform: "uppercase",
          color: `rgb(${MAIN} / 0.7)`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 4, fontSize: "0.8125rem" },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { boxShadow: `0px 4px 10px ${SHADOW}`, borderRadius: 6 },
      },
    },
    MuiAvatar: { styleOverrides: { root: { fontSize: "0.9375rem" } } },
  },
});
