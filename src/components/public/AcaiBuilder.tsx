'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AcaiSize, AcaiOption } from '@/types/database'
import { CustomAcaiSelection } from '@/types/cart'
import { useCartStore } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { formatBRL } from '@/lib/currency'
import { calculateCustomAcaiPrice, EXTRA_TOPPING_PRICE } from '@/lib/pricing'
import { ArrowLeft, ArrowRight, Check, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { emitCartItemAdded } from '@/lib/cart-events'

interface AcaiBuilderProps {
  initialSizes?: AcaiSize[]
  initialOptions?: AcaiOption[]
  onComplete?: () => void
}

// Helper to get image, emoji, and background color for customizer options
function getOptionDisplay(name: string) {
  const mapping: Record<string, { emoji: string; bg: string; image?: string }> = {
    // Bases
    'Açaí tradicional': { emoji: '🥣', bg: 'bg-purple-100 dark:bg-purple-950/40', image: 'https://olnpprehajcadkiqcwda.supabase.co/storage/v1/object/public/product-images/acai-300ml.jpg?v=2' },
    'Açaí com banana': { emoji: '🍌', bg: 'bg-yellow-100 dark:bg-yellow-950/40', image: 'https://olnpprehajcadkiqcwda.supabase.co/storage/v1/object/public/product-images/acai-500ml.jpg?v=2' },
    'Açaí zero açúcar': { emoji: '🍇', bg: 'bg-indigo-100 dark:bg-indigo-950/40', image: 'https://olnpprehajcadkiqcwda.supabase.co/storage/v1/object/public/product-images/acai-700ml.jpg?v=2' },
    'Cupuaçu': { emoji: '🍦', bg: 'bg-amber-100 dark:bg-amber-950/40', image: 'https://olnpprehajcadkiqcwda.supabase.co/storage/v1/object/public/product-images/suco-natural.jpg?v=2' },

    // Fruits
    'Banana': { emoji: '🍌', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
    'Morango': { emoji: '🍓', bg: 'bg-red-50 dark:bg-red-950/20' },
    'Kiwi': { emoji: '🥝', bg: 'bg-green-50 dark:bg-green-950/20' },
    'Manga': { emoji: '🥭', bg: 'bg-orange-50 dark:bg-orange-950/20' },
    'Uva': { emoji: '🍇', bg: 'bg-purple-50 dark:bg-purple-950/20' },

    // Toppings
    'Granola': { emoji: '🌾', bg: 'bg-yellow-100/50', image: 'https://olnpprehajcadkiqcwda.supabase.co/storage/v1/object/public/product-images/granola.jpg?v=2' },
    'Leite em pó': { emoji: '🥛', bg: 'bg-slate-100' },
    'Paçoca': { emoji: '🥜', bg: 'bg-amber-100/60' },
    'Chocoball': { emoji: '🍫', bg: 'bg-amber-900/10' },
    'Amendoim': { emoji: '🥜', bg: 'bg-yellow-100/60' },
    'Coco ralado': { emoji: '🥥', bg: 'bg-slate-100/80' },
    'Farinha láctea': { emoji: '🌾', bg: 'bg-amber-50' },
    'Confete': { emoji: '🍬', bg: 'bg-pink-100/50' },
    'Castanha': { emoji: '🌰', bg: 'bg-stone-100' },

    // Syrups
    'Leite condensado': { emoji: '🥛', bg: 'bg-yellow-50', image: 'https://olnpprehajcadkiqcwda.supabase.co/storage/v1/object/public/product-images/leite-condensado.jpg?v=2' },
    'Nutella': { emoji: '🍫', bg: 'bg-amber-950/20' },
    'Creme de ninho': { emoji: '🍨', bg: 'bg-amber-50/50' },
    'Creme de avelã': { emoji: '🌰', bg: 'bg-amber-900/10' },
    'Mel': { emoji: '🍯', bg: 'bg-yellow-100' },
    'Calda de chocolate': { emoji: '🍫', bg: 'bg-stone-800/10' },
    'Calda de morango': { emoji: '🍓', bg: 'bg-red-100/60' },

    // Extras
    'Nutella extra': { emoji: '🍫', bg: 'bg-amber-950/20' },
    'Morango extra': { emoji: '🍓', bg: 'bg-red-100/60' },
    'Leite Ninho extra': { emoji: '🥛', bg: 'bg-slate-100' },
    'Ovomaltine': { emoji: '🍫', bg: 'bg-amber-900/20' },
    'Whey protein': { emoji: '💪', bg: 'bg-sky-100' },
    'Açaí extra': { emoji: '🥣', bg: 'bg-purple-100' },
  }

  return mapping[name] || { emoji: '✨', bg: 'bg-muted' }
}

interface OptionCardProps {
  option: AcaiOption
  isSelected: boolean
  isJustSelected?: boolean
  onClick: () => void
  delayIndex?: number
}

function OptionCard({
  option,
  isSelected,
  isJustSelected = false,
  onClick,
  delayIndex = 0,
}: OptionCardProps) {
  const display = getOptionDisplay(option.name)
  return (
    <button
      onClick={onClick}
      className={cn(
        'group p-3.5 rounded-xl border-2 text-left transition-all duration-300 animate-stagger-in relative overflow-hidden flex flex-col items-center justify-center min-h-[130px] bg-card hover:shadow-md active:scale-95',
        isSelected
          ? 'border-acai-green bg-[linear-gradient(180deg,rgba(255,248,242,0.98),rgba(255,226,196,0.88))] shadow-[0_24px_50px_-30px_rgba(123,23,61,0.5)] ring-4 ring-acai-green/15 scale-[1.02]'
          : 'border-border hover:border-acai-green/45',
        isJustSelected && 'animate-select-pop'
      )}
      style={{ animationDelay: `${delayIndex * 40}ms` }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 rounded-xl opacity-0',
          isJustSelected && 'animate-selection-glow'
        )}
      />

      {isSelected && (
        <div className="absolute top-2 right-2 w-5.5 h-5.5 bg-acai-green rounded-full flex items-center justify-center animate-select-check z-10">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      
      {/* Visual Asset */}
      {display.image ? (
        <div
          className={cn(
            'w-16 h-16 rounded-full overflow-hidden mb-2 border border-border group-hover:scale-105 transition-transform duration-300 shrink-0',
            isSelected && 'scale-110 border-acai-green shadow-lg'
          )}
        >
          <img src={display.image} alt={option.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 transition-transform duration-300 group-hover:scale-110 shrink-0',
            display.bg,
            isSelected && 'scale-110 shadow-lg ring-4 ring-white/70'
          )}
        >
          {display.emoji}
        </div>
      )}
      
      <span
        className={cn(
          'font-semibold text-xs sm:text-sm text-center line-clamp-2 leading-tight px-1 text-foreground',
          isSelected && 'text-acai-purple'
        )}
      >
        {option.name}
      </span>
      
      {option.price > 0 && (
        <span className="text-xs font-bold text-acai-purple mt-1">
          +{formatBRL(option.price)}
        </span>
      )}

      {isSelected && (
        <span className="relative z-10 mt-2 inline-flex items-center rounded-full border border-acai-purple/12 bg-[linear-gradient(135deg,#fff6ee,#ffd7b0)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-acai-purple shadow-[0_14px_32px_-18px_rgba(74,14,46,0.2)]">
          Selecionado
        </span>
      )}
    </button>
  )
}

export function AcaiBuilder({ initialSizes = [], initialOptions = [], onComplete }: AcaiBuilderProps) {
  const [step, setStep] = useState(0)
  const [sizes, setSizes] = useState<AcaiSize[]>(initialSizes)
  const [options, setOptions] = useState<AcaiOption[]>(initialOptions)
  const [loading, setLoading] = useState(initialSizes.length === 0)
  const [notes, setNotes] = useState('')
  const [quantity, setQuantity] = useState(1)

  const [selectedSize, setSelectedSize] = useState<AcaiSize | null>(null)
  const [selectedBase, setSelectedBase] = useState<AcaiOption | null>(null)
  const [selectedFruits, setSelectedFruits] = useState<AcaiOption[]>([])
  const [selectedToppings, setSelectedToppings] = useState<AcaiOption[]>([])
  const [selectedSyrups, setSelectedSyrups] = useState<AcaiOption[]>([])
  const [selectedExtras, setSelectedExtras] = useState<AcaiOption[]>([])

  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right')
  const [animKey, setAnimKey] = useState(0)
  const [justSelected, setJustSelected] = useState<string | null>(null)
  const stepRefs = useRef<Array<HTMLButtonElement | null>>([])

  const addItem = useCartStore((s) => s.addItem)
  const prevStepRef = useRef(0)

  useEffect(() => {
    if (initialSizes.length > 0 && initialOptions.length > 0) {
      setSizes(initialSizes)
      setOptions(initialOptions)
      setLoading(false)
      return
    }

    async function fetchData() {
      const supabase = createClient()
      const [sizesRes, optionsRes] = await Promise.all([
        supabase.from('acai_sizes').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('acai_options').select('*').eq('is_available', true).order('sort_order'),
      ])
      setSizes(sizesRes.data || [])
      setOptions(optionsRes.data || [])
      setLoading(false)
    }
    fetchData()
  }, [initialSizes, initialOptions])

  useEffect(() => {
    const currentStep = stepRefs.current[step]
    currentStep?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [step])

  const bases = options.filter((o) => o.type === 'base')
  const fruits = options.filter((o) => o.type === 'fruit')
  const toppings = options.filter((o) => o.type === 'topping')
  const syrups = options.filter((o) => o.type === 'syrup' || o.type === 'cream')
  const extras = options.filter((o) => o.type === 'paid_extra')

  const steps = [
    { label: 'Tamanho', key: 'size' },
    { label: 'Base', key: 'base' },
    { label: 'Frutas', key: 'fruits' },
    { label: 'Adicionais', key: 'toppings' },
    { label: 'Caldas', key: 'syrups' },
    { label: 'Extras', key: 'extras' },
    { label: 'Revisar', key: 'review' },
  ]

  const goToStep = useCallback((newStep: number) => {
    const dir = newStep > prevStepRef.current ? 'left' : 'right'
    prevStepRef.current = newStep
    setSlideDir(dir)
    setAnimKey((k) => k + 1)
    setStep(newStep)
  }, [])

  const toggleOption = (
    option: AcaiOption,
    list: AcaiOption[],
    setList: (val: AcaiOption[]) => void,
    max?: number
  ) => {
    const exists = list.find((o) => o.id === option.id)
    if (exists) {
      setList(list.filter((o) => o.id !== option.id))
    } else {
      if (max && list.length >= max) return
      setList([...list, option])
      setJustSelected(option.id)
      setTimeout(() => setJustSelected(null), 350)
    }
  }

  const priceBreakdown = selectedSize
    ? calculateCustomAcaiPrice(
        selectedSize.base_price,
        selectedSize.max_free_toppings,
        selectedToppings.length,
        selectedExtras.map((e) => ({ price: e.price }))
      )
    : null

  const finalPrice = priceBreakdown ? priceBreakdown.unitTotal * quantity : 0

  const canProceed = () => {
    switch (step) {
      case 0: return !!selectedSize
      case 1: return !!selectedBase
      case 2: return true
      case 3: return true
      case 4: return true
      case 5: return true
      default: return true
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedBase) return

    const selection: CustomAcaiSelection = {
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      sizePrice: selectedSize.base_price,
      baseId: selectedBase.id,
      baseName: selectedBase.name,
      fruits: selectedFruits.map((f) => ({ id: f.id, name: f.name })),
      toppings: selectedToppings.map((t) => ({ id: t.id, name: t.name })),
      syrups: selectedSyrups.map((s) => ({ id: s.id, name: s.name })),
      extras: selectedExtras.map((e) => ({ id: e.id, name: e.name, price: e.price })),
    }

    addItem({
      id: uuidv4(),
      type: 'custom_acai',
      selection,
      unitPrice: priceBreakdown!.unitTotal,
      totalPrice: finalPrice,
      quantity,
      notes,
    })

    emitCartItemAdded({
      name: `${selectedSize.name} personalizado`,
      quantity,
      unitPrice: priceBreakdown!.unitTotal,
      totalPrice: finalPrice,
      imageUrl: selectedSize.image_url,
    })
    onComplete?.()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acai-purple" />
      </div>
    )
  }

  const slideClass = slideDir === 'left' ? 'animate-step-left' : 'animate-step-right'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              ref={(element) => {
                stepRefs.current[i] = element
              }}
              onClick={() => i < step && goToStep(i)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 shadow-sm',
                i === step
                  ? 'bg-[linear-gradient(135deg,#ff8a5b_0%,#e85d75_48%,#7b173d_100%)] text-white shadow-[0_18px_40px_-24px_rgba(123,23,61,0.8)] scale-105'
                  : i < step
                  ? 'bg-[linear-gradient(135deg,#fff6ee,#ffd7b0)] text-acai-purple border border-acai-purple/10'
                  : 'bg-white text-muted-foreground border border-border'
              )}
            >
              {i < step ? (
                <Check className="w-3 h-3 animate-select-check" />
              ) : (
                <span>{i + 1}</span>
              )}
              {s.label}
            </button>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'w-4 h-px transition-colors duration-500',
                  i < step ? 'bg-acai-green' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-acai-purple to-acai-green rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-white/82 p-6 shadow-[0_18px_60px_-40px_rgba(74,14,46,0.55)]">
        <div key={animKey} className={slideClass}>
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">Escolha o tamanho</h2>
              <div className="grid grid-cols-2 gap-3">
                {sizes.map((size, i) => {
                  const isSelected = selectedSize?.id === size.id
                  const wasJustSelected = justSelected === size.id
                  return (
                    <button
                      key={size.id}
                      onClick={() => {
                        setSelectedSize(size)
                        setJustSelected(size.id)
                        setTimeout(() => setJustSelected(null), 350)
                      }}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all duration-300 animate-stagger-in relative overflow-hidden flex flex-col justify-between h-full bg-card hover:shadow-md',
                        isSelected
                          ? 'border-acai-purple bg-[linear-gradient(180deg,rgba(255,248,242,0.98),rgba(245,217,231,0.92))] shadow-[0_24px_50px_-30px_rgba(74,14,46,0.5)] ring-4 ring-acai-purple/12 scale-[1.02]'
                          : 'border-border hover:border-acai-purple/50',
                        wasJustSelected && 'animate-select-pop'
                      )}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-acai-purple rounded-full flex items-center justify-center animate-select-check z-10">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      
                      {size.image_url && (
                        <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-muted shrink-0">
                          <img
                            src={size.image_url}
                            alt={size.name}
                            className={cn(
                              'w-full h-full object-cover transition-transform duration-500 hover:scale-105',
                              isSelected && 'scale-105'
                            )}
                          />
                        </div>
                      )}

                      <div>
                        <p className={cn('font-semibold text-foreground', isSelected && 'text-acai-purple')}>
                          {size.name}
                        </p>
                        {size.ml && <p className="text-sm text-muted-foreground">{size.ml}ml</p>}
                        <p className="text-lg font-bold text-acai-purple mt-1">
                          {formatBRL(size.base_price)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {size.max_free_toppings} adicionais grátis
                        </p>
                        {isSelected && (
                          <span className="mt-2 inline-flex rounded-full bg-acai-purple px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                            Selecionado
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">Escolha a base</h2>
              <div className="grid grid-cols-2 gap-3">
                {bases.map((base, i) => {
                  const isSelected = selectedBase?.id === base.id
                  const wasJustSelected = justSelected === base.id
                  return (
                    <OptionCard
                      key={base.id}
                      option={base}
                      isSelected={isSelected}
                      isJustSelected={wasJustSelected}
                      onClick={() => {
                        setSelectedBase(base)
                        setJustSelected(base.id)
                        setTimeout(() => setJustSelected(null), 350)
                      }}
                      delayIndex={i}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Escolha as frutas</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Máximo {selectedSize?.max_free_fruits || 0} frutas grátis
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fruits.map((fruit, i) => {
                  const isSelected = !!selectedFruits.find((f) => f.id === fruit.id)
                  return (
                    <OptionCard
                      key={fruit.id}
                      option={fruit}
                      isSelected={isSelected}
                      isJustSelected={justSelected === fruit.id}
                      onClick={() =>
                        toggleOption(fruit, selectedFruits, setSelectedFruits, selectedSize?.max_free_fruits)
                      }
                      delayIndex={i}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-2 text-foreground">Escolha os adicionais</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedSize?.max_free_toppings || 0} grátis.
                {selectedToppings.length > (selectedSize?.max_free_toppings || 0) &&
                  ` +${formatBRL(EXTRA_TOPPING_PRICE * (selectedToppings.length - (selectedSize?.max_free_toppings || 0)))} extras`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {toppings.map((topping, i) => {
                  const isSelected = !!selectedToppings.find((t) => t.id === topping.id)
                  return (
                    <OptionCard
                      key={topping.id}
                      option={topping}
                      isSelected={isSelected}
                      isJustSelected={justSelected === topping.id}
                      onClick={() => toggleOption(topping, selectedToppings, setSelectedToppings)}
                      delayIndex={i}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">Escolha as caldas e cremes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {syrups.map((syrup, i) => {
                  const isSelected = !!selectedSyrups.find((s) => s.id === syrup.id)
                  return (
                    <OptionCard
                      key={syrup.id}
                      option={syrup}
                      isSelected={isSelected}
                      isJustSelected={justSelected === syrup.id}
                      onClick={() => toggleOption(syrup, selectedSyrups, setSelectedSyrups)}
                      delayIndex={i}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">Extras pagos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {extras.map((extra, i) => {
                  const isSelected = !!selectedExtras.find((e) => e.id === extra.id)
                  return (
                    <OptionCard
                      key={extra.id}
                      option={extra}
                      isSelected={isSelected}
                      isJustSelected={justSelected === extra.id}
                      onClick={() => toggleOption(extra, selectedExtras, setSelectedExtras)}
                      delayIndex={i}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {step === 6 && priceBreakdown && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">Seu açaí personalizado</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between animate-stagger-in" style={{ animationDelay: '0ms' }}>
                  <span className="text-muted-foreground">Tamanho</span>
                  <span className="font-medium text-foreground">{selectedSize?.name}</span>
                </div>
                <div className="flex justify-between animate-stagger-in" style={{ animationDelay: '50ms' }}>
                  <span className="text-muted-foreground">Base</span>
                  <span className="font-medium text-foreground">{selectedBase?.name}</span>
                </div>
                {selectedFruits.length > 0 && (
                  <div className="flex justify-between animate-stagger-in" style={{ animationDelay: '100ms' }}>
                    <span className="text-muted-foreground">Frutas</span>
                    <span className="font-medium text-foreground">{selectedFruits.map((f) => f.name).join(', ')}</span>
                  </div>
                )}
                {selectedToppings.length > 0 && (
                  <div className="flex justify-between animate-stagger-in" style={{ animationDelay: '150ms' }}>
                    <span className="text-muted-foreground">Adicionais</span>
                    <span className="font-medium text-foreground">{selectedToppings.map((t) => t.name).join(', ')}</span>
                  </div>
                )}
                {selectedSyrups.length > 0 && (
                  <div className="flex justify-between animate-stagger-in" style={{ animationDelay: '200ms' }}>
                    <span className="text-muted-foreground">Caldas/Cremes</span>
                    <span className="font-medium text-foreground">{selectedSyrups.map((s) => s.name).join(', ')}</span>
                  </div>
                )}
                {selectedExtras.length > 0 && (
                  <div className="flex justify-between animate-stagger-in" style={{ animationDelay: '250ms' }}>
                    <span className="text-muted-foreground">Extras pagos</span>
                    <span className="font-medium text-foreground">{selectedExtras.map((e) => e.name).join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="bg-muted/50 rounded-xl p-4 space-y-2 animate-stagger-in" style={{ animationDelay: '300ms' }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base ({selectedSize?.name})</span>
                    <span className="font-medium text-foreground">{formatBRL(priceBreakdown.basePrice)}</span>
                  </div>
                  {priceBreakdown.extraToppingsCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Adicionais extras ({priceBreakdown.extraToppingsCount}x {formatBRL(EXTRA_TOPPING_PRICE)})</span>
                      <span className="font-medium text-foreground">{formatBRL(priceBreakdown.extraToppingsCost)}</span>
                    </div>
                  )}
                  {priceBreakdown.extrasCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Extras pagos</span>
                      <span className="font-medium text-foreground">{formatBRL(priceBreakdown.extrasCost)}</span>
                    </div>
                  )}
                </div>

                <div className="animate-stagger-in" style={{ animationDelay: '350ms' }}>
                  <label className="text-sm font-medium mb-2 block text-foreground">Observações</label>
                  <Textarea
                    placeholder="Ex: Pouco leite condensado, sem granola..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="animate-stagger-in" style={{ animationDelay: '400ms' }}>
                  <label className="text-sm font-medium mb-2 block text-foreground">Quantidade</label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="transition-transform active:scale-90"
                    >
                      -
                    </Button>
                    <span className="text-xl font-bold w-8 text-center text-foreground">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="transition-transform active:scale-90"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="bg-acai-purple text-white rounded-xl p-4 animate-stagger-in" style={{ animationDelay: '450ms' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">{formatBRL(finalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => goToStep(step - 1)}
              className="flex-1 transition-transform active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          {step < 6 ? (
            <Button
              onClick={() => goToStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 transition-all duration-300 active:scale-95"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-acai-green hover:bg-acai-green/90 transition-all duration-300 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Adicionar ao carrinho
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
