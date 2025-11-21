// Vietnamese zodiac animal names and their properties
export const ZODIAC_ANIMALS = [
  { key: "Tý", label: "Tý (Chuột)", element: "Nước" },
  { key: "Sửu", label: "Sửu (Trâu)", element: "Đất" },
  { key: "Dần", label: "Dần (Hổ)", element: "Gỗ" },
  { key: "Mão", label: "Mão (Mèo)", element: "Gỗ" },
  { key: "Thìn", label: "Thìn (Rồng)", element: "Đất" },
  { key: "Tỵ", label: "Tỵ (Rắn)", element: "Lửa" },
  { key: "Ngọ", label: "Ngọ (Ngựa)", element: "Lửa" },
  { key: "Mùi", label: "Mùi (Dê)", element: "Đất" },
  { key: "Thân", label: "Thân (Khỉ)", element: "Kim" },
  { key: "Dậu", label: "Dậu (Gà)", element: "Kim" },
  { key: "Tuất", label: "Tuất (Chó)", element: "Đất" },
  { key: "Hợi", label: "Hợi (Lợn)", element: "Nước" },
]

const HEAVENLY_STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"]

const EARTHLY_BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]

// 2020 is Tý year (base year), so index 0
const BASE_YEAR = 2020

/**
 * Get the Vietnamese zodiac animal for a given year
 * @param year - The year to calculate zodiac for
 * @returns The zodiac animal object with key, label, and element
 */
export function getZodiacAnimalByYear(year: number) {
  const diff = year - BASE_YEAR
  const index = ((diff % 12) + 12) % 12
  return ZODIAC_ANIMALS[index]
}

/**
 * Get the Can-Chi (heavenly stem + earthly branch) for a given year
 * @param year - The year to calculate for
 * @returns The Can-Chi string (e.g., "Ất Tỵ")
 */
export function getCanChiByYear(year: number): string {
  const stemIndex = (year - BASE_YEAR) % 10
  const branchIndex = (year - BASE_YEAR) % 12

  const stem = HEAVENLY_STEMS[(stemIndex + 10) % 10]
  const branch = EARTHLY_BRANCHES[(branchIndex + 12) % 12]

  return `${stem} ${branch}`
}

/**
 * Get the zodiac label for a given year
 * @param year - The year to calculate for
 * @returns The zodiac label (e.g., "Tý (Chuột)")
 */
export function getZodiacLabelForYear(year: number): string {
  return getZodiacAnimalByYear(year).label
}

/**
 * Get the element for a given year
 * @param year - The year to calculate for
 * @returns The element (e.g., "Nước", "Lửa")
 */
export function getElementByYear(year: number): string {
  return getZodiacAnimalByYear(year).element
}

/**
 * Get characteristics based on zodiac animal
 * @param year - The year to calculate for
 * @returns Array of characteristics for the zodiac animal
 */
export function getZodiacCharacteristics(year: number): string[] {
  const animal = getZodiacAnimalByYear(year)

  const characteristics: Record<string, string[]> = {
    Tý: ["Thông minh", "Nhanh nhạy", "Hòa nhập tốt"],
    Sửu: ["Chăm chỉ", "Kiên nhẫn", "Trung thực"],
    Dần: ["Can đảm", "Quyết đoán", "Hào phóng"],
    Mão: ["Tế nhị", "Nhu mục", "Nhân từ"],
    Thìn: ["Quyền lực", "Hùng vĩ", "Trí tuệ"],
    Tỵ: ["Hoã mật", "Mẫn cảm", "Giàu trí tưởng tượng"],
    Ngọ: ["Mạnh mẽ", "Năng động", "Thẳng thắn"],
    Mùi: ["Tính tình tốt", "Yêu thích hòa bình", "Tận tâm"],
    Thân: ["Thông minh", "Linh hoạt", "Vui vẻ"],
    Dậu: ["Chân thành", "Gan dạ", "Chính trực"],
    Tuất: ["Trung thành", "Bảo vệ", "Tin cậy"],
    Hợi: ["Chân thành", "Lấp lánh", "Hào phóng"],
  }

  return characteristics[animal.key] || []
}
