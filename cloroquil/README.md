# CLOROQUIL 🧹

App de venda de produtos de limpeza para Android e iOS.

**Stack:** React Native + Expo + Firebase (Auth, Firestore, Storage)

---

## Setup do Firebase

### 1. Criar Projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Adicionar projeto" e nomeie-o (ex.: `cloroquil`)
3. Ative ou desative o Google Analytics conforme preferir

### 2. Configurar Firebase Auth (Telefone/SMS)

1. No console Firebase, vá em **Authentication → Sign-in method**
2. Ative o provedor **Phone**
3. (Opcional) Adicione números de teste em **Phone numbers for testing** para desenvolvimento

### 3. Configurar Firestore

1. No console Firebase, vá em **Firestore Database**
2. Clique em **Create database**
3. Escolha a localização mais próxima (ex.: `southamerica-east1`)
4. Inicie em **production mode**
5. Vá em **Rules** e cole o conteúdo de `firestore.rules`

### 4. Configurar Firebase Storage

1. No console Firebase, vá em **Storage**
2. Clique em **Get started**
3. Vá em **Rules** e cole o conteúdo de `storage.rules`

### 5. Registrar o App

1. No console Firebase, clique no ícone **Web** (</>) para adicionar um app web
2. Registre com nome "CLOROQUIL"
3. Copie o objeto `firebaseConfig` gerado
4. Cole em `src/config/firebase.js` substituindo os valores de placeholder

### 6. Índices do Firestore

O Firestore criará índices automaticamente quando necessário, mas para melhor performance você pode criar:

- **coupons:** `code` (ASC) + `active` (ASC)
- **coupons:** `restrictedToUid` (ASC) + `active` (ASC)
- **products:** `active` (ASC)

---

## Instalação e Execução

```bash
cd cloroquil
npm install
npx expo start
```

Para rodar em dispositivo/emulador:
```bash
npx expo start --android
npx expo start --ios
```

---

## Estrutura do Projeto

```
cloroquil/
├── App.js                          # Entry point com providers
├── src/
│   ├── config/
│   │   ├── firebase.js             # Configuração Firebase
│   │   ├── theme.js                # Cores, fontes, espaçamentos
│   │   └── constants.js            # Dados fixos (WhatsApp, Pix, etc.)
│   ├── contexts/
│   │   ├── AuthContext.js          # Estado de autenticação e perfil
│   │   └── CartContext.js          # Estado do carrinho
│   ├── navigation/
│   │   └── Navigation.js          # React Navigation (stacks + tabs)
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js      # Login por telefone SMS
│   │   │   └── BlockedScreen.js    # Tela de usuário bloqueado
│   │   ├── profile/
│   │   │   ├── ProfileScreen.js    # Perfil com dados de entrega
│   │   │   └── CompleteProfileScreen.js  # Completar perfil (1ª vez)
│   │   ├── products/
│   │   │   ├── ProductsScreen.js   # Catálogo de produtos
│   │   │   └── ProductDetailScreen.js  # Detalhes do produto
│   │   ├── cart/
│   │   │   └── CartScreen.js       # Carrinho com quantidades
│   │   ├── checkout/
│   │   │   └── CheckoutScreen.js   # Checkout, cupom, WhatsApp
│   │   └── admin/
│   │       ├── AdminPanelScreen.js    # Menu admin
│   │       ├── AdminProductsScreen.js # Gerenciar produtos
│   │       ├── AdminUsersScreen.js    # Bloquear/desbloquear
│   │       ├── AdminCouponsScreen.js  # Gerenciar cupons
│   │       └── AdminRolesScreen.js    # Gerenciar admins (OWNER)
│   ├── components/
│   │   ├── Button.js               # Botão reutilizável
│   │   ├── Input.js                # Input reutilizável
│   │   └── ProductCard.js          # Card de produto
│   └── utils/
│       ├── format.js               # formatBRL, formatPhone
│       ├── whatsapp.js             # Montar mensagem e abrir WhatsApp
│       └── couponService.js        # Validação e resgate de cupons
├── firestore.rules                 # Regras de segurança Firestore
└── storage.rules                   # Regras de segurança Storage
```

---

## Dados Fixos

| Item | Valor |
|------|-------|
| Nome do app | CLOROQUIL |
| WhatsApp (wa.me) | 5551985079395 |
| Chave Pix (CPF) | 879.232.030-91 |
| Telefone do OWNER | +5551985079395 |

---

## Coleções Firestore

### `users/{uid}`
- `name` (string)
- `phoneE164` (string)
- `address` (map: street, number, neighborhood, complement?, city)
- `blocked` (boolean)
- `role` ("USER" | "ADMIN" | "OWNER")
- `createdAt` / `updatedAt`

### `products/{productId}`
- `name` (string)
- `priceCents` (number)
- `description` (string)
- `photoUrl` (string)
- `active` (boolean)
- `updatedAt`

### `coupons/{couponId}`
- `code` (string, UPPERCASE)
- `discountCents` (number)
- `validFrom` / `validUntil` (timestamp, opcional)
- `active` (boolean)
- `maxTotalUses` (number, opcional)
- `totalUsed` (number)
- `maxUsesPerUser` (number)
- `restrictedToUid` (string | null)
- `allowBelowZero` (boolean, default false)
- `createdAt` / `updatedAt`

### `couponRedemptions/{couponId}_{uid}`
- `couponId` (string)
- `uid` (string)
- `usedCount` (number)
- `lastUsedAt` (timestamp)

---

## Roles e Permissões

| Ação | USER | ADMIN | OWNER |
|------|------|-------|-------|
| Ver/comprar produtos | ✅ | ✅ | ✅ |
| Editar produtos | ❌ | ✅ | ✅ |
| Gerenciar cupons | ❌ | ✅ | ✅ |
| Bloquear usuários | ❌ | ✅ | ✅ |
| Promover/rebaixar admins | ❌ | ❌ | ✅ |

O **OWNER** é definido automaticamente no primeiro login com o telefone `+5551985079395`.

---

## Conceito de Logo

O logo **CLOROQUIL** usa:
- **Cor principal:** Azul (#1E88E5) sobre fundo escuro
- **Tipografia:** Bold, espaçamento largo, letras maiúsculas
- **Tema:** Limpeza e frescor — visual limpo e minimalista
- **Tagline:** "Produtos de Limpeza" em verde (#43A047)
