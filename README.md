# Açaí Top

Sistema de pedidos digital completo para uma loja de açaí, com site público para clientes e painel administrativo.

## 🍇 Funcionalidades

### Site Público
- **Página inicial** com marca, produtos em destaque e status da loja
- **Cardápio** com busca e filtro por categoria
- **Monte seu açaí** com builder personalizado (tamanho, base, frutas, adicionais, caldas, extras)
- **Carrinho** com persistência via LocalStorage
- **Checkout** completo com dados do cliente, endereço, pagamento
- **Envio via WhatsApp** com mensagem formatada

### Painel Admin
- **Dashboard** com métricas do dia
- **Gerenciamento de produtos** com upload de imagem
- **Categorias** com ordem e ativação
- **Tamanhos de açaí** com regras de preço
- **Adicionais** (bases, frutas, coberturas, caldas, extras pagos)
- **Zonas de entrega** com taxas
- **Pedidos** com status e detalhes
- **Configurações da loja**

## 🛠 Stack Técnica

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS
- **UI:** Componentes customizados estilo shadcn/ui
- **Estado:** Zustand (carrinho)
- **Formulários:** React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deploy:** Vercel

## 📦 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx              # Página inicial
│   ├── cardapio/             # Cardápio público
│   ├── montar-acai/          # Builder de açaí
│   ├── carrinho/             # Carrinho
│   ├── checkout/             # Finalizar pedido
│   ├── obrigado/             # Pós-pedido
│   └── admin/
│       ├── login/            # Login admin
│       ├── dashboard/        # Dashboard
│       ├── produtos/         # CRUD produtos
│       ├── categorias/       # CRUD categorias
│       ├── tamanhos-acai/    # CRUD tamanhos
│       ├── adicionais/       # CRUD adicionais
│       ├── entregas/         # CRUD zonas
│       ├── pedidos/          # Gerenciar pedidos
│       └── configuracoes/    # Config da loja
├── components/
│   ├── public/               # Componentes do site público
│   ├── admin/                # Componentes do admin
│   └── ui/                   # Componentes de UI
├── lib/
│   ├── supabase/             # Cliente Supabase
│   ├── whatsapp.ts           # Geração de mensagem WhatsApp
│   ├── pricing.ts            # Cálculo de preços
│   ├── order-number.ts       # Geração de nº do pedido
│   ├── currency.ts           # Formatação de moeda
│   ├── validators.ts         # Validações Zod
│   └── utils.ts              # Utilitários gerais
├── stores/
│   └── cart-store.ts         # Estado do carrinho (Zustand)
├── types/
│   ├── database.ts           # Tipos do banco
│   ├── cart.ts               # Tipos do carrinho
│   └── order.ts              # Tipos do pedido
└── hooks/
    └── useStoreStatus.ts     # Hook do status da loja
```

## 🚀 Configuração

### 1. Criar projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. No SQL Editor, execute o conteúdo de `supabase/migrations/001_initial.sql`
3. Para dados de exemplo, execute `supabase/seed.sql`
4. Crie um bucket de storage chamado `product-images` (público)
5. Crie um bucket de storage chamado `store-assets` (público)

### 2. Variáveis de ambiente

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

### 4. Configurar admin

1. Crie um usuário no Supabase Auth
2. Insira um registro na tabela `profiles` com o `id` do usuário e `role = 'owner'`
3. Faça login em http://localhost:3000/admin/login

## 📱 Como funciona o pedido

1. Cliente monta o açaí ou escolhe produtos
2. Adiciona ao carrinho (persiste no navegador)
3. Preenche dados no checkout
4. Sistema salva o pedido no Supabase
5. Cliente é redirecionado para WhatsApp com mensagem formatada
6. Admin vê o pedido no painel e atualiza o status

## 🔒 Segurança

- RLS (Row Level Security) habilitado em todas as tabelas
- Admin só acessa dados da própria loja
- Público só lê dados ativos
- Validação de formulários com Zod
- Upload de imagem com validação de tipo e tamanho

## 🚢 Deploy no Vercel

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

## 📋 Checklist de Produção

- [x] TypeScript strict mode
- [x] Validação de formulários
- [x] Tratamento de erros
- [x] Estados de carregamento
- [x] Estados vazios
- [x] Toasts de notificação
- [x] Rotas admin protegidas
- [x] RLS habilitado
- [x] SEO metadata
- [x] Layout responsivo
- [x] Persistência do carrinho
- [x] Formatação BRL
- [x] Mensagem WhatsApp

## 🔮 melhorias futuras

- Pagamento via Mercado Pago
- Cupons de desconto
- Programa de fidelidade
- Tracking de pedido
- Notificações push
- WhatsApp Business API
- Lojas múltiplas
- Gerador de QR Code
- PWA
- Tela/KDS para cozinha
- Relatórios por data
- Exportar pedidos CSV