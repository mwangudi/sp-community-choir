"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Collapse,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  CircleUser,
  ExternalLink,
  Image as ImageIcon,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Music2,
  NotebookPen,
  Search,
  Settings,
  Ticket,
  UserPlus,
  Users,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { ADMIN_SURFACE } from "@/components/admin/surface";

const WIDTH = 260;
const MINI_WIDTH = 76;
const STORAGE_KEY = "choir-admin-sidebar";

const NAVY = ADMIN_SURFACE;

// Materio's 24px layout padding. Its 1440px content cap is not used: on a
// wide screen it left a dead channel between the sidebar and the tables.
const LAYOUT_PADDING = 24;

type Leaf = { href: string; label: string; icon: React.ElementType; minRole?: Role };
type Group = {
  key: string;
  label: string;
  icon: React.ElementType;
  items: Leaf[];
};
type Entry = Leaf | Group;

const NAV: Entry[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    key: "music",
    label: "Music",
    icon: Music2,
    items: [
      { href: "/admin/songs", label: "Repertoire", icon: Music2 },
      { href: "/admin/proposals", label: "Song proposals", icon: Inbox },
      { href: "/admin/mass-plans", label: "Mass plans", icon: CalendarDays },
    ],
  },
  {
    key: "content",
    label: "Content",
    icon: NotebookPen,
    items: [
      { href: "/admin/blog", label: "Blog", icon: NotebookPen },
      { href: "/admin/concerts", label: "Concerts", icon: Ticket },
      { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
      { href: "/admin/hero-slides", label: "Homepage hero", icon: Images, minRole: "ADMIN" },
      { href: "/admin/login-slides", label: "Login carousel", icon: Images, minRole: "ADMIN" },
    ],
  },
  {
    key: "people",
    label: "People",
    icon: Users,
    items: [
      { href: "/admin/members", label: "Members", icon: Users },
      { href: "/admin/applications", label: "Applications", icon: UserPlus },
      { href: "/admin/users", label: "Users & roles", icon: CircleUser, minRole: "ADMIN" },
    ],
  },
  { href: "/admin/settings", label: "Site settings", icon: Settings, minRole: "ADMIN" },
];

