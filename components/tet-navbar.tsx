"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Trang chủ" },
  { href: "/van-khan", label: "Văn khấn" },
  { href: "/cau-chuc-tet", label: "Câu chúc" },
  { href: "/lich-van-nien", label: "Lịch vạn niên" },
  { href: "/hieu-tet", label: "Hiểu tết" },
  { href: "/loc-tet", label: "Lộc tết" },
]

export function TetNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 backdrop-blur-md border-b",
        // Nền Noel: xanh đậm + nhấn đỏ
        "border-[#146B3A]/80 bg-gradient-to-r from-[#0b1f1a]/95 via-[#146B3A]/95 to-[#0b1f1a]/95"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-1 text-base font-bold tracking-wide">
          <span className="text-white">Hương Tết</span>
          <span className="text-[11px] font-medium" style={{ color: "#ffdfdf" }}>
            Đếm ngược &amp; tiện ích
          </span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all",
                // trạng thái bình thường
                "border-transparent text-white/80 hover:border-white/60 hover:bg-white/10 hover:text-white",
                // trạng thái active
                isActive(link.href) &&
                  "border-white bg-white text-sm text-[#BB2528] shadow-sm"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hamburger button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full border bg-white/90 md:hidden"
          style={{ borderColor: "#BB2528" }}
        >
          <span
            className={cn(
              "block h-[2px] w-5 transition-all",
              open && "translate-y-[7px] rotate-45"
            )}
            style={{ backgroundColor: "#BB2528" }}
          />
          <span
            className={cn(
              "block h-[2px] w-5 transition-all",
              open && "opacity-0"
            )}
            style={{ backgroundColor: "#BB2528" }}
          />
          <span
            className={cn(
              "block h-[2px] w-5 transition-all",
              open && "-translate-y-[7px] -rotate-45"
            )}
            style={{ backgroundColor: "#BB2528" }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t" style={{ borderColor: "#146B3A", backgroundColor: "rgba(11,31,26,0.96)" }}>
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-medium transition-all border",
                  // bình thường
                  "border-transparent text-white/80 hover:bg-white/10 hover:border-white/40 hover:text-white",
                  // active
                  isActive(link.href) &&
                    "border-white bg-white text-[#BB2528] shadow-sm"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
