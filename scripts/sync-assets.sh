#!/usr/bin/env bash
# Sincroniza os assets (imagens) com o repo público que alimenta o CDN.
#
# Como funciona:
#   static/atletas, static/escudos, static/players, static/times_escudos
#   são symlinks pra ~/dev/brasileirao-fantasy-assets/. Qualquer mudança
#   feita nesses dirs (ex: scripts/baixar-cutouts-faltantes.ts gerou
#   novos cutouts) já está no repo de assets. Esse script só roda
#   git add + commit + push.
#
# Após o push, o jsDelivr pode levar até ~12h pra invalidar o cache
# global automaticamente. Se quiser purge imediato:
#   curl https://purge.jsdelivr.net/gh/Iuri07/brasileirao-fantasy-assets@master/atletas/X.png
#
# Uso: ./scripts/sync-assets.sh ["mensagem do commit"]

set -euo pipefail

ASSETS_DIR="$HOME/dev/brasileirao-fantasy-assets"

if [[ ! -d "$ASSETS_DIR" ]]; then
  echo "✗ Repo de assets não encontrado em $ASSETS_DIR"
  echo "  Clone: git clone https://github.com/Iuri07/brasileirao-fantasy-assets.git $ASSETS_DIR"
  exit 1
fi

cd "$ASSETS_DIR"

# Garante que estamos no branch master e em sync com remote
git fetch origin master --quiet
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)
if [[ "$LOCAL" != "$REMOTE" ]] && ! git merge-base --is-ancestor "$REMOTE" "$LOCAL"; then
  echo "⚠ Repo de assets está atrás do remote. Rode: git -C $ASSETS_DIR pull"
  exit 1
fi

# Sumário do que vai ser commitado
STATUS=$(git status --porcelain)
if [[ -z "$STATUS" ]]; then
  echo "✓ Nada pra sincronizar — assets já estão atualizados"
  exit 0
fi

echo "== Mudanças detectadas =="
echo "$STATUS"
echo

ADDED=$(echo "$STATUS" | grep -c "^??" || true)
MODIFIED=$(echo "$STATUS" | grep -c "^.M" || true)
DELETED=$(echo "$STATUS" | grep -c "^.D" || true)

MSG="${1:-sync: +$ADDED novos / $MODIFIED alterados / $DELETED removidos}"

git add -A
git commit -m "$MSG"
git push origin master

echo
echo "✓ Sincronizado. URLs disponíveis em:"
echo "  https://cdn.jsdelivr.net/gh/Iuri07/brasileirao-fantasy-assets@master/<path>"
echo
echo "Cache do jsDelivr pode demorar até 12h pra refletir. Pra forçar"
echo "purge agora:"
echo "  curl https://purge.jsdelivr.net/gh/Iuri07/brasileirao-fantasy-assets@master/<path>"
