
export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div className="dark min-h-dvh" style={{ colorScheme: "dark" }}>
      {children}
    </div>
  );
}
