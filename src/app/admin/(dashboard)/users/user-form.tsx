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
  all,
  isEmail,
  isRequired,
  useFieldValidation,
  type FieldRule,
} from "@/components/admin/use-field-validation";
import { massPartLabel } from "@/lib/mass-parts";
import { ROLES, VOICES } from "@/lib/validation";
import { saveUser, type UserFormState } from "./actions";

export type UserDraft = {
  id?: string;
  name: string;
  email: string;
  role: string;
  voice: string;
  isActive: boolean;
};

const ROLE_HELP: Record<string, string> = {
  ADMIN: "Everything, including users, the login carousel and deletions.",
  TECHNICAL: "Music and content — repertoire, plans, blog, gallery, concerts.",
  MEMBER: "Sign-in only, for members-only material on the website.",
};

export function UserForm({
  user,
  isSelf,
}: {
  user: UserDraft;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    saveUser,
    {},
  );

  // On an existing user a blank password means "keep the current one".
  const passwordRule: FieldRule = (value) => {
    if (!value) return user.id ? null : "Password is required.";
    return value.length >= 10 ? null : "Use at least 10 characters.";
  };

  const { formProps, field } = useFieldValidation({
    name: isRequired("Name"),
    email: all(isRequired("Email"), isEmail),
    password: passwordRule,
  });

  return (
    <form action={formAction} {...formProps}>
      {user.id && <input type="hidden" name="id" value={user.id} />}

      {state.error && (
        <Alert severity="error" sx={{ mb: 5 }}>
          {state.error}
        </Alert>
      )}

      {isSelf && (
        <Alert severity="info" sx={{ mb: 5 }}>
          This is your own account, so its role and status are locked.
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
              The person
            </Typography>
            <Stack spacing={5}>
              <TextField
                name="name"
                label="Name"
                defaultValue={user.name}
                fullWidth
                {...field("name")}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                defaultValue={user.email}
                fullWidth
                {...field("email")}
              />
              <TextField
                name="password"
                label={user.id ? "New password" : "Password"}
                type="password"
                autoComplete="new-password"
                fullWidth
                {...field(
                  "password",
                  user.id
                    ? "Leave blank to keep the current password."
                    : "At least 10 characters.",
                )}
              />
              <TextField
                name="voice"
                label="Voice"
                select
                defaultValue={user.voice}
                fullWidth
              >
                <MenuItem value="">Not set</MenuItem>
                {VOICES.map((v) => (
                  <MenuItem key={v} value={v}>
                    {massPartLabel(v)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 5 }}>
              Access
            </Typography>
            <Stack spacing={5}>
              <TextField
                name="role"
                label="Role"
                select
                defaultValue={user.role}
                disabled={isSelf}
                helperText={ROLE_HELP[user.role]}
                fullWidth
              >
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {massPartLabel(r)}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isActive"
                    defaultChecked={user.isActive}
                    disabled={isSelf}
                  />
                }
                label="Can sign in"
              />
              {isSelf && (
                <>
                  <input type="hidden" name="role" value={user.role} />
                  <input type="hidden" name="isActive" value="on" />
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <FormActions pending={pending} cancelHref="/admin/users" label="Save user" />
    </form>
  );
}
