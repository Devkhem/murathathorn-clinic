import Link from "next/link";
import { UserPlus, Search, CalendarPlus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/border-beam";

const QUICK_ACTIONS = [
  { href: "/patients/new", label: "เพิ่มคนไข้ใหม่", icon: UserPlus, primary: true },
  { href: "/patients", label: "ค้นหาคนไข้", icon: Search, primary: false },
  { href: "/appointments/new", label: "นัดหมายใหม่", icon: CalendarPlus, primary: false },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h2 className="text-3xl font-bold">สวัสดีค่ะ</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map(({ href, label, icon: Icon, primary }) => (
          <Link key={href} href={href}>
            <Card
              className={
                primary
                  ? "relative h-full overflow-hidden border-primary/30 bg-primary/5 transition-shadow hover:shadow-md"
                  : "h-full transition-shadow hover:shadow-md"
              }
            >
              {primary && <BorderBeam size={90} duration={7} colorFrom="#3f7d4f" colorTo="#c99a3d" />}
              <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                <Icon className="size-10 text-primary" />
                <span className="text-lg font-semibold">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
