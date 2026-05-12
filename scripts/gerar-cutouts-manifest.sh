#!/usr/bin/env bash
# Regera lib/cutouts-manifest.ts a partir dos arquivos em static/atletas/
# Rode sempre que adicionar/remover cutouts no diretório.
#
# Uso: ./scripts/gerar-cutouts-manifest.sh
set -euo pipefail

cd "$(dirname "$0")/.."

OUT="lib/cutouts-manifest.ts"

{
  echo "// AUTO-GERADO por scripts/gerar-cutouts-manifest.sh"
  echo "// IDs de atletas com cutout em static/atletas/{id}.png — Deno Deploy não"
  echo "// consegue ler static/ via Deno.readDir, então mantemos manifesto estático."
  echo
  echo "export const CUTOUTS_DISPONIVEIS = new Set<string>(["
  ls static/atletas/ \
    | grep '\.png$' \
    | sed 's/\.png$//' \
    | sort -n \
    | sed 's/.*/  "&",/'
  echo "]);"
} > "$OUT"

TOTAL=$(grep -c '^  "' "$OUT")
echo "✓ $OUT gerado com $TOTAL ids"
