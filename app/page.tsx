"use client"

import { useEffect, useState } from "react"
import { CountdownHero } from "@/components/countdown-hero"
import { EventClocks } from "@/components/event-clocks"
import { TodayOverview } from "@/components/today-overview"
import { QuickLinks } from "@/components/quick-links"
import { GamificationPreview } from "@/components/gamification-preview"
import { CultureSnippets } from "@/components/culture-snippets"
import { Footer } from "@/components/footer"

type HolidayEvent = {
  name: string
  month: number
  day: number
}

type NextHoliday = HolidayEvent & { date: Date }

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const HOLIDAYS: HolidayEvent[] = [
  { day: 1, month: 1, name: "Tết Dương lịch" },
  { day: 9, month: 1, name: "Ngày Học sinh – Sinh viên Việt Nam" },
  { day: 3, month: 2, name: "Ngày thành lập Đảng CSVN" },
  { day: 14, month: 2, name: "Lễ Tình nhân (Valentine)" },
  { day: 27, month: 2, name: "Ngày Thầy thuốc Việt Nam" },
  { day: 8, month: 3, name: "Ngày Quốc tế Phụ nữ" },
  { day: 26, month: 3, name: "Ngày thành lập Đoàn TNCS Hồ Chí Minh" },
  { day: 30, month: 4, name: "Ngày Giải phóng miền Nam" },
  { day: 1, month: 5, name: "Ngày Quốc tế Lao động" },
  { day: 7, month: 5, name: "Ngày Chiến thắng Điện Biên Phủ" },
  { day: 19, month: 5, name: "Ngày sinh Chủ tịch Hồ Chí Minh" },
  { day: 1, month: 6, name: "Ngày Quốc tế Thiếu nhi" },
  { day: 21, month: 6, name: "Ngày Báo chí Cách mạng Việt Nam" },
  { day: 28, month: 6, name: "Ngày Gia đình Việt Nam" },
  { day: 27, month: 7, name: "Ngày Thương binh – Liệt sĩ" },
  { day: 19, month: 8, name: "Ngày Cách mạng Tháng Tám" },
  { day: 2, month: 9, name: "Quốc khánh nước CHXHCN Việt Nam" },
  { day: 5, month: 9, name: "Ngày khai giảng năm học mới" },
  { day: 10, month: 10, name: "Ngày Giải phóng Thủ đô" },
  { day: 13, month: 10, name: "Ngày Doanh nhân Việt Nam" },
  { day: 20, month: 10, name: "Ngày Phụ nữ Việt Nam" },
  { day: 31, month: 10, name: "Lễ hội Halloween" },
  { day: 9, month: 11, name: "Ngày Pháp luật Việt Nam" },
  { day: 19, month: 11, name: "Ngày Quốc tế Nam giới" },
  { day: 20, month: 11, name: "Ngày Nhà giáo Việt Nam" },
  { day: 22, month: 12, name: "Ngày thành lập Quân đội Nhân dân Việt Nam" },
  { day: 24, month: 12, name: "Lễ Giáng sinh (Noel)" },
  { day: 25, month: 12, name: "Lễ Giáng sinh (Noel)" },
]

// Hôm nay có phải ngày lễ dương lịch không
function getTodayHoliday(date: Date): HolidayEvent | null {
  const m = date.getMonth() + 1
  const d = date.getDate()
  return HOLIDAYS.find((h) => h.month === m && h.day === d) ?? null
}

// Ngày lễ gần nhất tiếp theo (tính cả sang năm sau)
function getNextHoliday(from: Date): NextHoliday | null {
  const year = from.getFullYear()
  const nowTime = from.getTime()

  const candidates: NextHoliday[] = HOLIDAYS.map((h) => {
    let date = new Date(year, h.month - 1, h.day, 0, 0, 0, 0)
    if (date.getTime() <= nowTime) {
      date = new Date(year + 1, h.month - 1, h.day, 0, 0, 0, 0)
    }
    return { ...h, date }
  })

  candidates.sort((a, b) => a.date.getTime() - b.date.getTime())
  return candidates[0] ?? null
}

