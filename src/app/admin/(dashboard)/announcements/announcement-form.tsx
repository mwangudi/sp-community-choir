"use client";

import { useActionState, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Megaphone } from "lucide-react";
import { FormActions } from "@/components/admin/form-actions";
import {
  isRequired,
  useFieldValidation,
} from "@/components/admin/use-field-validation";
import { saveAnnouncement, type AnnouncementFormState } from "./actions";

export type AnnouncementDraft = {
  id?: string;
  message: string;
  href: string;
  linkLabel: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  sortOrder: number;
};

export function AnnouncementForm({ announcement }: { announcement: AnnouncementDraft }) {
  const [state, formAction, pending] = useActionState<AnnouncementFormState, FormData>(
    saveAnnouncement,
    {},
  );
  const [message, setMessage] = useState(announcement.message);
  const [href, setHref] = useState(announcement.href);
  const [linkLabel, setLinkLabel] = useState(announcement.linkLabel);
  const { formProps, field } = useFieldValidation({ message: isRequired("Message") });
  const messageField = field(
    "message",
    "One line — it scrolls across the top of every page. Line breaks become spaces.",
  );

  return (
    <form action={formAction} {...formProps}>
      {announcement.id && <input type="hidden" name="id" value={announcement.id} />}

      {state.error && (
        <Alert severity="error" sx={{ mb: 5 }}>
          {state.error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 6,
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          alignItems: "start",
        }}
      >
        <Stack spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                The announcement
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="message"
                  label="Message"
                  multiline
                  minRows={2}
                  fullWidth
                  {...messageField}
                  value={message}
                  // The validation hook clears its error on change; keep the preview live too.
                  onChange={(e) => {
                    setMessage(e.target.value);
                    messageField.onChange();
                  }}
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                  <TextField
                    name="href"
                    label="Link (optional)"
                    placeholder="/concerts or https://…"
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    name="linkLabel"
                    label="Link text"
                    placeholder="Details"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    disabled={!href.trim()}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 4 }}>
                Preview
              </Typography>
              {/* Mirrors the public banner's colours, without the motion. */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "stretch",
                  borderRadius: 1,
                  overflow: "hidden",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: 14,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 3,
                    bgcolor: "primary.dark",
                    color: "#FDB321",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  <Megaphone size={15} /> News
                </Box>
                <Box sx={{ px: 3, py: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {message.replace(/\s+/g, " ").trim() || "Your announcement"}
                  {href.trim() && (
                    <Box component="span" sx={{ ml: 2, fontWeight: 600, color: "#FDB321" }}>
                      {linkLabel.trim() || "Details"} →
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 5 }}>
              When it shows
            </Typography>
            <Stack spacing={5}>
              <FormControlLabel
                control={<Checkbox name="isActive" defaultChecked={announcement.isActive} />}
                label="Show on the website"
              />
              <TextField
                name="startsAt"
                label="From"
                type="datetime-local"
                defaultValue={announcement.startsAt}
                helperText="Leave blank to show it straight away."
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                name="endsAt"
                label="Until"
                type="datetime-local"
                defaultValue={announcement.endsAt}
                helperText="It disappears by itself after this. Leave blank to keep it."
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                name="sortOrder"
                label="Order"
                type="number"
                defaultValue={announcement.sortOrder}
                helperText="Lower numbers scroll past first."
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <FormActions
        pending={pending}
        cancelHref="/admin/announcements"
        label="Save announcement"
      />
    </form>
  );
}
