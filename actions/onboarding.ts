"use server";

import { auth, unstable_update } from "@/lib/auth";

export async function completeWelcomeTour() {
  const session = await auth();
  if (!session?.user?.id || !session.user.showWelcomeTour) return;
  await unstable_update({ user: { showWelcomeTour: false } });
}
