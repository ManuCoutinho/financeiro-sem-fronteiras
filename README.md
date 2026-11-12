# Financeiro sem Fronteiras

PWA de controle de caixa e estoque para uma designer de sobrancelhas. React + TypeScript + Vite sobre Firebase (Auth, Firestore e Hosting), no plano gratuito.

## Pré-requisitos

- Node.js na versão de `.nvmrc` (`nvm use`)
- Java 21+ (emulador do Firestore)
- Acesso ao GitHub por SSH

## Começando

```bash
git clone git@github.com:ManuCoutinho/financeiro-sem-fronteiras.git
cd financeiro-sem-fronteiras
npm ci
cp .env.local.example .env.local
npm run dev
```

## Configuração

- `.env` (versionado): padrões não sensíveis (projeto, locale, moeda, fuso, cores, emuladores).
- `.env.local` (fora do Git): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID` e `OWNER_UID`. Também pode sobrescrever qualquer valor do `.env`.
- Toda leitura de env passa por `src/config/env.ts`, que valida as variáveis na inicialização.

## Scripts

| Script                               | O que faz                                                   |
| ------------------------------------ | ----------------------------------------------------------- |
| `npm run dev`                        | Servidor de desenvolvimento                                 |
| `npm run build`                      | Typecheck e build de produção com PWA                       |
| `npm run lint` / `npm run typecheck` | ESLint e TypeScript                                         |
| `npm run format`                     | Prettier                                                    |
| `npm test`                           | Testes unitários (Vitest)                                   |
| `npm run test:rules`                 | Testes das regras do Firestore no emulador                  |
| `npm run rules:render`               | Gera `firestore.rules` a partir do template com `OWNER_UID` |
| `npm run deploy:rules`               | Gera e publica as regras do Firestore                       |
| `npm run deploy:hosting`             | Build e publicação do Hosting                               |

## Padrões

Código em inglês, interface em pt-BR, sem comentários desnecessários, commits assinados (SSH) pela autora e configuração via env. Detalhes no guia técnico.
