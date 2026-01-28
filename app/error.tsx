'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Application Error:', error)
    console.error('Error Stack:', error.stack)
    console.error('Error Message:', error.message)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl p-8 text-center space-y-6 border">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            אופס! משהו השתבש
          </h1>
          <p className="text-muted-foreground text-sm">
            אירעה שגיאה בלתי צפויה. אנא נסה לרענן את הדף.
          </p>
        </div>

        {/* Error Details (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted/50 rounded-lg p-4 text-right text-xs space-y-2">
            <div className="font-semibold text-destructive">פרטי השגיאה:</div>
            <div className="text-foreground/80 break-words whitespace-pre-wrap font-mono">
              {error.message || 'No error message'}
            </div>
            {error.digest && (
              <div className="text-muted-foreground pt-2 border-t">
                Digest: {error.digest}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={reset}
            className="flex-1 gap-2"
            variant="default"
          >
            <RefreshCw className="w-4 h-4" />
            רענן דף
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Home className="w-4 h-4" />
            חזור לבית
          </Button>
        </div>

        {/* Additional Help */}
        <div className="text-xs text-muted-foreground pt-4 border-t">
          אם הבעיה נמשכת, נסה לנקות את המטמון של הדפדפן או צור קשר עם התמיכה.
        </div>
      </div>
    </div>
  )
}
