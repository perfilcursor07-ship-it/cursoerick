#!/bin/bash
set -e

echo ""
echo "========================================"
echo "   Deploy - NomadeFace"
echo "========================================"
echo ""

echo "==> [1/5] Pull do repositorio..."
git pull origin main

echo "==> [2/5] Instalando dependencias..."
npm install --omit=dev

echo "==> [3/5] Rodando migrations..."
npm run migrate

echo "==> [4/5] Build de producao..."
npm run build

echo "==> [5/5] Reiniciando app (PM2)..."
pm2 restart cursoerick || pm2 start npm --name "cursoerick" -- start -- -p 3312

echo ""
echo "========================================"
echo "   Deploy concluido com sucesso!"
echo "========================================"
echo ""
