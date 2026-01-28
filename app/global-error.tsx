'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Application Error:', error)
    console.error('Error Stack:', error.stack)
  }, [error])

  return (
    <html dir="rtl">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center space-y-6 border border-red-200 dark:border-red-800">
            <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                שגיאה קריטית
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                אירעה שגיאה קריטית במערכת. אנא רענן את הדף.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-right text-xs space-y-2">
                <div className="font-semibold text-red-600 dark:text-red-400">
                  פרטי השגיאה:
                </div>
                <div className="text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap font-mono">
                  {error.message || 'No error message'}
                </div>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-gray-600 dark:text-gray-400">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <Button
              onClick={reset}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              נסה שוב
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
