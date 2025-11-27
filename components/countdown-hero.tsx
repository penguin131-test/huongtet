"use client"

import { useEffect, useMemo, useState } from "react"

// Danh sách ngày Tết dương lịch các năm
const TET_SOLAR_DATES: Record<number, { month: number; day: number }> = {
  2025: { month: 1, day: 29 },
  2026: { month: 2, day: 17 },
  2027: { month: 2, day: 6 },
  2028: { month: 1, day: 26 },
  2029: { month: 2, day: 13 },
  2030: { month: 2, day: 2 },
  2031: { month: 1, day: 23 },
  2032: { month: 2, day: 11 },
  2033: { month: 1, day: 31 },
}

function getUpcomingTet() {
  const now = new Date()
  const year = now.getFullYear()
  const tet = TET_SOLAR_DATES[year]
    ? new Date(year, TET_SOLAR_DATES[year].month - 1, TET_SOLAR_DATES[year].day)
    : new Date(year, 1, 1)

  if (now > tet) {
    const nextYear = year + 1
    const next = TET_SOLAR_DATES[nextYear]
      ? new Date(nextYear, next.month - 1, next.day)
      : new Date(nextYear, 1, 1)
    return next
  }

  return tet
}

export function CountdownHero() {
  const target = getUpcomingTet()
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const diff = target.getTime() - now

      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      setT({ d, h, m, s })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formattedDate = useMemo(() => {
    const d = String(target.getDate()).padStart(2, "0")
    const m = String(target.getMonth() + 1).padStart(2, "0")
    const y = target.getFullYear()
    return `${d}/${m}/${y}`
  }, [target])

  const FRAMES = [
    { label: "Ngày", value: t.d, src: "/frames/frame-day.png" },
    { label: "Giờ", value: t.h, src: "/frames/frame-hour.png" },
    { label: "Phút", value: t.m, src: "/frames/frame-minute.png" },
    { label: "Giây", value: t.s, src: "/frames/frame-second.png" },
  ]

  return (
    <section className="bg-[#fff8f0] py-8">
      <div className="mx-auto max-w-6xl px-4">
        
        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-red-900 text-center mb-3">
          Đếm ngược đến Tết Nguyên Đán {target.getFullYear()}
        </h1>

        <p className="text-center text-red-800 mb-6">
          Tết năm nay rơi vào ngày <b>{formattedDate}</b>
        </p>

        {/* GRID FRAME FULL IMAGE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FRAMES.map((box) => (
            <div
              key={box.label}
              className="relative w-full"
              style={{
                aspectRatio: "1 / 1",
              }}
            >
              {/* Frame tràn viền toàn bộ */}
              <img
                src={box.src}
                alt={box.label}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Nội dung nằm trên "lỗ" frame */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                
                {/* Số */}
                <p
                  className="tet-countdown-font text-4xl sm:text-5xl md:text-6xl font-bold text-red-700"
                  style={{ textShadow: "0 0 6px rgba(255, 255, 255, 0.9)" }}
                >
                  {String(box.value).padStart(2, "0")}
                </p>

                {/* Label */}
                <p
                  className="tet-countdown-font text-xl sm:text-2xl text-red-700 mt-1"
                  style={{ textShadow: "0 0 4px rgba(255, 255, 255, 0.9)" }}
                >
                  {box.label}
                </p>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
