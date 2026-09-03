import type { Metadata } from "next";
import { getChoir } from "@/lib/server/settings";
import SupportContent from "./support-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support the choir",
  description:
    "Paybill, till, M-Pesa and bank details for supporting St. Paul's Chapel Community Choir.",
};

export default async function SupportPage() {
  const choir = await getChoir();
  return <SupportContent support={choir.support} email={choir.email} />;
}
