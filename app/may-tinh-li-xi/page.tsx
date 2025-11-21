"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

const luckyNumbers = [100, 200, 500, 888, 1000, 1688, 2000, 2888, 3000, 5000, 6868, 8888]

const recipientTypes = [
  { value: "children", label: "Trẻ nhỏ" },
  { value: "siblings", label: "Anh chị em" },
  { value: "friends", label: "Bạn bè" },
  { value: "employees", label: "Nhân viên/Đồng nghiệp" },
  { value: "elderly", label: "Người lớn tuổi" },
  { value: "partners", label: "Đối tác/Khách hàng" },
]

const closenessLevels = [
  { value: "normal", label: "Bình thường" },
  { value: "close", label: "Thân" },
  { value: "very-close", label: "Rất thân/Quan trọng" },
]

export default function LuckyMoneyCalculator() {
  const [recipient, setRecipient] = useState("children")
  const [closeness, setCloseness] = useState("normal")
  const [budget, setBudget] = useState("")
  const [suggestion, setSuggestion] = useState<number | null>(null)

  const calculateSuggestion = () => {
    if (!budget) return

    const budgetNum = Number.parseInt(budget)
    let baseAmount = 100

    if (recipient === "children") {
      baseAmount = closeness === "very-close" ? 500 : closeness === "close" ? 300 : 100
    } else if (recipient === "siblings" || recipient === "friends") {
      baseAmount = closeness === "very-close" ? 1000 : closeness === "close" ? 500 : 200
    } else if (recipient === "employees") {
      baseAmount = 200
    } else if (recipient === "elderly") {
      baseAmount = closeness === "very-close" ? 2000 : closeness === "close" ? 1000 : 500
    } else if (recipient === "partners") {
      baseAmount = closeness === "very-close" ? 1000 : 500
    }

    const recommended = luckyNumbers.find((n) => n >= baseAmount && n <= budgetNum) || baseAmount
    setSuggestion(recommended)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4 bg-transparent">
              ← Quay lại
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-primary mb-2">Máy tính lì xì</h1>
          <p className="text-muted-foreground">Gợi ý số tiền lì xì hợp lý theo đối tượng và ngân sách</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calculator Form */}
          <Card className="p-6 space-y-6">
            <div>
              <label className="block font-semibold text-foreground mb-3">Đối tượng nhận lì xì</label>
              <div className="space-y-2">
                {recipientTypes.map((type) => (
                  <label key={type.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="recipient"
                      value={type.value}
                      checked={recipient === type.value}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-3">Mức độ thân thiết</label>
              <div className="space-y-2">
                {closenessLevels.map((level) => (
                  <label key={level.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="closeness"
                      value={level.value}
                      checked={closeness === level.value}
                      onChange={(e) => setCloseness(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-foreground">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-2">Ngân sách dự kiến (VND)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Nhập số tiền..."
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              onClick={calculateSuggestion}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              Gợi ý số tiền
            </Button>
          </Card>

          {/* Suggestion Result */}
          <div className="space-y-6">
            {suggestion && (
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <h3 className="text-sm text-muted-foreground mb-2">Số tiền đề xuất</h3>
                <div className="text-4xl font-bold text-primary mb-4">{suggestion.toLocaleString("vi-VN")} đ</div>
                <p className="text-sm text-muted-foreground">Số này được chọn vì:</p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>• Phù hợp với ngân sách của bạn</li>
                  <li>• Là số đẹp, tượng trưng may mắn</li>
                  <li>• Thích hợp với mối quan hệ với người nhận</li>
                </ul>
              </Card>
            )}

            {/* Lucky Numbers */}
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Những số tiền truyền thống</h3>
              <div className="grid grid-cols-2 gap-2">
                {luckyNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => setSuggestion(num)}
                    className="p-3 bg-secondary/10 hover:bg-primary/10 border border-border rounded-lg text-sm font-medium text-foreground transition-colors"
                  >
                    {num.toLocaleString("vi-VN")} đ
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
