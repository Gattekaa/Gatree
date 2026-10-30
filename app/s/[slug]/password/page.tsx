import { PasswordFormClient } from "./client";

export default async function PasswordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PasswordFormClient slug={slug} />;
}
