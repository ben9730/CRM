import Link from "next/link";

export default function LoginPage() {
  return (
    <div
      className="rounded-2xl p-8 space-y-6"
      style={{
        background: "oklch(0.13 0.008 280)",
        border: "1px solid oklch(1 0 0 / 8%)",
        boxShadow: "0 24px 64px -12px oklch(0 0 0 / 40%)",
      }}
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to access your CRM
        </p>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Login form will be implemented in Plan 02-03.</p>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
