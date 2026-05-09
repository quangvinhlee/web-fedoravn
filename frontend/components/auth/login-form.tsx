"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { User, Lock, Loader2 } from "lucide-react"
import { login, resendVerificationAction } from "@/actions/auth"

export function LoginForm() {
  const t = useTranslations()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [showResend, setShowResend] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [resendLoading, setResendLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResendMessage("")

    const formData = new FormData(e.currentTarget)

    try {
      const res = await login(formData)

      if (res?.error) {
        if (res.error === "unverified_email") {
          setError("Tài khoản chưa được xác thực. Vui lòng kiểm tra hộp thư email của bạn để xác thực tài khoản trước khi đăng nhập.")
          setShowResend(true)
        } else if (res.error === "too_many_requests") {
          setError("Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau vài phút.")
          setShowResend(false)
        } else {
          setError("Tên đăng nhập, email hoặc mật khẩu không đúng.")
          setShowResend(false)
        }
      } else {
        window.location.href = "/"
      }
    } catch (err) {
      console.error(err)
      setError("Đã có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError("Vui lòng nhập Email để gửi lại mã xác thực.")
      return
    }
    setResendLoading(true)
    setError("")
    setResendMessage("")
    try {
      const res = await resendVerificationAction(email)
      if (res.error) {
        setError(res.error)
      } else {
        setResendMessage(res.success || "Một email xác thực mới đã được gửi đến bạn. Vui lòng kiểm tra hộp thư.")
        setShowResend(false)
      }
    } catch (err) {
      console.error(err)
      setError("Có lỗi xảy ra khi gửi lại email xác thực.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="glass-card w-full max-w-md mx-auto space-y-8 p-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">{t("auth-login")}</h1>
        <p className="text-site-muted font-body">{t("hero-kicker")}</p>
      </div>

        <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl text-center space-y-3">
            <div>{error}</div>
            {showResend && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-site-primary hover:underline text-xs font-bold flex items-center justify-center gap-2 mx-auto bg-white/5 px-3 py-1.5 rounded-lg border border-site-primary/30 hover:bg-white/10 active:scale-95 transition-all"
              >
                {resendLoading ? <Loader2 className="animate-spin" size={12} /> : null}
                Gửi lại email xác thực
              </button>
            )}
          </div>
        )}
        {resendMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm p-4 rounded-xl text-center">
            {resendMessage}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-site-muted group-focus-within:text-site-primary transition-colors" size={18} />
            <input
              name="identifier"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username hoặc Email"
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
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-site-muted hover:text-white transition-colors">
              Quên mật khẩu?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-site-primary w-full py-4 text-lg flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : t("auth-login-btn")}
        </button>
      </form>

      <div className="text-center pt-4">
        <p className="text-site-muted font-body text-sm">
          {t("auth-no-account")}{" "}
          <Link href="/signup" className="text-site-primary font-bold hover:underline">
            {t("auth-signup")}
          </Link>
        </p>
      </div>
    </div>
  )
}
