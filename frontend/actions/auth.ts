"use server"

import { z } from "zod"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(formData: FormData) {
  const email = formData.get("identifier") as string
  const password = formData.get("password") as string

  try {
    await signIn("credentials", { identifier: email, password, redirect: false })
    return { success: true }
  } catch (error: any) {
    const errStr = String(error)
    if (
      errStr.includes("too_many_requests") || 
      error?.code === "too_many_requests" || 
      error?.message?.includes("too_many_requests") ||
      error?.type === "too_many_requests"
    ) {
      return { error: "too_many_requests" }
    }
    if (
      errStr.includes("unverified") || 
      error?.code === "unverified_email" || 
      error?.message?.includes("unverified") ||
      error?.type === "unverified_email"
    ) {
      return { error: "unverified_email" }
    }
    return { error: "invalid_credentials" }
  }
}

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const validatedFields = SignupSchema.safeParse({ name, email, password })

  if (!validatedFields.success) {
    return { error: "Dữ liệu không hợp lệ. Họ tên tối thiểu 2 ký tự, mật khẩu tối thiểu 6 ký tự." }
  }

  try {
    // Delegate signup completely to our Kotlin backend
    const response = await fetch(`http://localhost:8080/api/public/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.message || data.error || "Đăng ký không thành công." }
    }

    return { success: data.success || "Đăng ký thành công! Một email xác thực đã được gửi đến bạn. Vui lòng xác thực email trước khi đăng nhập." }
  } catch (error) {
    console.error("Kotlin backend signup failed:", error)
    return { error: "Có lỗi xảy ra trong quá trình đăng ký." }
  }
}

export async function resendVerificationAction(email: string) {
  try {
    const response = await fetch(`http://localhost:8080/api/public/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.message || "Gửi lại email xác thực thất bại." }
    }

    return { success: data.message || "Một email xác thực mới đã được gửi đến bạn. Vui lòng kiểm tra hộp thư." }
  } catch (error) {
    console.error("Kotlin backend resend verification failed:", error)
    return { error: "Có lỗi xảy ra khi gửi lại email xác thực." }
  }
}
