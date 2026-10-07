"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { useAdminRole } from "@/components/admin/admin-role";

/** The hidden field is always `id`; Song passes its slug through it. */
export function ConfirmDelete({
  action,
  id,
  name,
  note,
  adminOnly = true,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  name: string;
  note?: string;
  /** Most deletes need the Admin role; hide the button from anyone else. */
  adminOnly?: boolean;
  /** Show a labelled button (e.g. on an edit page) instead of a row icon. */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const role = useAdminRole();
  if (adminOnly && role !== "ADMIN") return null;

  return (
    <>
      {label ? (
        <Button
          variant="outlined"
          color="error"
          startIcon={<Trash2 size={16} />}
          onClick={() => setOpen(true)}
        >
          {label}
        </Button>
      ) : (
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            aria-label={`Delete ${name}`}
            onClick={() => setOpen(true)}
          >
            <Trash2 size={16} />
          </IconButton>
        </Tooltip>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {note ?? "This cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 6, pb: 5 }}>
          <Button color="inherit" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="contained" color="error">
              Delete
            </Button>
          </form>
        </DialogActions>
      </Dialog>
    </>
  );
}
