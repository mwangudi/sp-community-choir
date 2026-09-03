import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, Role, Voice } from "@prisma/client";
import {
  Box,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import { Pencil, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { formatDate } from "@/lib/utils";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { TABLE_BODY_SX, TABLE_HEAD_SX } from "@/components/admin/surface";
import { deleteUser } from "./actions";

export const metadata: Metadata = { title: "Users & roles" };
export const dynamic = "force-dynamic";

const PER_PAGE = 15;

const ROLE_COLOR: Record<Role, "error" | "info" | "default"> = {
  ADMIN: "error",
  TECHNICAL: "info",
  MEMBER: "default",
};

const ROLES: Role[] = ["ADMIN", "TECHNICAL", "MEMBER"];

const VOICES: Voice[] = [
  "SOPRANO",
  "ALTO",
  "TENOR",
  "BASS",
  "INSTRUMENTALIST",
  "CONDUCTOR",
  "OTHER",
];

type SortKey = "name" | "email" | "role" | "lastLoginAt";
const SORT_KEYS: SortKey[] = ["name", "email", "role", "lastLoginAt"];

const COLUMNS: { key: SortKey | "voice" | "status"; label: string; sortable: boolean }[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "voice", label: "Voice", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "lastLoginAt", label: "Last signed in", sortable: true },
];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    voice?: string;
    sort?: string;
    dir?: string;
    page?: string;
  }>;
}) {
  const session = await requireSession("ADMIN");

  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const roles = (sp.role?.split(",") ?? []).filter((r) => ROLES.includes(r as Role));
  const voices = (sp.voice?.split(",") ?? []).filter((v) => VOICES.includes(v as Voice));
  const status = sp.status === "active" || sp.status === "disabled" ? sp.status : undefined;
  const sort: SortKey = SORT_KEYS.includes(sp.sort as SortKey)
    ? (sp.sort as SortKey)
    : "name";
  const dir: "asc" | "desc" = sp.dir === "desc" ? "desc" : "asc";

  // MySQL's utf8mb4_unicode_ci collation already makes `contains` case-insensitive.
  const where: Prisma.UserWhereInput = {
    ...(roles.length ? { role: { in: roles as Role[] } } : {}),
    ...(voices.length ? { voice: { in: voices as Voice[] } } : {}),
    ...(status ? { isActive: status === "active" } : {}),
    ...(q
      ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] }
      : {}),
  };

  const total = await prisma.user.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(Number(sp.page) || 1, 1), pageCount);

  const [users, everyone] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [sort]: dir },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.user.count(),
  ]);

  const filtered = Boolean(q || roles.length || voices.length || status);

  const sortHref = (key: SortKey) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (roles.length) next.set("role", roles.join(","));
    if (voices.length) next.set("voice", voices.join(","));
    if (status) next.set("status", status);
    next.set("sort", key);
    // Clicking the active column flips direction; a new column starts ascending.
    next.set("dir", sort === key && dir === "asc" ? "desc" : "asc");
    return `/admin/users?${next.toString()}`;
  };

  return (
    <Stack spacing={6}>
      <Box>
        <Typography variant="h4">Users &amp; roles</Typography>
        <Typography color="text.secondary">
          {everyone} {everyone === 1 ? "person" : "people"} can sign in to the admin.
        </Typography>
      </Box>

      <Card>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ px: 4, pt: 4, alignItems: { md: "center" }, justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Box sx={{ width: 3, height: 20, borderRadius: 1, bgcolor: "secondary.main" }} />
            <Typography sx={{ fontWeight: 600 }}>All users</Typography>
          </Stack>
          <Chip
            size="small"
            label={`${total} record${total === 1 ? "" : "s"}`}
            variant="outlined"
          />
        </Stack>

        <DataToolbar
          basePath="/admin/users"
          searchPlaceholder="Search name or email"
          createHref="/admin/users/new"
          createLabel="Add a user"
          dialogTitle="Filter users"
          filters={[
            {
              name: "role",
              label: "Role",
              anyLabel: "Any role",
              multiple: true,
              options: ROLES.map((r) => ({ value: r, label: massPartLabel(r) })),
            },
            {
              name: "voice",
              label: "Voice",
              anyLabel: "Any voice",
              multiple: true,
              options: VOICES.map((v) => ({ value: v, label: massPartLabel(v) })),
            },
            {
              name: "status",
              label: "Status",
              anyLabel: "Any status",
              options: [
                { value: "active", label: "Active" },
                { value: "disabled", label: "Disabled" },
              ],
            },
          ]}
        />
        <Divider />

        {users.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Users size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 2, fontWeight: 600 }}>
              {filtered ? "No users match those filters" : "No users yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filtered
                ? "Try a different search or clear the filters."
                : "Add the first person who should reach the admin."}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={TABLE_HEAD_SX}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key}>
                      {col.sortable ? (
                        <TableSortLabel
                          component={Link}
                          href={sortHref(col.key as SortKey)}
                          active={sort === col.key}
                          direction={sort === col.key ? dir : "asc"}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={TABLE_BODY_SX}>
                {users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Typography
                        component={Link}
                        href={`/admin/users/${u.id}`}
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          textDecoration: "none",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {u.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={ROLE_COLOR[u.role]}
                        label={massPartLabel(u.role)}
                      />
                    </TableCell>
                    <TableCell>{u.voice ? massPartLabel(u.voice) : "—"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={u.isActive ? "success" : "default"}
                        variant={u.isActive ? "filled" : "outlined"}
                        label={u.isActive ? "Active" : "Disabled"}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            component={Link}
                            href={`/admin/users/${u.id}`}
                            aria-label={`Edit ${u.name}`}
                          >
                            <Pencil size={16} />
                          </IconButton>
                        </Tooltip>
                        {u.id !== session.sub && (
                          <ConfirmDelete
                            action={deleteUser}
                            id={u.id}
                            name={u.name}
                            note="They lose access immediately. Anything they wrote stays."
                          />
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {users.length > 0 && (
        <PaginationBar
          page={page}
          pageCount={pageCount}
          total={total}
          shown={users.length}
          basePath="/admin/users"
          params={{
            q: q || undefined,
            role: roles.length ? roles.join(",") : undefined,
            voice: voices.length ? voices.join(",") : undefined,
            status,
            sort: sort === "name" ? undefined : sort,
            dir: dir === "asc" ? undefined : dir,
          }}
          label="users"
        />
      )}

      <Typography variant="caption" color="text.secondary">
        Roles are ranked Member → Technical → Admin. Technical can manage music and
        content; Admin can additionally manage users, the login carousel and delete records.
      </Typography>
    </Stack>
  );
}
