// Redirecionamento de assets estáticos pro CDN do jsDelivr em produção.
//
// O Deno Deploy serve os estáticos, mas pra ~310 imagens pequenas
// (cutouts, escudos, players) o overhead de TTFB do edge da Deno
// somado a muitos round-trips fica perceptível. O jsDelivr serve
// direto do GitHub com cache agressivo e múltiplos PoPs globais.
//
// Em desenvolvimento usa o path relativo (Deno serve local de static/),
// pra não depender do GitHub ter o arquivo já comitado.

// Repo público de assets (separado do código). jsDelivr serve direto do
// GitHub com cache global agressivo. Pra invalidar cache depois de
// novas imagens: bumpar `@vN` aqui (tag) ou só esperar (~12h pra purge).
const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/Iuri07/brasileirao-fantasy-assets@master";

const IN_DEPLOY = !!Deno.env.get("DENO_DEPLOYMENT_ID");

/** Retorna a URL final do asset. URLs absolutas (http(s)://) passam direto.
 *  Em prod, paths começando com '/' viram URL absoluta do jsDelivr. */
export function cdn(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!IN_DEPLOY) return path; // dev: serve do Deno local
  if (!path.startsWith("/")) path = "/" + path;
  return CDN_BASE + path;
}
