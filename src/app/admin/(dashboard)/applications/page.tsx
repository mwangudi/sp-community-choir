import type { Metadata } from "next";
import type { ApplicationStatus } from "@prisma/client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Check, Mail, Phone, ShieldCheck, ShieldX, UserPlus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { formatDate } from "@/lib/utils";
import { deleteApplication, setApplicationStatus } from "./actions";

export const metadata: Metadata = { title: "Applications" };
export const dynamic = "force-dynamic";

const STATUSES: ApplicationStatus[] = ["NEW", "CONTACTED", "ACCEPTED", "DECLINED"];
const COLOR: Record<ApplicationStatus, "warning" | "info" | "success" | "error"> = {
  NEW: "warning",
  CONTACTED: "info",
  ACCEPTED: "success",
  DECLINED: "error",
};

export default async function ApplicationsPage() {
  const session = await requireSession("TECHNICAL");
  const applications = await prisma.joinApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", sm: "2.125rem" } }}>
          Applications
        </Typography>
        <Typography color="text.secondary">
          People who have asked to join, with the consent they gave.
        </Typography>
      </Box>

      {applications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <UserPlus size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 1, fontWeight: 600 }}>No applications yet</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {applications.map((a) => (
            <Card key={a.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography variant="h6">
                        {a.firstName} {a.lastName}
                      </Typography>
                      <Chip size="small" label={a.status} color={COLOR[a.status]} />
                      {a.voice && (
                        <Chip size="small" variant="outlined" label={massPartLabel(a.voice)} />
                      )}
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ mt: 0.5, flexWrap: "wrap", gap: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        <Mail size={12} style={{ verticalAlign: "middle" }} /> {a.email}
                      </Typography>
                      {a.phone && (
                        <Typography variant="body2" color="text.secondary">
                          <Phone size={12} style={{ verticalAlign: "middle" }} /> {a.phone}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Received {formatDate(a.createdAt)}
                  </Typography>
                </Stack>

                {a.message && (
                  <Typography variant="body2" sx={{ mt: 1.5, fontStyle: "italic" }}>
                    “{a.message}”
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  <Chip
                    size="small"
                    icon={a.privacyConsent ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                    color={a.privacyConsent ? "success" : "default"}
                    variant={a.privacyConsent ? "filled" : "outlined"}
                    label="Privacy notice"
                  />
                  <Chip
                    size="small"
                    icon={a.mediaConsent ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                    color={a.mediaConsent ? "success" : "default"}
                    variant={a.mediaConsent ? "filled" : "outlined"}
                    label="Media consent"
                  />
                  {a.consentAt && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`v${a.consentVersion} · ${formatDate(a.consentAt)}`}
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
                  {STATUSES.filter((s) => s !== a.status).map((s) => (
                    <form key={s} action={setApplicationStatus}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="status" value={s} />
                      <Button type="submit" size="small" variant="outlined" color={COLOR[s]}>
                        <Check size={14} style={{ marginInlineEnd: 4 }} />
                        {s.toLowerCase()}
                      </Button>
                    </form>
                  ))}
                  {session.role === "ADMIN" && (
                    <form action={deleteApplication}>
                      <input type="hidden" name="id" value={a.id} />
                      <Button type="submit" size="small" color="error">
                        Erase record
                      </Button>
                    </form>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
