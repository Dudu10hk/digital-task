"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, X } from "lucide-react"

interface FigmaPreviewProps {
  url: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FigmaPreview({ url, open, onOpenChange }: FigmaPreviewProps) {
  // Convert Figma URL to embed URL
  const getEmbedUrl = (figmaUrl: string) => {
    // Handle both file and design URLs
    const urlObj = new URL(figmaUrl)
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(figmaUrl)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle>תצוגה מקדימה - Figma</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-transparent"
              onClick={() => window.open(url, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              פתח ב-Figma
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 h-full">
          <iframe src={getEmbedUrl(url)} className="w-full h-[calc(85vh-65px)] border-0" allowFullScreen />
        </div>
      </DialogContent>
    </Dialog>
  )
}
