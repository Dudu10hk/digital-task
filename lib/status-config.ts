import type { TaskStatus, BoardColumn, InProgressStation } from "./types"

export const statusConfig: Record<TaskStatus, { label: string; color: string; bgClass: string }> = {
  todo: {
    label: "לביצוע",
    color: "bg-slate-400",
    bgClass: "bg-slate-50 text-slate-700 border-slate-200 shadow-sm",
  },
  "in-progress": {
    label: "בעבודה",
    color: "bg-blue-500",
    bgClass: "bg-blue-50 text-blue-700 border-blue-200 shadow-sm",
  },
  review: {
    label: "בבדיקה",
    color: "bg-purple-500",
    bgClass: "bg-purple-50 text-purple-700 border-purple-200 shadow-sm",
  },
  blocked: {
    label: "חסום",
    color: "bg-red-500",
    bgClass: "bg-red-50 text-red-700 border-red-200 shadow-sm",
  },
  done: {
    label: "הושלם",
    color: "bg-emerald-500",
    bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
  },
  qa: {
    label: "QA",
    color: "bg-indigo-500",
    bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm",
  },
  "on-hold": {
    label: "בהמתנה/תקוע",
    color: "bg-rose-500",
    bgClass: "bg-rose-50 text-rose-700 border-rose-200 shadow-sm",
  },
  canceled: {
    label: "בוטל/ארכיון",
    color: "bg-slate-300",
    bgClass: "bg-slate-100 text-slate-500 border-slate-200 opacity-70",
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

export const inProgressStationConfig: Record<InProgressStation, { label: string; color: string; icon: string; bgClass: string }> = {
  design: {
    label: "בעיצוב",
    color: "bg-purple-500",
    icon: "Palette",
    bgClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  development: {
    label: "בפיתוח",
    color: "bg-blue-600",
    icon: "Code",
    bgClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  testing: {
    label: "בבדיקות",
    color: "bg-amber-500",
    icon: "TestTube",
    bgClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  feasibility: {
    label: "בבחינת יישימות",
    color: "bg-teal-500",
    icon: "Search",
    bgClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  "business-review": {
    label: "בבחינה מול החטיבה העסקית",
    color: "bg-indigo-500",
    icon: "Users",
    bgClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  "ux-requirements": {
    label: "בהגדרת דרישה ב-UX",
    color: "bg-pink-500",
    icon: "Layers",
    bgClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
}

export const inProgressStationOptions = Object.entries(inProgressStationConfig).map(([value, config]) => ({
  value: value as InProgressStation,
  label: config.label,
  color: config.color,
  icon: config.icon,
}))
