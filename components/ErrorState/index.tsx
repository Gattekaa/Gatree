import AnimatedBackground from "../animatedBackground";

export default function ErrorState() {
  return (
    <AnimatedBackground variant="grid">
      <main className="w-full h-full flex flex-col items-center justify-center gap-2">
        <h1 className="text-9xl font-bold text-white">404</h1>
        <h2 className="text-2xl font-bold text-white">
          The page you're looking for doesn't exist or is unavailable.
        </h2>
      </main>
    </AnimatedBackground>
  )
}