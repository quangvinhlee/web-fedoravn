"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Mail, Lock, User, Phone, Loader2 } from "lucide-react"
import { signup, resendVerificationAction } from "@/actions/auth"

export function SignupForm() {
  const t = useTranslations()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [email, setEmail] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    setResendSuccess("")

    const formData = new FormData(e.currentTarget)
    const emailValue = formData.get("email") as string
    setEmail(emailValue)

    const res = await signup(formData)

    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setSuccess(res.success || "Đăng ký thành công!")
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResendLoading(true)
    setResendSuccess("")
    setError("")
    try {
      const res = await resendVerificationAction(email)
      if (res.error) {
        setError(res.error)
      } else {
        setResendSuccess(res.success || "Đã gửi lại email xác thực thành công. Vui lòng kiểm tra hộp thư!")
      }
    } catch (err) {
      console.error(err)
      setError("Có lỗi xảy ra khi gửi lại email xác thực.")
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card w-full max-w-md mx-auto space-y-8 p-10 text-center transition-all duration-300">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#1e2d5a] flex items-center justify-center border border-[#3a528e] shadow-lg shadow-site-primary/10 relative">
            <Mail className="text-site-primary w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Xác thực tài khoản</h1>
            <p className="text-site-muted font-body text-sm leading-relaxed px-2">
              {success}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {resendSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-xl text-center">
            {resendSuccess}
          </div>
        )}

        <div className="bg-[#111a34]/60 border border-[#3a528e]/40 text-site-muted text-xs p-4 rounded-xl text-left leading-relaxed">
          💡 <strong>Mẹo nhỏ:</strong> Nếu bạn không tìm thấy email trong hộp thư đến, vui lòng kiểm tra thêm trong thư mục <strong>Thư rác (Spam)</strong> hoặc <strong>Quảng cáo (Promotions)</strong> nhé!
        </div>

        <div className="space-y-4 pt-2">
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full bg-[#1e2d5a] hover:bg-[#2c3d7a] text-white border border-[#3a528e] py-4 rounded-xl text-base flex items-center justify-center gap-2 font-bold active:scale-95 transition-all disabled:opacity-50"
          >
            {resendLoading ? <Loader2 className="animate-spin" size={16} /> : null}
            Gửi lại email xác thực
          </button>

          <Link
            href="/login"
            className="btn-site-primary w-full py-4 text-base flex items-center justify-center gap-2 font-bold"
          >
            Đi đến Đăng nhập
          </Link>
          <button
            onClick={() => { setSuccess(""); setError(""); setResendSuccess(""); }}
            className="text-sm text-site-muted hover:text-white transition-colors block mx-auto"
          >
            Quay lại trang Đăng ký
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card w-full max-w-md mx-auto space-y-8 p-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">{t("auth-signup")}</h1>
        <p className="text-site-muted font-body">{t("hero-kicker")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-site-muted group-focus-within:text-site-primary transition-colors" size={18} />
            <input
              name="name"
              type="text"
              required
              placeholder={t("auth-name")}
              className="w-full bg-[#111a34] border border-[#3a528e] rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-site-primary outline-none transition-all"
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-site-muted group-focus-within:text-site-primary transition-colors" size={18} />
            <input
              name="email"
              type="email"
              required
              placeholder={t("auth-email")}
              className="w-full bg-[#111a34] border border-[#3a528e] rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-site-primary outline-none transition-all"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-site-muted group-focus-within:text-site-primary transition-colors" size={18} />
            <input
              name="password"
              type="password"
              required
              placeholder={t("auth-password")}
              className="w-full bg-[#111a34] border border-[#3a528e] rounded-xl pl-12 pr-4 py-4 text-white focus:ring-2 focus:ring-site-primary outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-site-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : t("auth-signup-btn")}
        </button>
      </form>

      <div className="text-center pt-4">
        <p className="text-site-muted font-body text-sm">
          {t("auth-have-account")}{" "}
          <Link href="/login" className="text-site-primary font-bold hover:underline">
            {t("auth-login")}
          </Link>
        </p>
      </div>
    </div>
  )
}