function getTimeLeft(target: Date, from: Date): TimeLeft {
  const diffMs = target.getTime() - from.getTime()
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))

  const days = Math.floor(totalSeconds / (3600 * 24))
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

// Kiểm tra nextHoliday có phải là "ngày mai" (theo lịch dương) của now không
function isTomorrow(next: Date, now: Date): boolean {
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startNext = new Date(next.getFullYear(), next.getMonth(), next.getDate())
  const oneDay = 1000 * 60 * 60 * 24
  const diffDays = Math.round((startNext.getTime() - startToday.getTime()) / oneDay)
  return diffDays === 1
}

function PinnedNextHolidayClock() {
  const [now, setNow] = useState<Date>(() => new Date())
  const [nextHoliday, setNextHoliday] = useState<NextHoliday | null>(null)
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Cập nhật nextHoliday & timeLeft mỗi khi "now" thay đổi
  useEffect(() => {
    const next = getNextHoliday(now)
    if (!next) {
      setNextHoliday(null)
      setTimeLeft(null)
      return
    }

    setNextHoliday(next)
    setTimeLeft(getTimeLeft(next.date, now))
  }, [now])

  const todayHoliday = getTodayHoliday(now)
  const isAfter22h = now.getHours() >= 22

  // Nếu hôm nay là lễ và có lễ tiếp theo (trong state), kiểm tra "gần nhau 1 ngày" + sau 22h
  const showCountdownEvenOnHoliday =
    !!todayHoliday &&
    !!nextHoliday &&
    isAfter22h &&
    isTomorrow(nextHoliday.date, now)

  // Nếu HÔM NAY là ngày lễ và chưa đến "mode 22h đếm lễ hôm sau" → hiện info lễ, không countdown
  if (todayHoliday && !showCountdownEvenOnHoliday) {
    const dateLabel = `${String(todayHoliday.day).padStart(2, "0")}/${String(
      todayHoliday.month,
    ).padStart(2, "0")}/${now.getFullYear()}`

    const wish = `Chúc bạn có một ngày ${todayHoliday.name.toLowerCase()} thật vui vẻ, bình an và nhẹ nhàng.`
    const reminder =
      "Đừng quên dành một chút thời gian để nghỉ ngơi và làm điều gì đó ý nghĩa cho bản thân hoặc người thân nhé."

    return (
      <div className="fixed inset-x-4 bottom-4 z-40 max-w-sm sm:inset-x-auto sm:right-6 sm:bottom-6">
        <div className="flex items-center gap-3 rounded-3xl border border-emerald-300 bg-white/95 px-4 py-3 shadow-[0_12px_30px_rgba(8,47,35,0.45)] backdrop-blur-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 bg-[#e8fff4] text-[11px] font-semibold text-[#BB2528]">
            Lễ
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#BB2528]">
                Hôm nay là ngày lễ
              </p>
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] text-[#BB2528]">
                Đồng hồ phụ
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-[#BB2528]">
              {todayHoliday.name}
            </p>
            <p className="text-xs text-red-50/90">{dateLabel}</p>
            <p className="mt-1 text-xs text-white/90">{wish}</p>
          </div>
        </div>
      </div>
    )
  }

  // Còn lại: hoặc không phải lễ, hoặc là lễ nhưng đã 22h & ngày mai là lễ → countdown tới nextHoliday
  if (!nextHoliday || !timeLeft) return null

  const dateLabel = `${String(nextHoliday.day).padStart(2, "0")}/${String(
    nextHoliday.month,
  ).padStart(2, "0")}/${nextHoliday.date.getFullYear()}`

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 max-w-sm sm:inset-x-auto sm:right-6 sm:bottom-6">
      <div className="flex items-center gap-3 rounded-3xl border border-emerald-300 bg-white/95 px-4 py-3 shadow-[0_12px_30px_rgba(8,47,35,0.45)] backdrop-blur-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300 bg-[#e8fff4] text-xs font-semibold text-[#BB2528]">
          Tết
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#BB2528]">
              Ngày lễ gần nhất
            </p>
            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] text-[#BB2528]">
              Đồng hồ phụ
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-[#BB2528]">
            {nextHoliday.name}
          </p>
          <p className="text-xs text-slate-700/90">
            {dateLabel} ·{" "}
            <span className="font-semibold text-[#BB2528]">
              Còn {timeLeft.days} ngày nữa
            </span>
          </p>

          {/* Đồng hồ countdown nhỏ */}
          <div className="mt-2 flex gap-1 text-[11px] font-mono text-[#BB2528]">
            <div className="min-w-[3ch] rounded-md border border-emerald-200 bg-[#e8fff4] px-1.5 py-0.5 text-center">
              {timeLeft.days.toString().padStart(2, "0")}d
            </div>
            <div className="min-w-[3ch] rounded-md border border-emerald-200 bg-[#e8fff4] px-1.5 py-0.5 text-center">
              {timeLeft.hours.toString().padStart(2, "0")}h
            </div>
            <div className="min-w-[3ch] rounded-md border border-emerald-200 bg-[#e8fff4] px-1.5 py-0.5 text-center">
              {timeLeft.minutes.toString().padStart(2, "0")}m
            </div>
            <div className="min-w-[3ch] rounded-md border border-emerald-200 bg-[#e8fff4] px-1.5 py-0.5 text-center">
              {timeLeft.seconds.toString().padStart(2, "0")}s
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type Snowflake = {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
}

const SNOWFLAKE_COUNT = 80

export default function Home() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])

  useEffect(() => {
    const flakes: Snowflake[] = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 10,
      size: 8 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.5,
    }))
    setSnowflakes(flakes)
  }, [])

  return (
    <main className="relative min-h-screen noel-bg overflow-hidden">
      {/* Tầng tuyết rơi */}
      <div className="pointer-events-none fixed inset-0 z-10 snow-layer">
        {snowflakes.map((flake) => (
          <span
            key={flake.id}
            className="snowflake"
            style={{
              left: `${flake.left}%`,
              animationDuration: `${flake.duration}s`,
              animationDelay: `${flake.delay}s`,
              fontSize: `${flake.size}px`,
              opacity: flake.opacity,
            }}
          >
            ❄
          </span>
        ))}
      </div>

      {/* Trang trí Noel */}
      <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
        <img
          src="/noel/socks.png"
          alt="Tất Noel dễ thương"
          className="h-24 sm:h-28 md:h-32 noel-deco-swing noel-deco-glow"
        />
      </div>

      <div className="pointer-events-none absolute bottom-4 left-2 z-20 hidden sm:block">
        <img
          src="/noel/tree.png"
          alt="Cây thông Noel"
          className="h-32 md:h-40 noel-deco-float noel-deco-glow"
        />
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 z-20 hidden sm:block">
        <img
          src="/noel/santa.png"
          alt="Ông già Noel"
          className="h-28 md:h-36 noel-deco-float-slow noel-deco-glow"
        />
      </div>

      <div className="pointer-events-none absolute top-[30%] right-2 z-20 hidden md:block">
        <img
          src="/noel/penguin.png"
          alt="Penguin Noel"
          className="h-24 noel-deco-bounce noel-deco-glow"
        />
      </div>

      {/* Nội dung chính */}
      <div className="relative z-30">
        <CountdownHero />

        <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
          <EventClocks />
          <TodayOverview />
          <QuickLinks />
          <GamificationPreview />
          <CultureSnippets />
        </div>

        <PinnedNextHolidayClock />

        <Footer />
      </div>
    </main>
  )
}
