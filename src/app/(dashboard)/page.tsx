import Link from "next/link";
import { UserPlus, Search, CalendarPlus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const QUICK_ACTIONS = [
  { href: "/patients/new", label: "เพิ่มคนไข้ใหม่", icon: UserPlus },
  { href: "/patients", label: "ค้นหาคนไข้", icon: Search },
  { href: "/appointments/new", label: "นัดหมายใหม่", icon: CalendarPlus },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h2 className="text-3xl font-bold">สวัสดีค่ะ</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-shadow hover:shadow-md">
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
