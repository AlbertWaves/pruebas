"use client"

import { useRouter } from "next/router"
import { useState } from "react"

const Page = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({ username: "", password: "" })

  const handleSubmit = async (event) => {
    event.preventDefault()
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (data.success) {
      if (data.requiresPasswordChange) {
        router.push(`/change-password?userId=${data.user._id}`)
      } else {
        router.push("/dashboard")
      }
    } else {
      alert("Login failed")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit">Login</button>
    </form>
  )
}

export default Page
