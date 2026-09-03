"use client";

import { useActionState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormActions } from "@/components/admin/form-actions";
import {
  isEmail,
  isRequired,
  useFieldValidation,
} from "@/components/admin/use-field-validation";
import { massPartLabel } from "@/lib/mass-parts";
import { MEDIA_CONSENT_TEXT } from "@/lib/consent";
import { VOICES } from "@/lib/validation";
import { saveMember, type MemberFormState } from "./actions";

export type MemberDraft = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  voice: string;
  jumuiya: string;
  joinedOn: string;
  notes: string;
  isActive: boolean;
  mediaConsent: boolean;
};

export function MemberForm({ member }: { member: MemberDraft }) {
  const [state, formAction, pending] = useActionState<MemberFormState, FormData>(
    saveMember,
    {},
  );
  const { formProps, field } = useFieldValidation({
    firstName: isRequired("First name"),
    lastName: isRequired("Last name"),
    email: isEmail,
  });

  return (
    <form action={formAction} {...formProps}>
      {member.id && <input type="hidden" name="id" value={member.id} />}

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
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 5 }}>
              The member
            </Typography>
            <Stack spacing={5}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                <TextField
                  name="firstName"
                  label="First name"
                  defaultValue={member.firstName}
                  fullWidth
                  {...field("firstName")}
                />
                <TextField
                  name="lastName"
                  label="Last name"
                  defaultValue={member.lastName}
                  fullWidth
                  {...field("lastName")}
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  defaultValue={member.email}
                  fullWidth
                  {...field("email")}
                />
                <TextField
                  name="phone"
                  label="Phone"
                  defaultValue={member.phone}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                <TextField
                  name="voice"
                  label="Voice"
                  select
                  defaultValue={member.voice}
                  fullWidth
                >
                  <MenuItem value="">Not set</MenuItem>
                  {VOICES.map((v) => (
                    <MenuItem key={v} value={v}>
                      {massPartLabel(v)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="jumuiya"
                  label="Jumuiya"
                  defaultValue={member.jumuiya}
                  fullWidth
                />
              </Stack>
              <TextField
                name="notes"
                label="Notes"
                defaultValue={member.notes}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Membership
              </Typography>
              <Stack spacing={5}>
                <TextField
                  name="joinedOn"
                  label="Joined on"
                  type="date"
                  defaultValue={member.joinedOn}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox name="isActive" defaultChecked={member.isActive} />
                  }
                  label="Currently singing"
                />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Consent
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    name="mediaConsent"
                    defaultChecked={member.mediaConsent}
                  />
                }
                label="Media consent given"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 3 }}
              >
                {MEDIA_CONSENT_TEXT}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <FormActions
        pending={pending}
        cancelHref="/admin/members"
        label="Save member"
      />
    </form>
  );
}
