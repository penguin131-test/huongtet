"use client"

import { useEffect, useMemo, useState } from "react"

const TET_SOLAR_DATES: Record<number, { month: number; day: number }> = {
  2025: { month: 1, day: 29 },
  2026: { month: 2, day: 17 },
  2027: { month: 2, day: 6 },
  2028: { month: 1, day: 26 },
  2029: { month: 2, day: 13 },
  2030: { month: 2, day: 2 },
  2031: { month: 1, day: 23 },
}

type CountdownState = {
  days: number
  hours: number
  minutes: number
  seconds: number
  targetYear: number
  targetDate: Date
}

function getUpcomingTet(from: Date): CountdownState {
  const now = from
  const year = now.getFullYear()

  const getTetDateForYear = (y: number): Date => {
    const info = TET_SOLAR_DATES[y]
    if (!info) return new Date(y, 1, 1)
    return new Date(y, info.month - 1, info.day)
  }

  let targetYear = year
  let targetDate = getTetDateForYear(year)

  if (now >= targetDate) {
    targetYear = year + 1
    targetDate = getTetDateForYear(targetYear)
  }

  const diffMs = Math.max(0, targetDate.getTime() - now.getTime())
  const totalSeconds = Math.floor(diffMs / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds, targetYear, targetDate }
}

function useTetCountdown(): CountdownState {
  const [state, setState] = useState<CountdownState>(() => getUpcomingTet(new Date()))

  useEffect(() => {
    const timer = setInterval(() => {
      setState(getUpcomingTet(new Date()))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return state
}

export function CountdownHero() {
  const { days, hours, minutes, seconds, targetYear, targetDate } = useTetCountdown()

  const formattedDate = useMemo(() => {
    const d = String(targetDate.getDate()).padStart(2, "0")
    const m = String(targetDate.getMonth() + 1).padStart(2, "0")
    const y = targetDate.getFullYear()
    return `${d}/${m}/${y}`
  }, [targetDate])

  const boxes = [
    { label: "Ngày", value: days, frame: "/frames/frame-day.png" },
    { label: "Giờ", value: hours, frame: "/frames/frame-hour.png" },
    { label: "Phút", value: minutes, frame: "/frames/frame-minute.png" },
    { label: "Giây", value: seconds, frame: "/frames/frame-second.png" },
  ]

  return (
    <section className="bg-[#fff8f0] py-8">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-center text-3xl md:text-4xl font-extrabold text-red-900 mb-3">
          Đếm ngược đến Tết Nguyên Đán {targetYear}
        </h1>
        <p className="text-center text-red-800 mb-6">
          Tết năm nay rơi vào ngày <b>{formattedDate}</b>
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {boxes.map((box) => (
            <div
              key={box.label}
              className="relative w-full"
              style={{ aspectRatio: "1 / 1" }}
            >
              <img
                src={box.frame}
                alt={box.label}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p
                  className="tet-countdown-font text-4xl sm:text-5xl md:text-6xl font-bold text-red-700"
                  style={{ textShadow: "0 0 6px rgba(255,255,255,0.9)" }}
                >
                  {String(box.value).padStart(2, "0")}
                </p>
                <p
                  className="tet-countdown-font mt-1 text-xl sm:text-2xl text-red-700"
                  style={{ textShadow: "0 0 4px rgba(255,255,255,0.9)" }}
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
