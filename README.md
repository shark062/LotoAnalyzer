
# 🦈 Shark Loterias

Sistema avançado de análise de loterias brasileiras com inteligência artificial.

## 🚀 Deploy Rápido

### Heroku
```bash
# Clone o repositório
git clone <your-repo-url>
cd shark-loterias

# Deploy no Heroku
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
```

### Render
1. Conecte seu repositório no Render
2. Configure as variáveis de ambiente
3. Deploy automático será feito

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway link
railway up
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🛠️ Desenvolvimento Local

```bash
# Setup inicial
chmod +x scripts/setup.sh
./scripts/setup.sh

# Configurar banco de dados
npm run db:push

# Iniciar desenvolvimento
npm run dev
```

## 📦 Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/shark_loterias
NODE_ENV=development
PORT=5000
```

## 🗄️ Banco de Dados

O projeto suporta PostgreSQL. Configure `DATABASE_URL` para sua instância.

## 📋 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Build para produção
- `npm run db:push` - Sincroniza schema do banco

## 🐳 Docker (Opcional)

```bash
# Desenvolvimento com Docker
docker-compose up -dev

# Produção
docker build -t shark-loterias .
docker run -p 5000:5000 shark-loterias
```

## 🌟 Funcionalidades

- ✅ Análise de todas as loterias brasileiras
- ✅ IA para predições e padrões
- ✅ Interface cyberpunk responsiva
- ✅ Mapas de calor interativos
- ✅ Contadores em tempo real
- ✅ PWA com suporte offline

## 🔧 Tecnologias

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, Tailwind CSS
- **Banco**: PostgreSQL, Drizzle ORM
- **UI**: Radix UI, Framer Motion
- **Deploy**: Agnóstico - funciona em qualquer plataforma

## 📞 Suporte

Para suporte e dúvidas, abra uma issue no repositório.
