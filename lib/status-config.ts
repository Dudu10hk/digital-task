import type { TaskStatus, BoardColumn, InProgressStation } from "./types"

export const statusConfig: Record<TaskStatus, { label: string; color: string; bgClass: string }> = {
  todo: {
    label: "לביצוע",
    color: "bg-[#676879]",
    bgClass: "bg-[#676879]/10 text-[#676879] border-[#676879]/20",
  },
  "in-progress": {
    label: "בעבודה",
    color: "bg-[#0086c0]",
    bgClass: "bg-[#0086c0]/10 text-[#0086c0] border-[#0086c0]/20",
  },
  review: {
    label: "בבדיקה",
    color: "bg-[#a25ddc]",
    bgClass: "bg-[#a25ddc]/10 text-[#a25ddc] border-[#a25ddc]/20",
  },
  blocked: {
    label: "חסום",
    color: "bg-[#e2445c]",
    bgClass: "bg-[#e2445c]/10 text-[#e2445c] border-[#e2445c]/20",
  },
  done: {
    label: "הושלם",
    color: "bg-[#00c875]",
    bgClass: "bg-[#00c875]/10 text-[#00c875] border-[#00c875]/20",
  },
  qa: {
    label: "QA",
    color: "bg-[#a25ddc]",
    bgClass: "bg-[#a25ddc]/10 text-[#a25ddc] border-[#a25ddc]/20",
  },
  "on-hold": {
    label: "בהמתנה/תקוע",
    color: "bg-[#fdab3d]",
    bgClass: "bg-[#fdab3d]/10 text-[#fdab3d] border-[#fdab3d]/20",
  },
  canceled: {
    label: "בוטל/ארכיון",
    color: "bg-[#676879]",
    bgClass: "bg-[#676879]/5 text-[#676879]/60 border-[#676879]/10",
  },
}

export const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
  value: value as TaskStatus,
  label: config.label,
}))

export const columnConfig: Record<BoardColumn, { label: string; color: string }> = {
  todo: {
    label: "To Do",
    color: "bg-[#676879]",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-[#0086c0]",
  },
  done: {
    label: "Done",
    color: "bg-[#00c875]",
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
