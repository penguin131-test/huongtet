"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getLunarDate, isToday } from "@/lib/amlich-wrapper"

// ================== TYPES & HÀM PHỤ ==================

type HolidayType = "duong" | "am"

interface HolidayDefinition {
  day: number
  month: number
  name: string
  isOff: boolean
  note?: string
}

interface HolidayInfo extends HolidayDefinition {
  type: HolidayType
}

interface CalendarDay {
  solar: number
  lunar: { day: number; month: number; year: number }
  isToday: boolean
  canChi: string
  date: Date
  holidays: HolidayInfo[]
}

interface PersonalEvent {
  id: string
  title: string
  date: {
    day: number
    month: number
    year: number
  }
}

interface SolarTermInYear {
  name: string
  date: Date
}

type SeasonalEffect = "none" | "noel" | "tet" | "trungthu"

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`)

// Dải nghỉ Tết Nguyên Đán: 28/12 → 05/01 âm lịch
const isTetHolidayRange = (lunar: { day: number; month: number }) => {
  if (!lunar) return false
  if (lunar.month === 12 && lunar.day >= 28) return true
  if (lunar.month === 1 && lunar.day <= 5) return true
  return false
}

// Tính độ dài tháng âm cho một ngày bất kỳ trong tháng đó (29 hoặc 30)
const getLunarMonthLengthForDate = (date: Date): number => {
  let d = new Date(date)
  let lunar = getLunarDate(d)
  let safety = 60

  // Lùi về mùng 1 âm
  while (lunar.day > 1 && safety > 0) {
    d.setDate(d.getDate() - 1)
    lunar = getLunarDate(d)
    safety--
  }

  const baseMonth = lunar.month
  const baseYear = lunar.year
  let maxDay = lunar.day
  safety = 60

  // Tiến dần tới hết tháng
  while (safety > 0) {
    d.setDate(d.getDate() + 1)
    const l = getLunarDate(d)
    if (l.month !== baseMonth || l.year !== baseYear) break
    maxDay = l.day
    safety--
  }

  return maxDay
}

const weekdayShortHeader = ["HAI", "BA", "TƯ", "NĂM", "SÁU", "BẢY", "CN"]
const weekdayFull = [
  "CHỦ NHẬT",
  "THỨ HAI",
  "THỨ BA",
  "THỨ TƯ",
  "THỨ NĂM",
  "THỨ SÁU",
  "THỨ BẢY",
]

// Tuần ISO
const getISOWeek = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7)
}

// Ngày thứ bao nhiêu trong năm
const getDayOfYear = (d: Date) => {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// ================== CA DAO / TỤC NGỮ & CHÚC TẾT ==================

const PROVERBS: string[] = [
  "Có công mài sắt, có ngày nên kim.",
  "Uống nước nhớ nguồn.",
  "Ăn quả nhớ kẻ trồng cây.",
  "Tiên học lễ, hậu học văn.",
  "Tích tiểu thành đại.",
  "Gần mực thì đen, gần đèn thì sáng.",
  "Đi một ngày đàng, học một sàng khôn.",
  "Học ăn, học nói, học gói, học mở.",
  "Không thầy đố mày làm nên.",
  "Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao.",
  "Có chí thì nên.",
  "Chậm mà chắc.",
  "Lửa thử vàng, gian nan thử sức.",
  "Thất bại là mẹ thành công.",
  "Đời phải trải qua giông tố nhưng đừng cúi đầu trước giông tố.",
  "Đói cho sạch, rách cho thơm.",
  "Tốt gỗ hơn tốt nước sơn.",
  "Hữu xạ tự nhiên hương.",
  "Khó khăn thử thách lòng người.",
  "Đoàn kết là sức mạnh.",
  "Một nụ cười bằng mười thang thuốc bổ.",
  "Vạn sự khởi đầu nan.",
  "Trèo cao ngã đau.",
  "Biết người biết ta, trăm trận trăm thắng.",
  "Học, học nữa, học mãi.",
  "Điều gì không giết được bạn sẽ làm bạn mạnh mẽ hơn.",
  "An cư lạc nghiệp.",
  "Có làm thì mới có ăn.",
  "Ăn chắc mặc bền.",
  "Ăn no nghĩ dại, làm nhiều nghĩ khôn.",
  "Ở hiền gặp lành.",
  "Ở bầu thì tròn, ở ống thì dài.",
  "Thời gian là vàng bạc.",
  "Nhàn cư vi bất thiện.",
  "Trọng nghĩa khinh tài.",
  "Lời nói chẳng mất tiền mua, lựa lời mà nói cho vừa lòng nhau.",
  "Đừng thấy đỏ tưởng là chín.",
  "Không ai giàu ba họ, không ai khó ba đời.",
  "Giàu vì bạn, sang vì vợ.",
  "Một miếng khi đói bằng một gói khi no.",
  "Tương thân tương ái.",
  "Lá lành đùm lá rách.",
  "Nhập gia tùy tục.",
  "Được voi đòi tiên.",
  "Tham thì thâm.",
  "Cần cù bù thông minh.",
  "Có sức khỏe là có tất cả.",
  "Không vào hang cọp sao bắt được cọp con.",
  "Biết thì thưa thốt, không biết thì dựa cột mà nghe.",
  "Trăm hay không bằng tay quen.",
  "Khéo ăn thì no, khéo co thì ấm.",
  "Học thầy không tày học bạn.",
  "Hữu duyên thiên lý năng tương ngộ.",
  "Nhân nào quả nấy.",
  "Gieo gió gặt bão.",
  "Đường dài mới biết ngựa hay, ở lâu mới biết người ngay kẻ tà.",
  "Một lần bất tín, vạn lần bất tin.",
  "Dục tốc bất đạt.",
  "Nước chảy đá mòn.",
]

const TET_GREETINGS: string[] = [
  "Chúc bạn năm mới an khang, thịnh vượng, vạn sự như ý! 🎉",
  "Chúc một năm mới bình an, sức khỏe dồi dào, học hành tấn tới! 📚",
  "Tết đến xuân về, chúc mọi điều tốt đẹp nhất sẽ đến với bạn! 🌸",
  "Chúc bạn và gia đình một năm mới ấm no, hạnh phúc, tràn đầy tiếng cười! 🧧",
  "Năm mới, chúc bạn mạnh mẽ, kiên trì và đạt được mọi mục tiêu đã đặt ra! 🚀",
  "Chúc năm mới lộc vào như nước, tài đến bất ngờ, niềm vui ngập tràn! 💰",
]

// ================== ẢNH CON GIÁP ==================

const ZODIAC_IMAGES: Record<string, string> = {
  Tý: "/zodiacs/ty.png",
  Sửu: "/zodiacs/suu.png",
  Dần: "/zodiacs/dan.png",
  Mão: "/zodiacs/mao.png",
  Thìn: "/zodiacs/thin.png",
  Tỵ: "/zodiacs/ty_ran.png",
  Ngọ: "/zodiacs/ngo.png",
  Mùi: "/zodiacs/mui.png",
  Thân: "/zodiacs/than.png",
  Dậu: "/zodiacs/dau.png", // ảnh bạn gửi, nhớ đặt đúng đường dẫn
  Tuất: "/zodiacs/tuat.png",
  Hợi: "/zodiacs/hoi.png",
}

const getZodiacFromYearName = (yearName?: string | null) => {
  if (!yearName) return null
  const parts = yearName.trim().split(/\s+/)
  const branch = parts[parts.length - 1] // Tý / Sửu / ...
  const image = ZODIAC_IMAGES[branch]
  if (!image) return null
  return { branch, image }
}

// ================== DANH SÁCH NGÀY LỄ ==================

// DƯƠNG LỊCH
const SOLAR_HOLIDAYS: HolidayDefinition[] = [
  { day: 1, month: 1, name: "Tết Dương lịch", isOff: true },
  { day: 9, month: 1, name: "Ngày Học sinh - Sinh viên Việt Nam", isOff: false },
  { day: 3, month: 2, name: "Ngày thành lập Đảng CSVN", isOff: false },
  { day: 14, month: 2, name: "Lễ Tình nhân (Valentine)", isOff: false },
  { day: 27, month: 2, name: "Ngày Thầy thuốc Việt Nam", isOff: false },
  { day: 8, month: 3, name: "Ngày Quốc tế Phụ nữ", isOff: false },
  { day: 26, month: 3, name: "Ngày thành lập Đoàn TNCS Hồ Chí Minh", isOff: false },
  { day: 30, month: 4, name: "Ngày Giải phóng miền Nam", isOff: true },
  { day: 1, month: 5, name: "Ngày Quốc tế Lao động", isOff: true },
  { day: 7, month: 5, name: "Ngày Chiến thắng Điện Biên Phủ", isOff: false },
  { day: 19, month: 5, name: "Ngày sinh Chủ tịch Hồ Chí Minh", isOff: false },
  { day: 1, month: 6, name: "Ngày Quốc tế Thiếu nhi", isOff: false },
  { day: 21, month: 6, name: "Ngày Báo chí Cách mạng Việt Nam", isOff: false },
  { day: 28, month: 6, name: "Ngày Gia đình Việt Nam", isOff: false },
  { day: 27, month: 7, name: "Ngày Thương binh - Liệt sĩ", isOff: false },
  { day: 19, month: 8, name: "Ngày Cách mạng Tháng Tám", isOff: false },
  {
    day: 2,
    month: 9,
    name: "Quốc khánh nước CHXHCN Việt Nam",
    isOff: true,
    note: "Nghỉ 2 ngày theo quy định",
  },
  {
    day: 5,
    month: 9,
    name: "Ngày khai giảng năm học mới",
    isOff: false,
    note: "Thường chỉ học sinh / giáo viên nghỉ dạy",
  },
  { day: 10, month: 10, name: "Ngày Giải phóng Thủ đô", isOff: false },
  { day: 13, month: 10, name: "Ngày Doanh nhân Việt Nam", isOff: false },
  { day: 20, month: 10, name: "Ngày Phụ nữ Việt Nam", isOff: false },
  { day: 31, month: 10, name: "Lễ hội Halloween", isOff: false },
  { day: 9, month: 11, name: "Ngày Pháp luật Việt Nam", isOff: false },
  { day: 19, month: 11, name: "Ngày Quốc tế Nam giới", isOff: false },
  {
    day: 20,
    month: 11,
    name: "Ngày Nhà giáo Việt Nam",
    isOff: false,
    note: "Giáo viên thường được nghỉ dạy hoặc giảm tiết",
  },
  { day: 22, month: 12, name: "Ngày thành lập Quân đội Nhân dân Việt Nam", isOff: false },
  {
    day: 24,
    month: 12,
    name: "Lễ Giáng sinh (Noel)",
    isOff: false,
    note: "Một số DN nước ngoài / Công giáo có thể được nghỉ",
  },
  {
    day: 25,
    month: 12,
    name: "Lễ Giáng sinh (Noel)",
    isOff: false,
    note: "Một số DN nước ngoài / Công giáo có thể được nghỉ",
  },
]

// ÂM LỊCH
const LUNAR_HOLIDAYS: HolidayDefinition[] = [
  {
    day: 1,
    month: 1,
    name: "Tết Nguyên Đán",
    isOff: true,
    note: "Nghỉ 5 ngày chính thức (theo nhà nước)",
  },
  {
    day: 2,
    month: 1,
    name: "Tết Nguyên Đán",
    isOff: true,
    note: "Nghỉ 5 ngày chính thức (theo nhà nước)",
  },
  {
    day: 3,
    month: 1,
    name: "Tết Nguyên Đán",
    isOff: true,
    note: "Nghỉ 5 ngày chính thức (theo nhà nước)",
  },
  {
    day: 4,
    month: 1,
    name: "Tết Nguyên Đán",
    isOff: true,
    note: "Nghỉ 5 ngày chính thức (theo nhà nước)",
  },
  {
    day: 5,
    month: 1,
    name: "Tết Nguyên Đán",
    isOff: true,
    note: "Nghỉ 5 ngày chính thức (theo nhà nước)",
  },

  { day: 15, month: 1, name: "Tết Nguyên Tiêu (Rằm tháng Giêng)", isOff: false },
  { day: 3, month: 3, name: "Tết Hàn Thực", isOff: false, note: "Ngày ăn bánh trôi, bánh chay" },
  { day: 10, month: 3, name: "Giỗ Tổ Hùng Vương", isOff: true },
  { day: 15, month: 4, name: "Lễ Phật Đản", isOff: false },
  { day: 5, month: 5, name: "Tết Đoan Ngọ", isOff: false },
  { day: 7, month: 7, name: "Lễ Thất Tịch", isOff: false },
  { day: 15, month: 7, name: "Lễ Vu Lan (Rằm tháng Bảy)", isOff: false },
  { day: 15, month: 8, name: "Tết Trung Thu", isOff: false },
  { day: 23, month: 12, name: "Tết Ông Công, Ông Táo", isOff: false },
]

// ================== GỢI Ý THEO NGÀY / TIẾT KHÍ ==================

function getDailySuggestions(lunarDay: number, lunarMonth: number, solarTerm?: string) {
  const suggestions: string[] = []

  if (lunarDay <= 10) {
    suggestions.push(
      "Đầu tháng âm lịch – rất hợp để bắt đầu thói quen tốt hoặc kế hoạch nhỏ.",
      "Dọn lại bàn học / góc làm việc, bỏ bớt giấy tờ cũ không cần thiết."
    )
  } else if (lunarDay <= 20) {
    suggestions.push(
      "Giữa tháng âm – thời điểm tốt để rà soát lại tiến độ học tập / công việc.",
      "Hoàn thiện nốt các việc đang làm dở thay vì mở thêm việc mới."
    )
  } else {
    suggestions.push(
      "Cuối tháng âm – hợp để tổng kết nhẹ: xem lại việc đã làm, rút kinh nghiệm.",
      "Sắp xếp file, tài liệu, dọn lại thư viện tài liệu / Google Drive cho gọn."
    )
  }

  if (solarTerm) {
    const lower = solarTerm.toLowerCase()
    if (lower.includes("xuân")) {
      suggestions.push("Tiết khí đang gần mùa xuân – ưu tiên chăm sức khỏe, ngủ đủ, ăn uống lành mạnh.")
    } else if (lower.includes("hạ")) {
      suggestions.push("Tiết khí mùa hạ – uống đủ nước, tránh thức khuya nhiều, hạn chế đồ ăn quá nóng.")
    } else if (lower.includes("thu")) {
      suggestions.push("Tiết khí mùa thu – phù hợp để ngồi lại suy nghĩ, chỉnh lại kế hoạch dài hạn.")
    } else if (lower.includes("đông") || lower.includes("hàn")) {
      suggestions.push("Thời tiết dễ lạnh – chú ý giữ ấm, hạn chế thức khuya, tăng vận động nhẹ trong phòng.")
    }
  }

  return suggestions
}

// ================== HIỆU ỨNG THEO MÙA ==================

function getSeasonalEffectForDate(
  solar: Date,
  lunar: ReturnType<typeof getLunarDate>
): SeasonalEffect {
  const month = solar.getMonth() + 1

  // Noel: từ THÁNG 11 đến hết THÁNG 12 dương lịch đều có tuyết rơi
  if (month === 11 || month === 12) {
    return "noel"
  }

  // Tết âm: 23–30 tháng Chạp, + mùng 1–7 tháng Giêng
  if (
    (lunar.month === 12 && lunar.day >= 23) ||
    (lunar.month === 1 && lunar.day <= 7)
  ) {
    return "tet"
  }

  // Trung Thu: 10–18/8 âm
  if (lunar.month === 8 && lunar.day >= 10 && lunar.day <= 18) {
    return "trungthu"
  }

  return "none"
}

const SeasonalEffects: React.FC<{ effect: SeasonalEffect }> = ({ effect }) => {
  if (effect === "none") return null

  const items = Array.from({ length: 24 })
  let symbols: string[] = []
  if (effect === "noel") {
    symbols = ["❄", "❅", "❆"]
  } else if (effect === "tet") {
    symbols = ["🧧", "🎆", "🌸"]
  } else if (effect === "trungthu") {
    symbols = ["🏮", "🌕", "⭐"]
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fall-slow {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          100% {
            transform: translate3d(0, 110vh, 0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {items.map((_, i) => {
          const left = (i * 13 + (i % 5) * 7) % 100
          const duration = 12 + (i % 5) * 2
          const delay = (i % 10) * -1.2
          const size = 20 + (i % 3) * 6
          const symbol = symbols[i % symbols.length]

          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${left}%`,
                top: "-10%",
                fontSize: `${size}px`,
                animation: `fall-slow ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
                opacity: 0.85,
              }}
            >
              {symbol}
            </div>
          )
        })}
      </div>
    </>
  )
}

// ================== COMPONENT CHÍNH ==================

export default function HomePage() {
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<Date>(now)
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([])

  // Filter ngày lễ
  const [showSolarHolidays, setShowSolarHolidays] = useState(true)
  const [showLunarHolidays, setShowLunarHolidays] = useState(true)
  const [showOnlyOff, setShowOnlyOff] = useState(false)

  // Ghi chú trong ngày
  const [dailyNote, setDailyNote] = useState("")
  const [noteSaved, setNoteSaved] = useState(false)

  // Ngày quan trọng cá nhân
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([])
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDay, setNewEventDay] = useState("")
  const [newEventMonth, setNewEventMonth] = useState("")
  const [newEventYear, setNewEventYear] = useState("")

  // Tra cứu nhanh
  const [searchMode, setSearchMode] = useState<"solar" | "lunar">("solar")
  const [searchSolarDay, setSearchSolarDay] = useState("")
  const [searchSolarMonth, setSearchSolarMonth] = useState("")
  const [searchSolarYear, setSearchSolarYear] = useState("")
  const [searchLunarDay, setSearchLunarDay] = useState("")
  const [searchLunarMonth, setSearchLunarMonth] = useState("")

  // Tiết khí trong năm
  const [yearSolarTerms, setYearSolarTerms] = useState<SolarTermInYear[]>([])

  // Hiệu ứng theo mùa
  const [seasonalEffect, setSeasonalEffect] = useState<SeasonalEffect>("none")

  // ====== BUILD CALENDAR DATA ======
  useEffect(() => {
    const days: CalendarDay[] = []
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const solarDate = new Date(selectedYear, selectedMonth - 1, day)

      const lunarInfo = getLunarDate(solarDate)
      const today = isToday(day, selectedMonth, selectedYear)
      const canChi = lunarInfo.dayName
      const holidays: HolidayInfo[] = []

      SOLAR_HOLIDAYS.forEach((h) => {
        if (h.day === day && h.month === selectedMonth) {
          holidays.push({ ...h, type: "duong" })
        }
      })

      LUNAR_HOLIDAYS.forEach((h) => {
        if (h.day === lunarInfo.day && h.month === lunarInfo.month) {
          holidays.push({ ...h, type: "am" })
        }
      })

      days.push({
        solar: day,
        lunar: {
          day: lunarInfo.day,
          month: lunarInfo.month,
          year: lunarInfo.year,
        },
        isToday: today,
        canChi,
        date: solarDate,
        holidays,
      })
    }

    setCalendarData(days)
  }, [selectedYear, selectedMonth])

  // ====== HIỆU ỨNG THEO MÙA (tính theo hôm nay) ======
  useEffect(() => {
    const today = new Date()
    const lunarToday = getLunarDate(today)
    const eff = getSeasonalEffectForDate(today, lunarToday)
    setSeasonalEffect(eff)
  }, [])

  // ====== THÔNG TIN NGÀY ĐANG CHỌN ======
  const selectedDayData: CalendarDay | null = (() => {
    if (!calendarData.length) return null
    if (
      selectedDate.getFullYear() === selectedYear &&
      selectedDate.getMonth() + 1 === selectedMonth
    ) {
      return calendarData.find((d) => d.solar === selectedDate.getDate()) ?? null
    }
    return null
  })()

  const selectedLunarInfo = selectedDayData
    ? getLunarDate(selectedDayData.date)
    : null

  const lunarMonthLength: number | null = selectedDayData
    ? getLunarMonthLengthForDate(selectedDate)
    : null
  const lunarMonthType: "Đ" | "T" | null =
    lunarMonthLength === 30 ? "Đ" : lunarMonthLength === 29 ? "T" : null

  const zodiacYearName = selectedLunarInfo?.yearName || "..."
  const zodiacInfo = getZodiacFromYearName(zodiacYearName)
  const luckyHours = selectedLunarInfo?.luckyHours ?? []

  const monthNames = [
    "THÁNG 01",
    "THÁNG 02",
    "THÁNG 03",
    "THÁNG 04",
    "THÁNG 05",
    "THÁNG 06",
    "THÁNG 07",
    "THÁNG 08",
    "THÁNG 09",
    "THÁNG 10",
    "THÁNG 11",
    "THÁNG 12",
  ]

  const jsFirstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay()
  const startDay = (jsFirstDay + 6) % 7
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const weekNumber = getISOWeek(selectedDate)
  const dayOfYear = getDayOfYear(selectedDate)
  const dow = selectedDate.getDay()

  const proverb =
    PROVERBS.length > 0
      ? PROVERBS[getDayOfYear(selectedDate) % PROVERBS.length]
      : ""

  const isTetLike =
    !!selectedLunarInfo &&
    (selectedLunarInfo.month === 12 || selectedLunarInfo.month === 1)

  const tetGreeting =
    isTetLike && TET_GREETINGS.length > 0
      ? TET_GREETINGS[getDayOfYear(selectedDate) % TET_GREETINGS.length]
      : null

  // ====== GHI CHÚ TRONG NGÀY – localStorage theo ngày ======
  useEffect(() => {
    if (typeof window === "undefined") return
    const key = `dailyNote-${selectedDate.toISOString().slice(0, 10)}`
    const stored = window.localStorage.getItem(key)
    setDailyNote(stored || "")
    setNoteSaved(false)
  }, [selectedDate])

  const handleSaveNote = () => {
    if (typeof window === "undefined") return
    const key = `dailyNote-${selectedDate.toISOString().slice(0, 10)}`
    window.localStorage.setItem(key, dailyNote)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 1500)
  }

  // ====== NGÀY QUAN TRỌNG CÁ NHÂN – localStorage ======
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem("personalEvents")
      if (raw) {
        const parsed = JSON.parse(raw) as PersonalEvent[]
        setPersonalEvents(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
      "personalEvents",
      JSON.stringify(personalEvents)
    )
  }, [personalEvents])

  const handleAddPersonalEvent = () => {
    const d = parseInt(newEventDay)
    const m = parseInt(newEventMonth)
    const y = newEventYear ? parseInt(newEventYear) : selectedYear

    if (!newEventTitle.trim() || !d || !m || !y) return

    const ev: PersonalEvent = {
      id: `${y}-${m}-${d}-${Date.now()}`,
      title: newEventTitle.trim(),
      date: { day: d, month: m, year: y },
    }

    setPersonalEvents((prev) => [...prev, ev])
    setNewEventTitle("")
    setNewEventDay("")
    setNewEventMonth("")
    setNewEventYear("")
  }

  const handleDeletePersonalEvent = (id: string) => {
    setPersonalEvents((prev) => prev.filter((e) => e.id !== id))
  }

  // ====== TIẾT KHÍ TRONG NĂM ======
  useEffect(() => {
    const results: SolarTermInYear[] = []
    let lastName = ""
    const d = new Date(selectedYear, 0, 1)
    let safety = 400

    while (d.getFullYear() === selectedYear && safety > 0) {
      const lunar = getLunarDate(d)
      if (lunar.solarTerm && lunar.solarTerm !== lastName) {
        results.push({ name: lunar.solarTerm, date: new Date(d) })
        lastName = lunar.solarTerm
      }
      d.setDate(d.getDate() + 1)
      safety--
    }

    setYearSolarTerms(results)
  }, [selectedYear])

  // ====== TRA CỨU NHANH ======
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (searchMode === "solar") {
      const d = parseInt(searchSolarDay)
      const m = parseInt(searchSolarMonth)
      const y = searchSolarYear ? parseInt(searchSolarYear) : selectedYear
      if (!d || !m || !y) return

      const date = new Date(y, m - 1, d)
      if (isNaN(date.getTime())) return
      setSelectedYear(y)
      setSelectedMonth(m)
      setSelectedDate(date)
      return
    }

    // Tìm theo ÂM lịch trong phạm vi 1 năm dương
    const ld = parseInt(searchLunarDay)
    const lm = parseInt(searchLunarMonth)
    const y = selectedYear
    if (!ld || !lm) return

    const start = new Date(y, 0, 1)
    const end = new Date(y, 11, 31)
    let found: Date | null = null

    for (
      let d = new Date(start.getTime());
      d.getTime() <= end.getTime();
      d.setDate(d.getDate() + 1)
    ) {
      const lunar = getLunarDate(d)
      if (lunar.day === ld && lunar.month === lm) {
        found = new Date(d)
        break
      }
    }

    if (found) {
      setSelectedYear(found.getFullYear())
      setSelectedMonth(found.getMonth() + 1)
      setSelectedDate(found)
    }
  }

  // ====== ĐIỀU KHIỂN NGÀY / THÁNG / NĂM ======
  const goToday = () => {
    const t = new Date()
    setSelectedYear(t.getFullYear())
    setSelectedMonth(t.getMonth() + 1)
    setSelectedDate(t)
  }

  const goPrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
    setSelectedYear(d.getFullYear())
    setSelectedMonth(d.getMonth() + 1)
  }

  const goNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
    setSelectedYear(d.getFullYear())
    setSelectedMonth(d.getMonth() + 1)
  }

  const handleDayClick = (day: number | null) => {
    if (!day) return
    const d = new Date(selectedYear, selectedMonth - 1, day)
    setSelectedDate(d)
  }

  const shiftMonth = (delta: number) => {
    let y = selectedYear
    let m = selectedMonth + delta
    if (m < 1) {
      m = 12
      y -= 1
    } else if (m > 12) {
      m = 1
      y += 1
    }
    setSelectedYear(y)
    setSelectedMonth(m)
    const newDate = new Date(y, m - 1, 1)
    setSelectedDate(newDate)
  }

  const shiftYear = (delta: number) => {
    const y = selectedYear + delta
    setSelectedYear(y)
    const newDate = new Date(y, selectedMonth - 1, 1)
    setSelectedDate(newDate)
  }

  // ====== GỢI Ý TRONG NGÀY ======
  const dailySuggestions =
    selectedLunarInfo
      ? getDailySuggestions(
          selectedLunarInfo.day,
          selectedLunarInfo.month,
          selectedLunarInfo.solarTerm
        )
      : []

  // ================== UI ==================

  return (
    <>
      <SeasonalEffects effect={seasonalEffect} />
      <main className="relative min-h-screen bg-gradient-to-b from-red-50 via-amber-50/70 to-rose-50 py-8 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="grid md:grid-cols-[1.1fr,1.4fr] min-h-[540px]">
              {/* LEFT PANEL */}
              <div className="relative bg-gradient-to-b from-red-50/80 via-amber-50 to-white border-r">
                <div className="px-8 pt-6 pb-6 flex flex-col h-full">
                  {/* Header THÁNG / NĂM / THỨ */}
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-red-700">
                        {monthNames[selectedDate.getMonth()]}
                      </span>
                      <span className="text-2xl font-bold text-slate-900 drop-shadow-sm">
                        {selectedDate.getFullYear()}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-red-800">
                      {weekdayFull[dow]}
                    </div>
                  </div>

                  {/* Nút HÔM NAY + Tuần / Ngày trong năm */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      size="sm"
                      variant={
                        isToday(
                          selectedDate.getDate(),
                          selectedDate.getMonth() + 1,
                          selectedDate.getFullYear()
                        )
                          ? "default"
                          : "outline"
                      }
                      className="rounded-full px-4 text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                      onClick={goToday}
                    >
                      HÔM NAY
                    </Button>
                    <div className="text-right text-xs text-slate-500 space-y-0.5">
                      <div>Tuần {weekNumber}</div>
                      <div>Ngày thứ {dayOfYear} trong năm</div>
                    </div>
                  </div>

                  {/* Số ngày to + mũi tên */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={goPrevDay}
                      className="text-slate-400 hover:text-slate-700 transition-transform hover:-translate-x-0.5"
                    >
                      ‹
                    </button>
                    <div className="text-7xl font-bold text-slate-900 leading-none drop-shadow-sm">
                      {pad2(selectedDate.getDate())}
                    </div>
                    <button
                      onClick={goNextDay}
                      className="text-slate-400 hover:text-slate-700 transition-transform hover:translate-x-0.5"
                    >
                      ›
                    </button>
                  </div>

                  {/* Ca dao / chúc Tết */}
                  <div className="mt-2 mb-2 border-l-4 border-amber-300 pl-3 text-xs text-slate-700 italic animate-[fadeIn_0.5s_ease-out]">
                    “{proverb}”
                    <div className="mt-1 text-[10px] not-italic text-slate-400">
                      Ca dao, tục ngữ Việt Nam
                    </div>
                  </div>

                  {tetGreeting && (
                    <div className="mb-3 text-xs bg-red-50 border-l-4 border-red-400 pl-3 pr-2 py-1 text-red-700 rounded-r-md shadow-sm animate-[fadeIn_0.5s_ease-out]">
                      {tetGreeting}
                    </div>
                  )}

                  {/* Tiết khí */}
                  <div className="mb-2 text-xs text-slate-600">
                    <span className="font-semibold">Tiết khí:</span>{" "}
                    <span className="text-red-700">
                      {selectedLunarInfo?.solarTerm || "Không có dữ liệu tiết khí"}
                    </span>
                  </div>

                  {/* THÔNG TIN CAN CHI + GIỜ HOÀNG ĐẠO */}
                  <div className="space-y-2 text-xs text-slate-700 mb-3">
                    {selectedDayData && selectedLunarInfo ? (
                      <>
                        <div className="animate-[fadeIn_0.4s_ease-out]">
                          Ngày{" "}
                          <span className="font-semibold">
                            {selectedLunarInfo.dayName}
                          </span>
                        </div>
                        <div className="animate-[fadeIn_0.5s_ease-out]">
                          Tháng{" "}
                          <span className="font-semibold">
                            {selectedLunarInfo.monthName}
                          </span>
                        </div>
                        <div className="animate-[fadeIn_0.6s_ease-out]">
                          Năm{" "}
                          <span className="font-semibold">
                            {selectedLunarInfo.yearName}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        Đang tải thông tin Can Chi...
                      </div>
                    )}

                    {/* Giờ hoàng đạo */}
                    <div className="pt-1">
                      <div className="font-semibold mb-1">
                        Giờ hoàng đạo hôm nay:
                      </div>
                      {luckyHours.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {luckyHours.map((h) => (
                            <span
                              key={h}
                              className="px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] shadow-sm"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          Thư viện chưa trả dữ liệu giờ hoàng đạo.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GỢI Ý HÔM NAY */}
                  <div className="mb-3 text-xs text-slate-700">
                    <div className="font-semibold mb-1">
                      Gợi ý cho hôm nay
                    </div>
                    {dailySuggestions.length > 0 ? (
                      <ul className="list-disc pl-4 space-y-0.5">
                        {dailySuggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-[11px] text-slate-400">
                        Chưa có gợi ý cho ngày này.
                      </div>
                    )}
                  </div>

                  {/* Ô thông tin âm lịch + con giáp + ghi chú */}
                  <div className="mt-auto pt-4 border-t flex flex-col gap-3">
                    <div className="flex gap-6 items-end">
                      {/* Cột trái: Thông tin âm lịch + lễ */}
                      <div className="text-xs text-slate-700 space-y-1">
                        {selectedDayData ? (
                          <>
                            <div>
                              Âm lịch:{" "}
                              <span className="font-semibold">
                                {pad2(selectedDayData.lunar.day)}/
                                {pad2(selectedDayData.lunar.month)}
                                {lunarMonthType && `(${lunarMonthType})`}/
                                {selectedDayData.lunar.year}
                              </span>
                            </div>
                            {lunarMonthType && lunarMonthLength && (
                              <div className="text-[11px] text-slate-500">
                                Tháng {pad2(selectedDayData.lunar.month)} có{" "}
                                {lunarMonthLength} ngày –{" "}
                                {lunarMonthType === "Đ"
                                  ? "tháng đủ"
                                  : "tháng thiếu"}
                              </div>
                            )}

                            {/* Lễ (theo filter hiện tại) */}
                            {(() => {
                              const effective =
                                selectedDayData.holidays.filter((h) => {
                                  if (!showSolarHolidays && h.type === "duong")
                                    return false
                                  if (!showLunarHolidays && h.type === "am")
                                    return false
                                  if (showOnlyOff && !h.isOff) return false
                                  return true
                                })

                              if (effective.length === 0) {
                                return (
                                  <div className="text-[11px] text-slate-400">
                                    Không trùng ngày lễ trong danh sách (dưới
                                    bộ lọc hiện tại).
                                  </div>
                                )
                              }

                              return (
                                <div className="pt-1 space-y-0.5">
                                  {effective.map((h, idx) => (
                                    <div
                                      key={idx}
                                      className="text-[11px]"
                                    >
                                      <span className="font-semibold text-emerald-700">
                                        {h.name}
                                      </span>{" "}
                                      –{" "}
                                      <span>
                                        {h.isOff
                                          ? "Có nghỉ làm/học"
                                          : "Không nghỉ chính thức"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )
                            })()}
                          </>
                        ) : (
                          <div className="text-[11px] text-slate-400">
                            Đang tải thông tin ngày...
                          </div>
                        )}

                        {/* Năm con giáp + ảnh */}
                        <div className="pt-2 flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">
                            Năm con giáp:
                          </span>
                          <span className="font-semibold text-red-700">
                            {zodiacYearName}
                          </span>
                          {zodiacInfo && (
                            <div className="ml-2 flex flex-col items-center">
                              <img
                                src={zodiacInfo.image}
                                alt={zodiacInfo.branch}
                                className="w-12 h-12 animate-bounce drop-shadow-md"
                              />
                              <span className="text-[10px] text-red-700 mt-1">
                                {zodiacInfo.branch}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cột phải: Số âm lịch to */}
                      <div className="ml-auto text-right">
                        <div className="text-[11px] text-slate-500 mb-1">
                          Ngày âm
                        </div>
                        <div className="text-4xl font-bold text-red-700 leading-none drop-shadow-sm">
                          {selectedDayData
                            ? pad2(selectedDayData.lunar.day)
                            : "--"}
                        </div>
                      </div>
                    </div>

                    {/* Ghi chú trong ngày */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-700">
                          Ghi chú trong ngày
                        </span>
                        {noteSaved && (
                          <span className="text-[10px] text-emerald-600">
                            Đã lưu ✔
                          </span>
                        )}
                      </div>
                      <textarea
                        className="w-full min-h-[60px] text-xs border rounded-md px-2 py-1 text-slate-700 resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
                        value={dailyNote}
                        onChange={(e) => setDailyNote(e.target.value)}
                        placeholder="Ghi lại việc quan trọng, việc cần làm hoặc cảm xúc trong ngày..."
                      />
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={handleSaveNote}
                          className="text-[11px] px-3 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md transition-all"
                        >
                          Lưu ghi chú
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL – LỊCH THÁNG + TOOL */}
              <div className="bg-white">
                <div className="px-6 pt-4 pb-6 flex flex-col h-full gap-3">
                  {/* BỘ LỌC NGÀY LỄ + TRA CỨU NHANH */}
                  <div className="flex flex-col gap-3 mb-2">
                    <div className="flex flex-wrap gap-3 items-center justify-between">
                      <div className="flex flex-wrap gap-3 items-center text-[11px] text-slate-600">
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showSolarHolidays}
                            onChange={(e) =>
                              setShowSolarHolidays(e.target.checked)
                            }
                          />
                          <span>Lễ dương lịch</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showLunarHolidays}
                            onChange={(e) =>
                              setShowLunarHolidays(e.target.checked)
                            }
                          />
                          <span>Lễ âm lịch</span>
                        </label>
                        <label className="inline-flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showOnlyOff}
                            onChange={(e) =>
                              setShowOnlyOff(e.target.checked)
                            }
                          />
                          <span>Chỉ ngày có nghỉ</span>
                        </label>
                      </div>

                      {/* Tra cứu nhanh */}
                      <form
                        onSubmit={handleSearchSubmit}
                        className="flex flex-wrap gap-2 items-center text-[11px] text-slate-600"
                      >
                        <select
                          value={searchMode}
                          onChange={(e) =>
                            setSearchMode(
                              e.target.value as "solar" | "lunar"
                            )
                          }
                          className="border rounded px-1 py-0.5 text-[11px]"
                        >
                          <option value="solar">Dương lịch</option>
                          <option value="lunar">Âm lịch</option>
                        </select>
                        {searchMode === "solar" ? (
                          <>
                            <input
                              type="number"
                              placeholder="Ngày"
                              value={searchSolarDay}
                              onChange={(e) =>
                                setSearchSolarDay(e.target.value)
                              }
                              className="w-12 border rounded px-1 py-0.5 text-[11px]"
                            />
                            <input
                              type="number"
                              placeholder="Tháng"
                              value={searchSolarMonth}
                              onChange={(e) =>
                                setSearchSolarMonth(e.target.value)
                              }
                              className="w-12 border rounded px-1 py-0.5 text-[11px]"
                            />
                            <input
                              type="number"
                              placeholder="Năm"
                              value={searchSolarYear}
                              onChange={(e) =>
                                setSearchSolarYear(e.target.value)
                              }
                              className="w-14 border rounded px-1 py-0.5 text-[11px]"
                            />
                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              placeholder="Ngày âm"
                              value={searchLunarDay}
                              onChange={(e) =>
                                setSearchLunarDay(e.target.value)
                              }
                              className="w-16 border rounded px-1 py-0.5 text-[11px]"
                            />
                            <input
                              type="number"
                              placeholder="Tháng âm"
                              value={searchLunarMonth}
                              onChange={(e) =>
                                setSearchLunarMonth(e.target.value)
                              }
                              className="w-16 border rounded px-1 py-0.5 text-[11px]"
                            />
                            <span className="text-[10px] text-slate-400">
                              (Năm: {selectedYear})
                            </span>
                          </>
                        )}
                        <button
                          type="submit"
                          className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] hover:bg-red-700 shadow-sm hover:shadow-md transition-all"
                        >
                          Tới
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Lịch tháng */}
                  <div className="mb-2 flex-1">
                    <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold text-slate-400 mb-2">
                      {weekdayShortHeader.map((d) => (
                        <div key={d} className="py-1">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {cells.map((day, idx) => {
                        if (!day) {
                          return (
                            <div
                              key={idx}
                              className="h-[60px] rounded-xl bg-amber-50/40"
                            />
                          )
                        }

                        const data = calendarData.find((d) => d.solar === day)
                        if (!data) {
                          return (
                            <div
                              key={idx}
                              className="h-[60px] rounded-xl border bg-white flex items-center justify-center text-sm text-slate-400"
                            >
                              {day}
                            </div>
                          )
                        }

                        const isSelected =
                          data.date.toDateString() ===
                          selectedDate.toDateString()
                        const inTetRange = isTetHolidayRange(data.lunar)

                        const effectiveHolidays = data.holidays.filter((h) => {
                          if (!showSolarHolidays && h.type === "duong")
                            return false
                          if (!showLunarHolidays && h.type === "am")
                            return false
                          if (showOnlyOff && !h.isOff) return false
                          return true
                        })

                        const hasHoliday = effectiveHolidays.length > 0
                        const isTodayCell = data.isToday

                        let cellLunarMonthType: "Đ" | "T" | null = null
                        if (data.lunar.day === 1) {
                          const len = getLunarMonthLengthForDate(data.date)
                          cellLunarMonthType =
                            len === 30 ? "Đ" : len === 29 ? "T" : null
                        }

                        // Có sự kiện cá nhân?
                        const hasPersonalEvent = personalEvents.some(
                          (ev) =>
                            ev.date.year === selectedYear &&
                            ev.date.month === selectedMonth &&
                            ev.date.day === day
                        )

                        const base =
                          "relative h-[60px] rounded-xl text-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.03]"

                        let cellClass =
                          base +
                          " border bg-white text-slate-800 hover:bg-amber-50/60"

                        if (inTetRange) {
                          cellClass =
                            base +
                            " border-2 border-red-500 bg-gradient-to-br from-red-500 to-amber-400 text-white shadow-md"
                        }

                        if (!inTetRange && hasHoliday) {
                          const anyOff = effectiveHolidays.some((h) => h.isOff)
                          const hasAm = effectiveHolidays.some(
                            (h) => h.type === "am"
                          )
                          if (anyOff && hasAm) {
                            cellClass =
                              base +
                              " border-2 border-amber-500 bg-gradient-to-br from-amber-100 to-emerald-100 text-emerald-900 shadow-sm"
                          } else if (anyOff) {
                            cellClass =
                              base +
                              " border-2 border-emerald-500 bg-emerald-50 text-emerald-900"
                          } else if (hasAm) {
                            cellClass =
                              base +
                              " border border-amber-400 bg-amber-50 text-amber-900"
                          } else {
                            cellClass =
                              base +
                              " border border-amber-500 bg-amber-50 text-amber-900"
                          }
                        }

                        if (isSelected) {
                          cellClass =
                            base +
                            " border-2 border-emerald-600 bg-emerald-600 text-white shadow-md"
                        }

                        if (
                          isTodayCell &&
                          !isSelected &&
                          !inTetRange &&
                          !hasHoliday
                        ) {
                          cellClass =
                            base +
                            " border-2 border-red-500 bg-amber-50 text-red-900 shadow-sm ring-2 ring-amber-200/70"
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleDayClick(day)}
                            className={cellClass}
                          >
                            <div className="text-sm font-semibold leading-none">
                              {day}
                            </div>
                            <div className="text-[10px] mt-1 opacity-80 flex items-center gap-0.5 justify-center">
                              <span>
                                {pad2(data.lunar.day)}/{pad2(data.lunar.month)}
                              </span>
                              {cellLunarMonthType && (
                                <span className="text-[9px] font-semibold">
                                  {cellLunarMonthType}
                                </span>
                              )}
                            </div>
                            <div className="text-[9px] mt-0.5 opacity-80">
                              {data.canChi}
                            </div>
                            {hasPersonalEvent && (
                              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-fuchsia-500 shadow animate-pulse" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* CHỌN THÁNG / NĂM + TIẾT KHÍ & SỰ KIỆN CÁ NHÂN */}
                  <div className="mt-auto pt-3 border-t flex flex-col gap-3">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Tháng */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">THÁNG</span>
                          <div className="inline-flex items-center rounded-full border bg-amber-50 px-1 shadow-sm">
                            <button
                              onClick={() => shiftMonth(-1)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-amber-100 rounded-full text-sm transition"
                            >
                              ‹
                            </button>
                            <span className="px-3 text-sm font-semibold">
                              {pad2(selectedMonth)}
                            </span>
                            <button
                              onClick={() => shiftMonth(1)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-amber-100 rounded-full text-sm transition"
                            >
                              ›
                            </button>
                          </div>
                        </div>

                        {/* Năm */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">NĂM</span>
                          <div className="inline-flex items-center rounded-full border bg-amber-50 px-1 shadow-sm">
                            <button
                              onClick={() => shiftYear(-1)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-amber-100 rounded-full text-sm transition"
                            >
                              ‹
                            </button>
                            <span className="px-3 text-sm font-semibold">
                              {selectedYear}
                            </span>
                            <button
                              onClick={() => shiftYear(1)}
                              className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-amber-100 rounded-full text-sm transition"
                            >
                              ›
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500">
                        Năm con giáp:{" "}
                        <span className="font-semibold text-red-700">
                          {zodiacYearName}
                        </span>
                      </div>
                    </div>

                    {/* Tiết khí trong năm + sự kiện cá nhân */}
                    <div className="grid md:grid-cols-2 gap-3 mt-2">
                      {/* Tiết khí trong năm */}
                      <div className="border rounded-lg p-2 bg-amber-50/60">
                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                          Tiết khí năm {selectedYear}
                        </div>
                        <div className="max-h-24 overflow-auto pr-1 text-[11px] text-slate-600 space-y-0.5">
                          {yearSolarTerms.length > 0 ? (
                            yearSolarTerms.map((t) => (
                              <div key={t.name + t.date.toISOString()}>
                                <span className="font-semibold text-red-700">
                                  {t.name}
                                </span>{" "}
                                –{" "}
                                {t.date.toLocaleDateString("vi-VN")}
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-slate-400">
                              Chưa lấy được dữ liệu tiết khí cho năm này.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sự kiện cá nhân */}
                      <div className="border rounded-lg p-2 bg-amber-50/60">
                        <div className="text-[11px] font-semibold text-slate-700 mb-1">
                          Sự kiện cá nhân
                        </div>
                        <div className="flex flex-col gap-1 mb-1">
                          <input
                            type="text"
                            placeholder="Tên sự kiện (ví dụ: Thi cuối kỳ)"
                            value={newEventTitle}
                            onChange={(e) =>
                              setNewEventTitle(e.target.value)
                            }
                            className="w-full border rounded px-2 py-0.5 text-[11px]"
                          />
                          <div className="flex gap-1">
                            <input
                              type="number"
                              placeholder="Ngày"
                              value={newEventDay}
                              onChange={(e) =>
                                setNewEventDay(e.target.value)
                              }
                              className="w-12 border rounded px-2 py-0.5 text-[11px]"
                            />
                            <input
                              type="number"
                              placeholder="Tháng"
                              value={newEventMonth}
                              onChange={(e) =>
                                setNewEventMonth(e.target.value)
                              }
                              className="w-12 border rounded px-2 py-0.5 text-[11px]"
                            />
                            <input
                              type="number"
                              placeholder={`${selectedYear}`}
                              value={newEventYear}
                              onChange={(e) =>
                                setNewEventYear(e.target.value)
                              }
                              className="w-16 border rounded px-2 py-0.5 text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={handleAddPersonalEvent}
                              className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] hover:bg-red-700 shadow-sm hover:shadow-md transition-all"
                            >
                              Thêm
                            </button>
                          </div>
                        </div>
                        <div className="max-h-20 overflow-auto pr-1 text-[11px] text-slate-600 space-y-0.5">
                          {personalEvents.length > 0 ? (
                            personalEvents.map((ev) => (
                              <div
                                key={ev.id}
                                className="flex items-center justify-between gap-1"
                              >
                                <span>
                                  {pad2(ev.date.day)}/{pad2(ev.date.month)}/
                                  {ev.date.year}:{" "}
                                  <span className="font-semibold">
                                    {ev.title}
                                  </span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeletePersonalEvent(ev.id)
                                  }
                                  className="text-[10px] text-red-500 hover:underline"
                                >
                                  x
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-slate-400">
                              Chưa có sự kiện nào. Hãy thêm sự kiện của bạn.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
