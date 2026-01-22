import type { TaskStatus, BoardColumn, InProgressStation } from "./types"

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
}

export const boardColumns = Object.entries(columnConfig).map(([value, config]) => ({
  id: value as BoardColumn,
  ...config,
}))

export const inProgressStationConfig: Record<InProgressStation, { label: string; color: string; icon: string }> = {
  design: {
    label: "בעיצוב",
    color: "bg-purple-500",
    icon: "Palette",
  },
  development: {
    label: "בפיתוח",
    color: "bg-blue-600",
    icon: "Code",
  },
  testing: {
    label: "בבדיקות",
    color: "bg-amber-500",
    icon: "TestTube",
  },
  feasibility: {
    label: "בבחינת יישימות",
    color: "bg-teal-500",
    icon: "Search",
  },
  "business-review": {
    label: "בבחינה מול החטיבה העסקית",
    color: "bg-indigo-500",
    icon: "Users",
  },
  "ux-requirements": {
    label: "בהגדרת דרישה ב-UX",
    color: "bg-pink-500",
    icon: "Layers",
  },
}

export const inProgressStationOptions = Object.entries(inProgressStationConfig).map(([value, config]) => ({
  value: value as InProgressStation,
  label: config.label,
  color: config.color,
  icon: config.icon,
}))
