import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"

class UnverifiedEmailError extends CredentialsSignin {
  code = "unverified_email"
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  logger: {
    error() {
      // Quiet down NextAuth credential errors to keep terminal clean!
    },
  },
  providers: [
    Credentials({
      name: "Auth0 Direct",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null

        try {
          // Delegate authentication completely to our Kotlin backend
          const response = await fetch(`http://localhost:8080/api/public/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.identifier,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            if (errorData.message?.includes("xác thực") || errorData.message?.includes("verified")) {
              throw new UnverifiedEmailError()
            }
            throw new InvalidCredentialsError()
          }

          const user = await response.json()
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken: user.accessToken,
          }
        } catch (error) {
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.role && session.user) {
        session.user.role = token.role as string
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.role = (user as any).role
      }
      return token
    },
  },
})
