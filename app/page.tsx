"use client"

import { TaskProvider, useTaskContext } from "@/lib/task-context"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"

function AppContent() {
  const { currentUser } = useTaskContext()

  if (!currentUser) {
    return <LoginForm />
  }

  return <Dashboard />
}

export default function Home() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  )
}
