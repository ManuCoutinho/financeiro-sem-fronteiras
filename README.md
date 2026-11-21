# Financeiro sem Fronteiras

PWA de controle de caixa e estoque para uma designer de sobrancelhas. React + TypeScript + Vite sobre Firebase (Auth, Firestore e Hosting), no plano gratuito.

## Pré-requisitos

- Node.js na versão de `.nvmrc` (`nvm use`)
- pnpm na versão de `packageManager` no `package.json` (`corepack enable` instala a certa)
- Java 21+ (emulador do Firestore)
- Acesso ao GitHub por SSH

## Começando

```bash
git clone git@github.com:ManuCoutinho/financeiro-sem-fronteiras.git
cd financeiro-sem-fronteiras
pnpm install --frozen-lockfile
cp .env.local.example .env.local
pnpm dev
```

## Configuração

- `.env` (versionado): padrões não sensíveis (projeto, locale, moeda, fuso, cores, emuladores).
- `.env.local` (fora do Git): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID` e `OWNER_UID`. Também pode sobrescrever qualquer valor do `.env`.
- Toda leitura de env passa por `src/config/env.ts`, que valida as variáveis na inicialização.

## Scripts

| Script                         | O que faz                                                   |
| ------------------------------ | ----------------------------------------------------------- |
| `pnpm dev`                     | Servidor de desenvolvimento                                 |
| `pnpm build`                   | Typecheck e build de produção com PWA                       |
| `pnpm lint` / `pnpm typecheck` | ESLint e TypeScript                                         |
| `pnpm format`                  | Prettier                                                    |
| `pnpm test`                    | Testes unitários (Vitest)                                   |
| `pnpm test:rules`              | Testes das regras do Firestore no emulador                  |
| `pnpm rules:render`            | Gera `firestore.rules` a partir do template com `OWNER_UID` |
| `pnpm deploy:rules`            | Gera e publica as regras do Firestore                       |
| `pnpm deploy:hosting`          | Build e publicação do Hosting                               |

Dependências: `pnpm add <pacote>` (ou `-D` para desenvolvimento). Overrides de segurança e scripts de instalação permitidos ficam no `pnpm-workspace.yaml`.

## Padrões

Código em inglês, interface em pt-BR, sem comentários desnecessários, commits assinados (SSH) pela autora e configuração via env. Detalhes no guia técnico.
