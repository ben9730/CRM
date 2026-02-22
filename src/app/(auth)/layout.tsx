import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HealthCRM — Sign In",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: "oklch(0.10 0.005 280)" }}
    >
      {/* Logo / App name */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.50 0.25 300))",
            boxShadow: "0 0 24px -4px oklch(0.65 0.24 280 / 40%)",
          }}
        >
          <span className="text-lg font-bold text-white">H</span>
        </div>
        <span
          className="text-xl font-semibold tracking-tight"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.75 0.20 280), oklch(0.65 0.24 300))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          HealthCRM
        </span>
      </div>

      {/* Auth card container */}
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
