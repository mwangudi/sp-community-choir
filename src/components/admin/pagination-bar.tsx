"use client";

import Link from "next/link";
import { Pagination, PaginationItem, Stack, Typography } from "@mui/material";

/**
 * Link-based pagination, so pages are shareable and work without JS.
 * Client-side only because MUI's renderItem is a function prop.
 */
export function PaginationBar({
  page,
  pageCount,
  total,
  shown,
  basePath,
  params = {},
  label = "items",
}: {
  page: number;
  pageCount: number;
  total: number;
  shown: number;
  basePath: string;
  params?: Record<string, string | undefined>;
  label?: string;
}) {
  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={4}
      sx={{ justifyContent: "space-between", alignItems: "center" }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing {shown} of {total} {label}
      </Typography>
      {pageCount > 1 && (
        <Pagination
          page={page}
          count={pageCount}
          shape="rounded"
          color="primary"
          siblingCount={1}
          renderItem={(item) => (
            <PaginationItem
              component={Link}
              href={hrefFor(item.page ?? 1)}
              {...item}
            />
          )}
        />
      )}
    </Stack>
  );
}
