import type { Metadata } from "next";
import Link from "next/link";
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
import { deleteMember } from "./actions";

export const metadata: Metadata = { title: "Members" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireSession("TECHNICAL");
  const members = await prisma.member.findMany({
    orderBy: [{ isActive: "desc" }, { lastName: "asc" }],
    take: 400,
  });

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Members</Typography>
          <Typography color="text.secondary">
            {members.length} on the roster.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/members/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          Add a member
        </Button>
      </Stack>

      <Card>
        {members.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 12 }}>
            <Typography>No members recorded yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Add them here as the roster is confirmed.
            </Typography>
            <Button
              component={Link}
              href="/admin/members/new"
              sx={{ mt: 4 }}
              variant="contained"
            >
              Add the first one
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Voice</TableCell>
                  <TableCell>Jumuiya</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Consent</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {m.firstName} {m.lastName}
                      {!m.isActive && (
                        <Chip size="small" label="Inactive" sx={{ ml: 2 }} />
                      )}
                    </TableCell>
                    <TableCell>{m.voice ? massPartLabel(m.voice) : "—"}</TableCell>
                    <TableCell>{m.jumuiya ?? "—"}</TableCell>
                    <TableCell>{m.email ?? m.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={m.mediaConsent ? "success" : "default"}
                        variant={m.mediaConsent ? "filled" : "outlined"}
                        label={m.mediaConsent ? "Media OK" : "Not given"}
                      />
                    </TableCell>
                    <TableCell>{m.joinedOn ? formatDate(m.joinedOn) : "—"}</TableCell>
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
                            href={`/admin/members/${m.id}`}
                            aria-label={`Edit ${m.firstName} ${m.lastName}`}
                          >
                            <Pencil size={16} />
                          </IconButton>
                        </Tooltip>
                        <ConfirmDelete
                          action={deleteMember}
                          id={m.id}
                          name={`${m.firstName} ${m.lastName}`}
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Stack>
  );
}
