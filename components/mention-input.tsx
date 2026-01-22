"use client"

import type React from "react"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTaskContext } from "@/lib/task-context"
import type { User } from "@/lib/types"

interface MentionInputProps {
  value: string
  onChange: (value: string, taggedUserIds: string[]) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function MentionInput({ value, onChange, placeholder, rows = 2, className }: MentionInputProps) {
  const { users } = useTaskContext()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Extract tagged user IDs from text
  const extractTaggedUserIds = (text: string): string[] => {
    const taggedIds: string[] = []
    users.forEach((user) => {
      if (text.includes(`@${user.name}`)) {
        taggedIds.push(user.id)
      }
    })
    return taggedIds
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0
    setCursorPosition(cursorPos)

    // Check if we're typing after @
    const textBeforeCursor = newValue.slice(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf("@")

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1)
      // Check if there's no space after @ (user is still typing the name)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setSearchQuery(textAfterAt)
        setShowSuggestions(true)
        setSuggestionIndex(0)
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }

    const taggedIds = extractTaggedUserIds(newValue)
    onChange(newValue, taggedIds)
  }

  const handleSelectUser = (user: User) => {
    const textBeforeCursor = value.slice(0, cursorPosition)
    const atIndex = textBeforeCursor.lastIndexOf("@")
    const textAfterCursor = value.slice(cursorPosition)

    const newValue = textBeforeCursor.slice(0, atIndex) + `@${user.name} ` + textAfterCursor
    const taggedIds = extractTaggedUserIds(newValue)

    onChange(newValue, taggedIds)
    setShowSuggestions(false)
    setSearchQuery("")

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = atIndex + user.name.length + 2
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || filteredUsers.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSuggestionIndex((prev) => (prev + 1) % filteredUsers.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSuggestionIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
    } else if (e.key === "Enter" && showSuggestions) {
      e.preventDefault()
      handleSelectUser(filteredUsers[suggestionIndex])
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Render text with highlighted mentions
  const renderHighlightedText = () => {
    let text = value
    users.forEach((user) => {
      const mention = `@${user.name}`
      text = text.replace(new RegExp(mention, "g"), `<span class="text-primary font-medium">${mention}</span>`)
    })
    return text
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "הקלד @ כדי לתייג משתמש..."}
        rows={rows}
        className={className}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredUsers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredUsers.map((user, index) => (
            <button
              key={user.id}
              type="button"
              className={`w-full flex items-center gap-3 p-3 text-right hover:bg-muted transition-colors ${
                index === suggestionIndex ? "bg-muted" : ""
              }`}
              onClick={() => handleSelectUser(user)}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{user.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground mt-1">
        הקלד <span className="font-mono bg-muted px-1 rounded">@</span> כדי לתייג משתמש
      </p>
    </div>
  )
}
