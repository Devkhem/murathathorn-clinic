import { LoginForm } from "@/features/auth/components/login-form";
import { ShineBorder } from "@/components/ui/shine-border";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/40 via-background to-background p-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-8 shadow-sm">
        <ShineBorder shineColor={["#3f7d4f", "#c99a3d", "#3f7d4f"]} borderWidth={1.5} duration={10} />

        <h1 className="mb-1 text-center">
          <AnimatedGradientText
            colorFrom="#3f7d4f"
            colorTo="#c99a3d"
            speed={1.2}
            className="text-2xl font-bold sm:text-3xl"
          >
            มุรทาธรคลินิกแพทย์แผนไทย
          </AnimatedGradientText>
        </h1>
        <p className="mb-8 text-center text-muted-foreground">เข้าสู่ระบบสำหรับเจ้าหน้าที่คลินิก</p>
        <LoginForm />
      </div>
    </div>
  );
}
