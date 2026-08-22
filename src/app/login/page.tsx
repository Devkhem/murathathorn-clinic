import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="mb-1 text-center text-3xl font-bold">คลินิกแม่</h1>
        <p className="mb-8 text-center text-muted-foreground">เข้าสู่ระบบสำหรับเจ้าหน้าที่คลินิก</p>
        <LoginForm />
      </div>
    </div>
  );
}
