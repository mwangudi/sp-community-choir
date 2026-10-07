"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, Snackbar } from "@mui/material";

const NOTICES = {
  saved: { severity: "success", text: "Saved" },
  deleted: { severity: "success", text: "Deleted" },
  denied: {
    severity: "warning",
    text: "That needs an Administrator account. Ask an administrator to do it for you.",
  },
} as const;

/**
 * Turns `?saved=1` (set by save actions) and `?denied=1` (set by
 * requireSession) into a brief message, then drops the flag from the address
 * so a refresh or a shared link does not repeat it.
 */
export function AdminNotice() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  // Kept after closing so the message does not vanish mid-fade.
  const [notice, setNotice] = useState<keyof typeof NOTICES>("saved");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const key = (Object.keys(NOTICES) as (keyof typeof NOTICES)[]).find((k) => params.has(k));
    if (!key) return;
    setNotice(key);
    setOpen(true);
    const rest = new URLSearchParams(params);
    rest.delete(key);
    router.replace(rest.size ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  const current = NOTICES[notice];
  return (
    <Snackbar
      open={open}
      autoHideDuration={current.severity === "warning" ? 7000 : 3000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity={current.severity} variant="filled" onClose={() => setOpen(false)}>
        {current.text}
      </Alert>
    </Snackbar>
  );
}
