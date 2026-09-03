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

/** The hidden field is always `id`; Song passes its slug through it. */
export function ConfirmDelete({
  action,
  id,
  name,
  note,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  name: string;
  note?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
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
