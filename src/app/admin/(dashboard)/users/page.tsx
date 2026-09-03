import type { Metadata } from "next";
import Link from "next/link";
import type { Role } from "@prisma/client";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { formatDate } from "@/lib/utils";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { deleteUser } from "./actions";

export const metadata: Metadata = { title: "Users & roles" };
export const dynamic = "force-dynamic";

const ROLE_COLOR: Record<Role, "error" | "info" | "default"> = {
  ADMIN: "error",
  TECHNICAL: "info",
  MEMBER: "default",
};

export default async function UsersPage() {
  const session = await requireSession("ADMIN");
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    take: 200,
  });

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Users &amp; roles</Typography>
          <Typography color="text.secondary">
            Who can sign in to the admin, and what they may do.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/users/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          Add a user
        </Button>
      </Stack>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Voice</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last signed in</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip size="small" color={ROLE_COLOR[u.role]} label={u.role} />
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
                  <TableCell>{u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "flex-end" }}
                    >
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
      </Card>

      <Typography variant="caption" color="text.secondary">
        Roles are ranked Member → Technical → Admin. Technical can manage music and
        content; Admin can additionally manage users, the login carousel and delete records.
      </Typography>
    </Stack>
  );
}
