import { getSession } from "@/lib/auth";
import { liturgicalContext } from "@/lib/liturgical";
import { getMassPlan, getSongs } from "@/lib/server/repertoire";
import RepertoireBrowser from "./repertoire-browser";

export const dynamic = "force-dynamic";

export default async function RepertoirePage() {
  const ctx = liturgicalContext(new Date());
  const [session, songs, plan] = await Promise.all([
    getSession(),
    getSongs(),
    getMassPlan(ctx.date),
  ]);

  return (
    <RepertoireBrowser signedIn={Boolean(session)} songs={songs} plan={plan} />
  );
}
