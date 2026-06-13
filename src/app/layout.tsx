import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { ToastListener } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sora = Sora({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Açaí Top - O Melhor Açaí da Cidade',
  description: 'Monte seu açaí personalizado e peça pelo WhatsApp. Açaí fresco, cremoso e delicioso.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Açaí Top',
    description: 'O melhor açaí da cidade. Monte seu pedido personalizado.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body>
        {children}
        <ToastListener />
      </body>
    </html>
  )
}
