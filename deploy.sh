#!/bin/bash
set -e

echo ""
echo "========================================"
echo "   Deploy - NomadeFace"
echo "========================================"
echo ""

echo "==> [1/3] Pull do repositorio..."
git pull origin main

echo "==> [2/3] Instalando dependencias..."
npm install --omit=dev

echo "==> [3/3] Build de producao..."
npm run build

echo ""
echo "========================================"
echo "   Deploy concluido com sucesso!"
echo "========================================"
echo ""
