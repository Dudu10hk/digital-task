import type { TaskStatus, BoardColumn } from "./types"

export const statusConfig: Record<TaskStatus, { label: string; color: string; bgClass: string }> = {
  todo: {
    label: "לביצוע",
    color: "bg-status-todo",
    bgClass: "bg-status-todo/20 text-amber-700 border-status-todo/30",
  },
  "in-progress": {
    label: "בעבודה",
    color: "bg-status-progress",
    bgClass: "bg-status-progress/20 text-pink-700 border-status-progress/30",
  },
  done: {
    label: "הושלם",
    color: "bg-status-done",
    bgClass: "bg-status-done/20 text-sky-700 border-status-done/30",
  },
  qa: {
    label: "QA",
    color: "bg-status-qa",
    bgClass: "bg-status-qa/20 text-teal-700 border-status-qa/30",
  },
  "on-hold": {
    label: "בהמתנה/תקוע",
    color: "bg-status-on-hold",
    bgClass: "bg-status-on-hold/20 text-red-700 border-status-on-hold/30",
  },
  canceled: {
    label: "בוטל/ארכיון",
    color: "bg-status-canceled",
    bgClass: "bg-status-canceled/20 text-violet-700 border-status-canceled/30",
  },
}

export const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value: value as TaskStatus,
  label: config.label,
}))

export const columnConfig: Record<BoardColumn, { label: string; color: string }> = {
  todo: {
    label: "To Do",
    color: "bg-sky-500",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-500",
  },
  done: {
    label: "Done",
    color: "bg-emerald-500",
  },
  "pm-review": {
    label: "PM Review",
    color: "bg-purple-500",
  },
  "qa-review": {
    label: "QA Review",
    color: "bg-amber-500",
  },
  "done-done": {
    label: "Done Done",
    color: "bg-green-600",
  },
}

export const boardColumns = Object.entries(columnConfig).map(([value, config]) => ({
  id: value as BoardColumn,
  ...config,
}))
