"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Lock, LogIn, Mail, Music2, ShieldCheck } from "lucide-react";
import { CHOIR } from "@/lib/choir";
import {
  all,
  isEmail,
  isRequired,
  useFieldValidation,
} from "@/components/admin/use-field-validation";
import { LoginCarousel, type Slide } from "./login-carousel";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ slides }: { slides: Slide[] }) {
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );
  const { formProps, field } = useFieldValidation({
    email: all(isRequired("Email"), isEmail),
    password: isRequired("Password"),
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "8fr 4fr" },
        bgcolor: "background.default",
      }}
    >
      {/* Brand + carousel */}
      <Box
        sx={{
          position: "relative",
          display: { xs: "none", md: "block" },
          overflow: "hidden",
          bgcolor: "primary.dark",
        }}
      >
        <LoginCarousel slides={slides} />

        <Box
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            p: 6,
            color: "#F7F5F2",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.15 }}>
              {CHOIR.name}
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: 12,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "#FDB321",
              }}
            >
              {CHOIR.tagline}
            </Typography>
          </Box>

          <Box sx={{ maxWidth: 460, mb: 10 }}>
            <Typography sx={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>
              Music, prepared with care.
            </Typography>
            <Typography sx={{ mt: 1.5, fontSize: 15, color: "rgba(247,245,242,0.85)" }}>
              Plan Sunday liturgy, review members&apos; song proposals and keep
              the repertoire up to date — all in one place.
            </Typography>
          </Box>

          <Stack direction="row" spacing={5}>
            {[
              ["11:30 am", "Sunday Mass"],
              ["4+", "Languages"],
              ["Mon & Wed", "Rehearsals"],
            ].map(([big, small]) => (
              <Box key={small}>
                <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{big}</Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    color: "rgba(247,245,242,0.7)",
                  }}
                >
                  {small}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Sign-in */}
      <Box sx={{ display: "grid", placeItems: "center", p: { xs: 3, sm: 4, lg: 5 } }}>
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 4 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Music2 size={20} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.1 }}>
                {CHOIR.shortName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin portal
              </Typography>
            </Box>
          </Stack>

          <Typography variant="h5" sx={{ mb: 0.5 }}>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your choir credentials to continue.
          </Typography>

          {state.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.error}
            </Alert>
          )}

          <form action={formAction} {...formProps}>
            <input type="hidden" name="next" value={next} />
            <Stack spacing={2.5}>
              <TextField
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                fullWidth
                size="medium"
                {...field("email")}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={16} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                fullWidth
                size="medium"
                {...field("password")}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={16} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={pending}
                endIcon={pending ? undefined : <LogIn size={16} />}
              >
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </form>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", justifyContent: "center", mt: 4 }}
          >
            <ShieldCheck size={13} color="#6B625C" />
            <Typography variant="caption" color="text.secondary">
              Authorised choir personnel only
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
