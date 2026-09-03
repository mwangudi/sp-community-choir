/** Shared dark surface for the admin chrome — the choir's cardinal and gold. */
export const ADMIN_SURFACE = {
  bg: "#4A0713",
  headerBg: "#38050E",
  text: "rgba(255,255,255,0.72)",
  activeText: "#FFFFFF",
  activeBg: "rgba(255,255,255,0.12)",
  hoverBg: "rgba(255,255,255,0.07)",
  accent: "#FDB321",
  divider: "rgba(255,255,255,0.12)",
} as const;

/** Dark header row shared by the admin data tables. */
export const TABLE_HEAD_SX = {
  "& th": {
    bgcolor: ADMIN_SURFACE.bg,
    color: "#fff",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    fontSize: 12,
    whiteSpace: "nowrap",
    borderBottom: 0,
  },
  // Sort labels carry their own colour, so force them light.
  "& .MuiTableSortLabel-root, & .MuiTableSortLabel-root:hover, & .MuiTableSortLabel-root.Mui-active":
    { color: "#fff" },
  "& .MuiTableSortLabel-icon": { color: `${ADMIN_SURFACE.accent} !important` },
} as const;

/** Zebra striping and roomier rows for the admin data tables. */
export const TABLE_BODY_SX = {
  "& tr:nth-of-type(even)": { bgcolor: "action.hover" },
  "& td": { borderBottom: "none", py: 1.5 },
} as const;
