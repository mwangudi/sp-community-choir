import type { Metadata } from "next";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { BookOpen, CalendarDays, Download, Pencil, Plus, Printer } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { massPartLabel } from "@/lib/mass-parts";
import { formatDate } from "@/lib/utils";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { PaginationBar } from "@/components/admin/pagination-bar";
import { deleteMassPlan, togglePlanStatus } from "./actions";

export const metadata: Metadata = { title: "Mass plans" };
export const dynamic = "force-dynamic";

// Each card lists a full order of service, so keep the page short.
const PER_PAGE = 10;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function SummaryCard({
  icon,
  label,
  value,
  chip,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  chip?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent
        sx={{ display: "flex", alignItems: "center", gap: 3, py: 3 }}
      >
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: "action.hover",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            {label}
          </Typography>
          <Typography noWrap sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
        {chip}
      </CardContent>
    </Card>
  );
}

export default async function MassPlansPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSession("TECHNICAL");

  const { page: rawPage } = await searchParams;
  const total = await prisma.massPlan.count();
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(Number(rawPage) || 1, 1), pageCount);

  const plans = await prisma.massPlan.findMany({
    orderBy: { date: "desc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  const next = plans.find((p) => p.date >= startOfToday()) ?? plans[0];
  const published = await prisma.massPlan.count({ where: { status: "PUBLISHED" } });

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="h4" className="admin-display">
              Mass plans
            </Typography>
            {next?.season && (
              <Chip
                size="small"
                label={next.season.replace(/_/g, " ")}
                sx={{ textTransform: "uppercase", fontSize: 11, fontWeight: 700 }}
              />
            )}
          </Stack>
          <Typography color="text.secondary">
            The order of service for each Sunday.
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/admin/mass-plans/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          New plan
        </Button>
      </Stack>

      {next && (
        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          <SummaryCard
            icon={<CalendarDays size={18} />}
            label="Active setting"
            value={next.setting ?? "Not set"}
            chip={<Chip size="small" color="success" label="Current" />}
          />
          <SummaryCard
            icon={<BookOpen size={18} />}
            label="Liturgical lectionary"
            value={`Cycle Year ${next.year}`}
            chip={<Chip size="small" color="warning" label={`Year ${next.year}`} />}
          />
          <SummaryCard
            icon={<Printer size={18} />}
            label="Worship leaflet"
            value={`Ready for ${formatDate(next.date)}`}
            chip={
              <Tooltip title="Open the worship aid">
                <IconButton
                  size="small"
                  component={Link}
                  href={`/admin/worship-aid/${next.id}`}
                  aria-label="Open the worship aid"
                >
                  <Download size={16} />
                </IconButton>
              </Tooltip>
            }
          />
        </Box>
      )}

      {plans.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 12 }}>
            <CalendarDays size={32} style={{ opacity: 0.35 }} />
            <Typography sx={{ mt: 2 }}>No plans yet</Typography>
            <Button
              component={Link}
              href="/admin/mass-plans/new"
              sx={{ mt: 3 }}
              variant="contained"
            >
              Create the first one
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={4}>
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
                >
                  <Box>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                      <Typography variant="h6" className="admin-display">
                        {plan.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={plan.status}
                        color={plan.status === "PUBLISHED" ? "success" : "default"}
                      />
                      <Chip size="small" variant="outlined" label={`Year ${plan.year}`} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(plan.date)}
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
                    <form action={togglePlanStatus}>
                      <input type="hidden" name="id" value={plan.id} />
                      <Button type="submit" size="small" variant="outlined">
                        {plan.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </Button>
                    </form>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        component={Link}
                        href={`/admin/mass-plans/${plan.id}`}
                        aria-label={`Edit ${plan.name}`}
                      >
                        <Pencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <ConfirmDelete
                      action={deleteMassPlan}
                      id={plan.id}
                      name={plan.name}
                      note="The plan and its order of service are removed."
                    />
                  </Stack>
                </Stack>

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
                      <Typography
                        className="admin-song"
                        sx={{ textAlign: "right", fontWeight: 500 }}
                      >
                        {item.song}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {plans.length > 0 && (
        <PaginationBar
          page={page}
          pageCount={pageCount}
          total={total}
          shown={plans.length}
          basePath="/admin/mass-plans"
          label="plans"
        />
      )}
    </Stack>
  );
}
