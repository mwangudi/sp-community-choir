import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { CalendarHeart, Pencil, Plus, Printer } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { SPECIAL_KINDS, massKindLabel } from "@/lib/mass-occasions";
import { formatDate } from "@/lib/utils";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { deleteMassPlan } from "../mass-plans/actions";

export const metadata: Metadata = { title: "Special Masses" };
export const dynamic = "force-dynamic";

const PAST_SHOWN = 20;

const NEW_LABELS: Record<(typeof SPECIAL_KINDS)[number], string> = {
  WEDDING: "Wedding",
  REQUIEM: "Requiem",
  FEAST: "Feast",
  OTHER: "Other",
};

function todayUtc() {
  // MassPlan.date is a DATE column, so compare against UTC midnight.
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

type Plan = Prisma.MassPlanGetPayload<{ include: { items: true } }>;

function MassCard({ plan }: { plan: Plan }) {
  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "center", flexWrap: "wrap", gap: 2 }}
            >
              <Typography variant="h6">{plan.name}</Typography>
              <Chip size="small" variant="outlined" label={massKindLabel(plan.kind)} />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatDate(plan.date)}
              {plan.venue ? ` · ${plan.venue}` : ""}
              {plan.setting ? ` · ${plan.setting}` : ""}
              {plan.leader ? ` · ${plan.leader}` : ""}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Button
              component={Link}
              href={`/admin/worship-aid/${plan.id}`}
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Printer size={15} />}
            >
              Worship aid
            </Button>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                component={Link}
                href={`/admin/special-masses/${plan.id}`}
                aria-label={`Edit ${plan.name}`}
              >
                <Pencil size={16} />
              </IconButton>
            </Tooltip>
            <ConfirmDelete
              action={deleteMassPlan}
              id={plan.id}
              name={plan.name}
              note="The Mass and its order of service are removed."
            />
          </Stack>
        </Stack>

        {plan.items.length > 0 && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 2,
              bgcolor: "action.hover",
              display: "grid",
              columnGap: 10,
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            }}
          >
            {plan.items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                spacing={3}
                sx={{
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  py: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    flexShrink: 0,
                  }}
                >
                  {massPartLabel(item.part)}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: "right" }}>
                  {item.song}
                </Typography>
              </Stack>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default async function SpecialMassesPage() {
  await requireSession("TECHNICAL");

  const today = todayUtc();
  const include = { items: { orderBy: { sortOrder: "asc" as const } } };
  const [upcoming, past] = await Promise.all([
    prisma.massPlan.findMany({
      where: { kind: { not: "SUNDAY" }, date: { gte: today } },
      orderBy: { date: "asc" },
      include,
    }),
    prisma.massPlan.findMany({
      where: { kind: { not: "SUNDAY" }, date: { lt: today } },
      orderBy: { date: "desc" },
      take: PAST_SHOWN,
      include,
    }),
  ]);

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Special Masses</Typography>
          <Typography color="text.secondary">
            Weddings, requiems and feasts on any day — choose the songs and print
            the worship aid.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
          {SPECIAL_KINDS.map((k) => (
            <Button
              key={k}
              component={Link}
              href={`/admin/special-masses/new?kind=${k}`}
              variant="outlined"
              startIcon={<Plus size={16} />}
            >
              {NEW_LABELS[k]}
            </Button>
          ))}
        </Stack>
      </Stack>

      {upcoming.length === 0 && past.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 12 }}>
            <CalendarHeart size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 2 }}>No special Masses yet</Typography>
            <Button
              component={Link}
              href="/admin/special-masses/new"
              sx={{ mt: 3 }}
              variant="contained"
            >
              Plan the first one
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Stack spacing={4}>
            <Typography variant="overline" color="text.secondary">
              Upcoming
            </Typography>
            {upcoming.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing planned ahead.
              </Typography>
            ) : (
              upcoming.map((plan) => <MassCard key={plan.id} plan={plan} />)
            )}
          </Stack>

          {past.length > 0 && (
            <Stack spacing={4}>
              <Typography variant="overline" color="text.secondary">
                Past
              </Typography>
              {past.map((plan) => (
                <MassCard key={plan.id} plan={plan} />
              ))}
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
