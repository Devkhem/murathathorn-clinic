import { SetPasswordForm } from "@/features/auth/components/set-password-form";

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold sm:text-3xl">ยินดีต้อนรับ</h1>
        <p className="mb-8 text-center text-muted-foreground">ตั้งรหัสผ่านเพื่อเริ่มใช้งาน</p>
        <SetPasswordForm />
      </div>
    </div>
  );
}
