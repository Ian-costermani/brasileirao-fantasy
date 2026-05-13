// Manifesto de fotos de jogadores em /players/.
// Slug do arquivo (sem extensão) bate com slugify(apelido) na maioria dos casos.
// Os arquivos moram no repo de assets (servido via CDN). Manifest gerado
// por scripts/gerar-manifests.sh, committed aqui pra o servidor saber
// quais arquivos existem sem precisar ler do disco em runtime.

import { PLAYERS_MANIFEST } from "./players-manifest.ts";

const MANIFEST = new Map<string, string>(Object.entries(PLAYERS_MANIFEST));

export function slugifyApelido(apelido: string): string {
  return apelido
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

import { cdn } from "./cdn.ts";

export function fotoUrl(apelido: string | null | undefined): string | null {
  if (!apelido) return null;
  const file = MANIFEST.get(slugifyApelido(apelido));
  return file ? cdn(`/players/${file}`) : null;
}
