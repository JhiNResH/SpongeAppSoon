"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    // { icon: "🔄", label: "Swap", href: "/swap" },
    // { icon: "🌉", label: "Bridge", href: "/bridge" },
    // { icon: "🔄", label: "Swap", href: "https://cobaltx.io/swap/" },
    { icon: "🔄", label: "Swap", href: "/swap" },
    // { icon: "", label: "Borrow", href: "/" },
    { icon: "🏦", label: "Earn", href: "/stake", disabled: false },
    { icon: "📊", label: "Dashboard", href: "/dashboard" },
    // { icon: "📊", label: "Portfolio", href: "/portfolio" },
    // { icon: "🎁", label: "Referral", href: "/referral" },
  ];

  return (
    <nav className="fixed top-0 flex items-center justify-center w-full">
      <div className="flex items-center gap-2 absolute top-6 left-6">
        <Link href="https://x.com/spongedotsol">
          <p className="text-3xl font-nanum">Sponge</p>
        </Link>
        <div className="text-sm">Powered by</div>
        <Image
          src="/hamburger.png"
          alt="menu"
          width={18}
          height={16}
          className="mr-2 w-auto h-auto"
        />
      </div>

      <div className="flex items-center justify-center gap-2 py-8">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.disabled ? "#" : item.href}
            className={`flex items-center px-4 font-semibold rounded-xl text-sm ${
              pathname === item.href
                ? "text-black"
                : "text-black/30 dark:text-gray-400 hover:text-black/40 dark:hover:bg-[#141921]"
            }`}
            {...(item.disabled ? { "aria-disabled": true } : {})}
          >
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