function isGroup(entry: Entry): entry is Group {
  return "items" in entry;
}

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: Role };
}) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);
  const [flyout, setFlyout] = useState<{ el: HTMLElement; group: Group } | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(
    () =>
      NAV.map((entry) =>
        isGroup(entry)
          ? {
              ...entry,
              items: entry.items.filter(
                (i) => !i.minRole || user.role === "ADMIN" || i.minRole === user.role,
              ),
            }
          : entry,
      ).filter((entry) => !isGroup(entry) || entry.items.length > 0),
    [user.role],
  );

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const groupHasActive = (group: Group) => group.items.some((i) => isActive(i.href));

  // Everything the navbar search can jump to.
  const destinations = useMemo(
    () =>
      visible.flatMap((entry) =>
        isGroup(entry)
          ? entry.items.map((item) => ({ ...item, group: entry.label }))
          : [{ ...entry, group: "" }],
      ),
    [visible],
  );

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? destinations.filter((d) => `${d.group} ${d.label}`.toLowerCase().includes(needle))
    : destinations;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "collapsed");
  }, []);

  // Keep the group containing the current page open.
  useEffect(() => {
    setPaletteOpen(false);
    setQuery("");
    setOpen((prev) => {
      const next = { ...prev };
      for (const entry of NAV) {
        if (isGroup(entry) && entry.items.some((i) => isActive(i.href))) {
          next[entry.key] = true;
        }
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "collapsed" : "expanded");
      return next;
    });
  };

  const mini = isDesktop && collapsed;
  const drawerWidth = mini ? MINI_WIDTH : WIDTH;

  const activeSx = {
    color: NAVY.activeText,
    backgroundColor: NAVY.activeBg,
    borderLeftColor: NAVY.accent,
    "&:hover": { backgroundColor: NAVY.activeBg },
    "& .MuiListItemIcon-root": { color: NAVY.accent },
  };

  const openGroupSx = {
    backgroundColor: NAVY.hoverBg,
    color: NAVY.activeText,
  };

  const itemSx = {
    mt: 0.5,
    py: 2,
    pl: 5,
    pr: 3.5,
    color: NAVY.text,
    borderLeft: "3px solid transparent",
    "&:hover": { backgroundColor: NAVY.hoverBg, color: NAVY.activeText },
  };

  const miniItemSx = {
    mt: 0.5,
    mx: 2,
    py: 2,
    px: 3,
    borderRadius: 1,
    justifyContent: "center",
    color: NAVY.text,
    borderLeft: "3px solid transparent",
    "&:hover": { backgroundColor: NAVY.hoverBg, color: NAVY.activeText },
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: NAVY.bg,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          p: "15px",
          pl: mini ? "15px" : "20px",
          justifyContent: mini ? "center" : "flex-start",
          bgcolor: NAVY.headerBg,
          borderBottom: `1px solid ${NAVY.divider}`,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Music2 size={17} />
        </Box>
        {!mini && (
          <>
            <Box sx={{ lineHeight: 1.1, minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "1.375rem",
                  color: NAVY.activeText,
                  letterSpacing: "0.15px",
                }}
                noWrap
              >
                Choir Admin
              </Typography>
            </Box>
            {isDesktop && (
              <Tooltip title="Collapse menu">
                <IconButton
                  size="small"
                  onClick={toggleCollapsed}
                  aria-label="Toggle menu width"
                  sx={{ color: NAVY.text }}
                >
                  <CircleDot size={18} />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 3 }}>
        <List disablePadding>
          {visible.map((entry) => {
            if (!isGroup(entry)) {
              const Icon = entry.icon;
              const active = isActive(entry.href);
              return (
                <Tooltip key={entry.href} title={mini ? entry.label : ""} placement="right">
                  <ListItemButton
                    component={Link}
                    href={entry.href}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      ...(mini ? miniItemSx : itemSx),
                      ...(active ? activeSx : {}),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: mini ? 0 : 2,
                        fontSize: "1.375rem",
                        color: "inherit",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} />
                    </ListItemIcon>
                    {!mini && (
                      <ListItemText
                        primary={entry.label}
                        slotProps={{ primary: { sx: { fontSize: "0.9375rem", fontWeight: 500 } } }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              );
            }

            const Icon = entry.icon;
            const hasActive = groupHasActive(entry);
            const expanded = !!open[entry.key];

            return (
              <Box key={entry.key}>
                <Tooltip title={mini ? entry.label : ""} placement="right">
                  <ListItemButton
                    onClick={(e) => {
                      if (mini) setFlyout({ el: e.currentTarget, group: entry });
                      else setOpen((p) => ({ ...p, [entry.key]: !p[entry.key] }));
                    }}
                    sx={{
                      ...(mini ? miniItemSx : itemSx),
                      ...(hasActive && mini ? activeSx : {}),
                      ...(!mini && (expanded || hasActive) ? openGroupSx : {}),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: mini ? 0 : 2,
                        fontSize: "1.375rem",
                        color: "inherit",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} />
                    </ListItemIcon>
                    {!mini && (
                      <>
                        <ListItemText
                          primary={entry.label}
                          slotProps={{
                            primary: { sx: { fontSize: "0.9375rem", fontWeight: 500 } },
                          }}
                        />
                        <ChevronDown
                          size={22}
                          style={{
                            transition: "transform 200ms",
                            transform: expanded ? "rotate(180deg)" : "none",
                            marginInlineStart: 8,
                          }}
                        />
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {!mini && (
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {entry.items.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <ListItemButton
                            key={item.href}
                            component={Link}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            sx={{
                              ...itemSx,
                              ...(active ? activeSx : {}),
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 0,
                                ml: 1.5,
                                mr: 3.5,
                                fontSize: "0.75rem",
                                color: active ? NAVY.accent : "inherit",
                                opacity: active ? 1 : 0.6,
                              }}
                            >
                              <Circle size={12} fill="currentColor" />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.label}
                              slotProps={{
                                primary: { sx: { fontSize: "0.9375rem", fontWeight: 500 } },
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      <Box
        sx={{
          p: mini ? 2 : 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
        }}
      >
        {mini ? (
          isDesktop && (
            <Tooltip title="Expand menu" placement="right">
              <IconButton
                size="small"
                onClick={toggleCollapsed}
                aria-label="Toggle menu width"
                sx={{ color: NAVY.text }}
              >
                <ChevronRight size={18} />
              </IconButton>
            </Tooltip>
          )
        ) : (
          <Stack
            direction="row"
            sx={{ width: "100%", alignItems: "center", justifyContent: "space-between" }}
          >
            <Typography
              component={Link}
              href="/"
              variant="caption"
              sx={{
                color: NAVY.text,
                textDecoration: "none",
                "&:hover": { color: NAVY.accent },
              }}
            >
              ← Back to the website
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.25,
                borderRadius: 0.75,
                bgcolor: NAVY.accent,
                color: NAVY.headerBg,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              CHOIR
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isDesktop ? drawerWidth : 0,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isDesktop ? drawerWidth : WIDTH,
            boxSizing: "border-box",
            overflowX: "hidden",
            borderRight: 0,
            bgcolor: NAVY.bg,
            color: NAVY.text,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.shorter,
            }),
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Submenu flyout when the rail is collapsed */}
      <Menu
        anchorEl={flyout?.el ?? null}
        open={!!flyout}
        onClose={() => setFlyout(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { minWidth: 200, ml: 1 } } }}
      >
        {flyout?.group.items.map((item) => (
          <MenuItem
            key={item.href}
            component={Link}
            href={item.href}
            selected={isActive(item.href)}
            onClick={() => setFlyout(null)}
            sx={{ fontSize: 14 }}
          >
            <ListItemIcon>
              <item.icon size={16} />
            </ListItemIcon>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Materio's navbar: static, detached and transparent over the page. */}
        <Box
          component="header"
          className="no-print"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            flexShrink: 0,
            minHeight: 64,
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
              py: "10px",
              px: `${LAYOUT_PADDING}px`,
            }}
          >
            <IconButton
              edge="start"
              onClick={() => (isDesktop ? toggleCollapsed() : setMobileOpen(true))}
              aria-label="Toggle menu"
            >
              <MenuIcon size={22} />
            </IconButton>

            <Box
              role="button"
              tabIndex={0}
              onClick={() => setPaletteOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setPaletteOpen(true);
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                cursor: "pointer",
                color: "text.disabled",
                "&:hover": { color: "text.secondary" },
              }}
            >
              <Search size={22} />
              <Typography
                variant="body2"
                sx={{ color: "inherit", display: { xs: "none", sm: "block" } }}
              >
                Search
              </Typography>
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  px: 1.5,
                  fontSize: "0.75rem",
                  lineHeight: 1.6,
                  color: "text.disabled",
                }}
              >
                ⌘K
              </Box>
            </Box>

            <Box sx={{ flex: 1 }} />

            <Tooltip title="View the public website">
              <IconButton component={Link} href="/" target="_blank">
                <ExternalLink size={22} />
              </IconButton>
            </Tooltip>

            <IconButton onClick={(e) => setAccountAnchor(e.currentTarget)} size="small">
              <Avatar sx={{ width: 38, height: 38, bgcolor: "primary.main" }}>
                {user.name.slice(0, 1).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={accountAnchor}
              open={!!accountAnchor}
              onClose={() => setAccountAnchor(null)}
            >
              <MenuItem disabled sx={{ opacity: "1 !important" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email} · {user.role}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem component={Link} href="/">
                Back to the website
              </MenuItem>
              <MenuItem component="a" href="/api/admin/logout">
                <ListItemIcon>
                  <LogOut size={16} />
                </ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        <Dialog
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          fullWidth
          maxWidth="sm"
          slotProps={{
            paper: { sx: { alignSelf: "flex-start", mt: "10vh" } },
            transition: { onEntered: () => searchRef.current?.focus() },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, px: 5, py: 4 }}>
            <Search size={20} />
            <InputBase
              inputRef={searchRef}
              fullWidth
              placeholder="Search the admin…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches[0]) {
                  e.preventDefault();
                  router.push(matches[0].href);
                }
              }}
            />
          </Box>
          <Divider />
          <List sx={{ maxHeight: 340, overflowY: "auto", py: 2 }}>
            {matches.map((item) => (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                onClick={() => setPaletteOpen(false)}
                sx={{ px: 5, py: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 3, color: "text.secondary" }}>
                  <item.icon size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.group || undefined}
                  slotProps={{ primary: { sx: { fontSize: "0.9375rem" } } }}
                />
              </ListItemButton>
            ))}
            {matches.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 5, py: 3 }}>
                Nothing matches “{query}”.
              </Typography>
            )}
          </List>
        </Dialog>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            p: `${LAYOUT_PADDING}px`,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
