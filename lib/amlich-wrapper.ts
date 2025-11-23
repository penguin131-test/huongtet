// Wrapper chuẩn cho âm lịch Việt Nam dùng thư viện "lunar-date-vn"

import { SolarDate as SolarDateLib, LunarDate as LunarDateLib } from "lunar-date-vn"

// Kiểu dữ liệu lunar trả về cho phần UI
// (có thêm Can Chi, tiết khí, giờ hoàng đạo)
export interface LunarDate {
  day: number
  month: number
  year: number
  leap: boolean
  dayName: string       // Can Chi ngày
  monthName: string     // Can Chi tháng
  yearName: string      // Can Chi năm
  solarTerm?: string    // Tiết khí (nếu có)
  luckyHours?: string[] // Giờ hoàng đạo dạng "23-1 (Tý)"
}

interface SolarDate {
  day: number
  month: number
  year: number
}

// Lấy thông tin âm lịch đầy đủ cho 1 Date dương
export function getLunarDate(solarDate: Date): LunarDate {
  // Tạo thực thể SolarDate từ JS Date
  const solar = new SolarDateLib(solarDate)
  // Đổi sang âm lịch
  const lunarEntity = solar.toLunarDate()
  const info: any = lunarEntity.get()

  // Can Chi
  const dayName = lunarEntity.getDayName()
  const monthName = lunarEntity.getMonthName()
  const yearName = lunarEntity.getYearName()

  // Tiết khí: thư viện có thể dùng getSolarTerm() hoặc getTietKhi()
  let solarTerm: string | undefined
  const anyEntity: any = lunarEntity as any
  if (typeof anyEntity.getSolarTerm === "function") {
    solarTerm = anyEntity.getSolarTerm()
  } else if (typeof anyEntity.getTietKhi === "function") {
    solarTerm = anyEntity.getTietKhi()
  }

  // Giờ hoàng đạo: dùng API getLuckyHours() nếu có
  let luckyHours: string[] | undefined
  if (typeof anyEntity.getLuckyHours === "function") {
    const raw = anyEntity.getLuckyHours() as Array<{ name: string; time: number[] }>
    luckyHours = raw.map((h) => `${h.time[0]}-${h.time[1]} (${h.name})`)
  }

  return {
    day: info.day,
    month: info.month,
    year: info.year,
    leap: !!info.leap_year,
    dayName,
    monthName,
    yearName,
    solarTerm,
    luckyHours,
  }
}

// Tính năm Can Chi cho “năm dương” đang chọn trong lịch
// Dùng ngày 1/7 của năm đó để đảm bảo đã qua Tết → cùng 1 năm âm lịch
export function getZodiacYear(solarYear: number): string {
  const midSolar = new SolarDateLib({ day: 1, month: 7, year: solarYear })
  const lunarEntity = midSolar.toLunarDate()
  return lunarEntity.getYearName() // ví dụ: "Giáp Thìn"
}

// 12 con giáp theo tháng âm (nếu UI cần dùng tới)
export function getChineseZodiacSign(lunarMonth: number): string {
  const signs = [
    "Tý",
    "Sửu",
    "Dần",
    "Mão",
    "Thìn",
    "Tỵ",
    "Ngọ",
    "Mùi",
    "Thân",
    "Dậu",
    "Tuất",
    "Hợi",
  ]
  return signs[Math.max(0, Math.min(11, (lunarMonth - 1) % 12))]
}

// Hàm giờ hoàng đạo đơn giản theo Can ngày (giữ lại nếu chỗ khác vẫn dùng)
// page.tsx hiện đã dùng luckyHours từ getLunarDate nên hàm này chỉ để tương thích.
export function getLuckyHours(lunarMonth: number, lunarDay: number): string[] {
  const stemOfDay = (lunarDay - 1) % 10
  const luckyHoursMap: Record<number, string[]> = {
    0: ["7-9", "11-13", "19-21"],
    1: ["5-7", "9-11", "15-17"],
    2: ["7-9", "13-15", "21-23"],
    3: ["9-11", "15-17", "23-1"],
    4: ["7-9", "11-13", "17-19"],
    5: ["5-7", "11-13", "19-21"],
    6: ["7-9", "15-17", "21-23"],
    7: ["5-7", "9-11", "17-19"],
    8: ["7-9", "11-13", "19-21"],
    9: ["9-11", "13-15", "21-23"],
  }
  return luckyHoursMap[stemOfDay] || ["9-11", "13-15", "19-21"]
}

// Tính ngày Tết (mùng 1 Tết âm lịch) trong 1 năm dương bất kỳ
export function getTetDateInYear(solarYear: number): {
  solarDate: SolarDate
  lunarDate: LunarDate
  name: string
  isHoliday: boolean
} {
  // Tết luôn rơi từ 21/01 đến 20/02 dương lịch
  const start = new Date(solarYear, 0, 21)
  const end = new Date(solarYear, 1, 20)

  for (
    let d = new Date(start.getTime());
    d.getTime() <= end.getTime();
    d.setDate(d.getDate() + 1)
  ) {
    const lunar = getLunarDate(d)
    if (lunar.day === 1 && lunar.month === 1) {
      return {
        solarDate: {
          day: d.getDate(),
          month: d.getMonth() + 1,
          year: d.getFullYear(),
        },
        lunarDate: lunar,
        name: "Tết Nguyên Đán",
        isHoliday: true,
      }
    }
  }

  // Fallback (không tìm được – gần như không xảy ra)
  const fallbackLunar = getLunarDate(start)
  return {
    solarDate: {
      day: start.getDate(),
      month: start.getMonth() + 1,
      year: start.getFullYear(),
    },
    lunarDate: fallbackLunar,
    name: "Tết Nguyên Đán (ước lượng)",
    isHoliday: true,
  }
}

// Nếu logic của bạn: “Năm Tết là solarYear + 1” thì giữ nguyên
export function getTetYear(solarYear: number): number {
  return solarYear + 1
}

// Không cần khởi tạo script ngoài nữa, giữ để không lỗi import
export function initializeAmLichCalendar(): void {
  // Không cần làm gì – đã dùng thư viện nội bộ
}

export function isToday(day: number, month: number, year: number): boolean {
  const today = new Date()
  return (
    today.getDate() === day &&
    today.getMonth() + 1 === month &&
    today.getFullYear() === year
  )
}
