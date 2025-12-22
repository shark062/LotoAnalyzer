# 🦈 Shark Loterias - Deployment Guide

## Overview
Shark Loterias agora está **100% desacoplado do Replit** e pronto para deploy em qualquer plataforma!

## ✨ Mudanças Implementadas

✅ **Removidos Limites de Dezenas** - Gere jogos com qualquer quantidade de dezenas
✅ **Removidos Limites de Jogos** - Gere até 1000+ jogos sem restrições  
✅ **Remover Service Worker** - Sem amarras com Replit
✅ **Validações Simples** - Apenas verificação de tipo, sem restrições de negócio

## 🚀 Deployment Options

### Option 1: Docker (Recomendado)
```bash
docker-compose up -d
```

### Option 2: Manual (Node.js)
```bash
# Install dependencies
npm install

# Setup environment
cp .env.production .env.local

# Run migrations
npm run db:push

# Start server
npm run prod
```

### Option 3: Cloud Deployment

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Heroku
```bash
heroku create shark-loterias
git push heroku main
```

#### Railway
- Connect GitHub repository
- Set environment variables
- Deploy

## 🔧 Configuration

Create `.env.local`:
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/db
PORT=5000
```

## 📊 API Endpoints

### Game Generation (SEM LIMITES!)
```bash
POST /api/games/generate
{
  "lotteryId": "megasena",
  "numbersCount": 50,      # Qualquer quantidade!
  "gamesCount": 500,       # Sem limite!
  "strategy": "hot|cold|mixed|ai"
}
```

### Available Lotteries
- megasena
- lotofacil
- quina
- duplasena
- supersete
- milionaria
- timemania
- diadesorte
- loteca
- lotomania

## 🎯 Todas as Estratégias Funcionam

✅ Números Quentes (Hot)
✅ Números Frios (Cold)
✅ Estratégia Mista (Mixed)
✅ IA Avançada (AI)
✅ Escolha Manual (Manual)

## 📦 Production Build

```bash
npm run build
npm run prod
```

## ✅ Ready for Production! 🚀
