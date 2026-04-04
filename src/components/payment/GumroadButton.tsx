'use client'

import { useState } from 'react'

interface GumroadButtonProps {
  productId?: string
  label?: string
  className?: string
  onSuccess?: (licenseKey: string) => void
}

/**
 * Gumroad Payment Button
 *
 * Usage:
 * <GumroadButton productId="your_product_id" label="€4,99 - Lifetime Access" />
 *
 * To get Gumroad product ID:
 * 1. Create product at gumroad.com
 * 2. Get Product ID from product URL: gumroad.com/l/{PRODUCT_ID}
 */
export function GumroadButton({
  productId = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_ID || '',
  label = '🚀 Start Free Trial',
  className = '',
  onSuccess,
}: GumroadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    if (!productId) {
      console.error('Gumroad product ID not configured')
      return
    }

    setIsLoading(true)

    // Open Gumroad overlay
    if (window.GumroadOverlay) {
      window.GumroadOverlay.hideOverlay?.()
    }

    // Create and dispatch custom event for Gumroad script
    const script = document.createElement('script')
    script.src = 'https://gumroad.com/js/gumroad.js'
    script.async = true
    script.onload = () => {
      ;(window as any).GumroadOverlay?.showOverlay?.(productId)
      setIsLoading(false)
    }
    document.head.appendChild(script)
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading || !productId}
        className={`
          px-6 py-3 rounded-xl font-bold text-white transition
          bg-gradient-to-r from-blue-600 to-purple-600
          hover:from-blue-700 hover:to-purple-700
          disabled:from-gray-400 disabled:to-gray-400
          ${className}
        `}
      >
        {isLoading ? '⏳ Loading...' : label}
      </button>

      {/* Gumroad overlay script */}
      <script async src="https://gumroad.com/js/gumroad.js"></script>
    </>
  )
}

// Type declaration for Gumroad global
declare global {
  interface Window {
    GumroadOverlay?: {
      showOverlay?: (productId: string) => void
      hideOverlay?: () => void
    }
  }
}
