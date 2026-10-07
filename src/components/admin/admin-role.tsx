"use client";

import { createContext, useContext } from "react";
import type { Role } from "@prisma/client";

/** The signed-in user's current role, for hiding controls they cannot use. */
const RoleContext = createContext<Role>("TECHNICAL");

export const AdminRoleProvider = RoleContext.Provider;

export function useAdminRole(): Role {
  return useContext(RoleContext);
}
