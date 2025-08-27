declare module '#auth-utils' {
  interface User {
    id: string
    username: string
    createdAt: Date
  }

  interface SecureSessionData {
  }
}

export {}
