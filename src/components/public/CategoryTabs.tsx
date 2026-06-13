'use client'

import { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Category } from '@/types/database'

interface CategoryTabsProps {
  categories: Category[]
  activeCategoryId: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategoryTabs({ categories, activeCategoryId, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const checkScroll = () => {
      setShowLeftArrow(el.scrollLeft > 0)
      setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 1)
    }
    checkScroll()
    el.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = 200
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,241,230,0.98))] shadow"
        >
          ←
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5',
            activeCategoryId === null
              ? 'bg-[linear-gradient(135deg,#ff8a5b_0%,#e85d75_48%,#7b173d_100%)] text-white shadow-[0_18px_40px_-24px_rgba(123,23,61,0.8)]'
              : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,241,230,0.96))] text-muted-foreground hover:bg-[linear-gradient(135deg,#fff7ef,#ffd7b0)] hover:text-acai-purple'
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5',
              activeCategoryId === cat.id
                ? 'bg-[linear-gradient(135deg,#ff8a5b_0%,#e85d75_48%,#7b173d_100%)] text-white shadow-[0_18px_40px_-24px_rgba(123,23,61,0.8)]'
                : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,241,230,0.96))] text-muted-foreground hover:bg-[linear-gradient(135deg,#fff7ef,#ffd7b0)] hover:text-acai-purple'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,241,230,0.98))] shadow"
        >
          →
        </button>
      )}
    </div>
  )
}
