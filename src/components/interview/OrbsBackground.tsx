export function OrbsBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="orb orb-cyan -top-[14%] left-[6%] h-[42rem] w-[42rem] animate-float-slow" />
      <div className="orb orb-violet -right-[12%] top-[28%] h-[38rem] w-[38rem] animate-float-slower" />
      <div className="orb orb-emerald -bottom-[20%] left-[28%] h-[36rem] w-[36rem] animate-float-slow" />
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
