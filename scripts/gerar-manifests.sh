#!/usr/bin/env bash
# Regera os manifests estáticos lidos no boot do servidor.
# Roda quando os assets mudam (novos cutouts, novos players, etc).
#
# Manifests gerados:
#   - lib/cutouts-manifest.ts   (ids dos atletas com PNG em /atletas/)
#   - lib/players-manifest.ts   (slugs dos arquivos em /players/)
#
# Esses arquivos são committed no repo de código porque o servidor
# (Deno Deploy) não tem acesso direto aos arquivos de imagem — eles
# moram no repo de assets servido via CDN.

set -euo pipefail
cd "$(dirname "$0")/.."

# --- Cutouts (PNGs de atletas) ---
{
  echo "// AUTO-GERADO por scripts/gerar-manifests.sh"
  echo "// IDs de atletas com cutout PNG em /atletas/{id}.png"
  echo
  echo "export const CUTOUTS_DISPONIVEIS = new Set<string>(["
  ls static/atletas/ | grep '\.png$' | sed 's/\.png$//' | sort -n | sed 's/.*/  "&",/'
  echo "]);"
} > lib/cutouts-manifest.ts

CUTOUTS=$(grep -c '^  "' lib/cutouts-manifest.ts)
echo "✓ lib/cutouts-manifest.ts ($CUTOUTS ids)"

# --- Players (JPGs/WEBPs/PNGs de jogadores) ---
{
  echo "// AUTO-GERADO por scripts/gerar-manifests.sh"
  echo "// slug → filename pros arquivos em /players/{file}"
  echo
  echo "export const PLAYERS_MANIFEST: Record<string, string> = {"
  ls static/players/ | grep -E '\.(jpg|jpeg|png|webp)$' | awk -F. '{
    name = $0
    ext_start = length($0) - length($NF)
    slug = substr($0, 1, ext_start - 1)
    gsub(/"/, "\\\"", slug)
    gsub(/"/, "\\\"", name)
    printf "  \"%s\": \"%s\",\n", slug, name
  }'
  echo "};"
} > lib/players-manifest.ts

PLAYERS=$(grep -c '^  "' lib/players-manifest.ts)
echo "✓ lib/players-manifest.ts ($PLAYERS files)"
