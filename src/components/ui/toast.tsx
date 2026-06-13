'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  const bgColor = {
    success: 'bg-acai-green text-white',
    error: 'bg-destructive text-destructive-foreground',
    info: 'bg-acai-purple text-white',
  }[type]

  return (
    <div
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg animate-slide-up',
        bgColor
      )}
      onClick={onClose}
    >
      {message}
    </div>
  )
}

export function ToastListener() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setToast({ message: e.detail.message, type: e.detail.type })
      setTimeout(() => setToast(null), 3000)
    }
    window.addEventListener('show-toast', handler as EventListener)
    return () => window.removeEventListener('show-toast', handler as EventListener)
  }, [])

  if (!toast) return null
  return <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
}

let toastTimeout: NodeJS.Timeout | null = null

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (toastTimeout) clearTimeout(toastTimeout)
  
  const event = new CustomEvent('show-toast', { detail: { message, type } })
  window.dispatchEvent(event)
}