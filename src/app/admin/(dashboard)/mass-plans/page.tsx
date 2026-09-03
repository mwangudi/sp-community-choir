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
import { CalendarDays, Pencil, Plus, Printer } from "lucide-react";
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

  return (
    <Stack spacing={6}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={4}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h4">Mass plans</Typography>
          <Typography color="text.secondary">
            The order of service for each Sunday.
          </Typography>
        </Box>        <Button
          component={Link}
          href="/admin/mass-plans/new"
          variant="contained"
          startIcon={<Plus size={16} />}
        >
          New plan
        </Button>
      </Stack>

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
                      <Typography variant="h6">{plan.name}</Typography>
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

                <Divider sx={{ my: 4 }} />

                <Box
                  sx={{
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
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 0.4,
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
