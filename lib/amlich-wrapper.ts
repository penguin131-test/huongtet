// src/lib/amlich-wrapper.ts
// Wrapper cho thư viện @nghiavuive/lunar_date_vi
// → Trả về: Âm lịch + Can Chi + Tiết khí + giờ hoàng đạo

import { SolarDate, LunarDate } from "@nghiavuive/lunar_date_vi"

export interface BasicLunarDate {
  day: number
  month: number
  year: number
  // Can Chi
  yearName: string
  monthName: string
  dayName: string
  hourName: string
  // Tiết khí
  solarTerm: string
  // Giờ hoàng đạo dạng "Tý (23–1h)"
  luckyHours: string[]
}

/**
 * Tạo đầy đủ thông tin Âm lịch từ Date dương
 */
function buildLunarFromDate(date: Date): BasicLunarDate {
  // Tạo SolarDate từ ngày dương
  const solar = new SolarDate(date as any)

  // Chuyển sang LunarDate
  // Tuỳ API lib: có thể là SolarDate.toLunarDate(...) hoặc solar.toLunarDate()
  let lunar: any
  if (typeof (SolarDate as any).toLunarDate === "function") {
    lunar = (SolarDate as any).toLunarDate(solar)
  } else if (typeof (solar as any).toLunarDate === "function") {
    lunar = (solar as any).toLunarDate()
  } else if (typeof (LunarDate as any).fromSolarDate === "function") {
    lunar = (LunarDate as any).fromSolarDate(solar)
  } else {
    throw new Error(
      "Không tìm được hàm chuyển Solar -> Lunar trong @nghiavuive/lunar_date_vi. Cần kiểm tra lại API."
    )
  }

  // Nếu lib có hàm init() thì gọi để tính thêm field
  if (typeof lunar.init === "function") {
    lunar.init()
  }

  // Lấy raw data (phụ thuộc lib – nhiều lib có hàm get())
  const raw = typeof lunar.get === "function" ? lunar.get() : lunar

  const year = Number(raw.year)
  const month = Number(raw.month)
  const day = Number(raw.day)

  // Can Chi
  const yearName: string =
    (typeof lunar.getYearName === "function" && lunar.getYearName()) ||
    (raw.year_name as string) ||
    ""
  const monthName: string =
    (typeof lunar.getMonthName === "function" && lunar.getMonthName()) ||
    (raw.month_name as string) ||
    ""
  const dayName: string =
    (typeof lunar.getDayName === "function" && lunar.getDayName()) ||
    (raw.day_name as string) ||
    ""
  const hourName: string =
    (typeof lunar.getHourName === "function" && lunar.getHourName()) ||
    (raw.hour_name as string) ||
    ""

  // Tiết khí (nếu lib có)
  const solarTerm: string =
    (typeof lunar.getSolarTerm === "function" && lunar.getSolarTerm()) ||
    (typeof lunar.getTietKhi === "function" && lunar.getTietKhi()) ||
    (raw.solar_term as string) ||
    ""

  // Giờ hoàng đạo
  const rawLucky =
    (typeof lunar.getLuckyHours === "function" && lunar.getLuckyHours()) ||
    (raw.lucky_hours as any) ||
    []

  const luckyHours: string[] = Array.isArray(rawLucky)
    ? rawLucky.map((h: any) => {
        const name = h.name ?? ""
        const time = h.time ?? []
        if (Array.isArray(time) && time.length === 2) {
          const [start, end] = time
          return `${name} (${start}–${end}h)`
        }
        return name
      })
    : []

  return {
    day,
    month,
    year,
    yearName,
    monthName,
    dayName,
    hourName,
    solarTerm,
    luckyHours,
  }
}

/**
 * Hàm chính dùng trong UI
 */
export function getLunarDate(date: Date): BasicLunarDate {
  return buildLunarFromDate(date)
}

/**
 * Lấy Can Chi năm dương lịch (vd: "Giáp Thìn")
 */
export function getZodiacYear(year: number): string {
  // Lấy 1 ngày bất kỳ trong năm (1/1)
  const solar = new SolarDate(new Date(year, 0, 1) as any)

  let lunar: any
  if (typeof (SolarDate as any).toLunarDate === "function") {
    lunar = (SolarDate as any).toLunarDate(solar)
  } else if (typeof (solar as any).toLunarDate === "function") {
    lunar = (solar as any).toLunarDate()
  } else if (typeof (LunarDate as any).fromSolarDate === "function") {
    lunar = (LunarDate as any).fromSolarDate(solar)
  } else {
    return ""
  }

  if (typeof lunar.init === "function") {
    lunar.init()
  }

  const raw = typeof lunar.get === "function" ? lunar.get() : lunar

  return (
    (typeof lunar.getYearName === "function" && lunar.getYearName()) ||
    (raw.year_name as string) ||
    ""
  )
}

/**
 * "Con giáp" hiển thị trong TodayOverview:
 * → chính là Can Chi năm âm lịch
 */
export function getChineseZodiacSign(date: Date): string {
  const lunar = getLunarDate(date)
  return lunar.yearName
}

/**
 * Giờ hoàng đạo cho 1 ngày
 */
export function getLuckyHoursForDate(date: Date): string[] {
  const lunar = getLunarDate(date)
  return lunar.luckyHours
}

/**
 * Tiết khí cho 1 ngày
 */
export function getSolarTermForDate(date: Date): string {
  const lunar = getLunarDate(date)
  return lunar.solarTerm
}

/**
 * Kiểm tra ngày dương có phải hôm nay không
 */
export function isToday(day: number, month: number, year: number): boolean {
  const now = new Date()
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  )
}
