"use client";

import { useActionState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormActions } from "@/components/admin/form-actions";
import {
  isEmail,
  useFieldValidation,
} from "@/components/admin/use-field-validation";
import { SETTING_GROUPS } from "@/lib/settings";
import { saveSettings, type SettingsFormState } from "./actions";

export function SettingsForm({ values }: { values: Record<string, string> }) {
  const [state, formAction, pending] = useActionState<
    SettingsFormState,
    FormData
  >(saveSettings, {});
  const { formProps, field } = useFieldValidation({ email: isEmail });

  return (
    <form action={formAction} {...formProps}>
      {state.error && (
        <Alert severity="error" sx={{ mb: 5 }}>
          {state.error}
        </Alert>
      )}
      {state.saved && (
        <Alert severity="success" sx={{ mb: 5 }}>
          Saved — the public pages have been updated.
        </Alert>
      )}

      <Stack spacing={6}>
        {SETTING_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardContent>
              <Typography variant="h6">{group.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
                {group.description}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 5,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                }}
              >
                {group.fields.map((f) => (
                  <TextField
                    key={f.key}
                    name={f.key}
                    label={f.label}
                    defaultValue={values[f.key] ?? ""}
                    multiline={f.multiline}
                    minRows={f.multiline ? 3 : undefined}
                    fullWidth
                    // Long-form copy needs the full width to be readable.
                    sx={f.multiline ? { gridColumn: { md: "1 / -1" } } : undefined}
                    {...field(f.key, f.help)}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}

        <FormActions pending={pending} cancelHref="/admin" />
      </Stack>
    </form>
  );
}
