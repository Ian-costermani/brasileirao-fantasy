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

// Detecção de "estou rodando em Deno Deploy":
// - browser: `Deno` não existe → false (e o guard evita ReferenceError
//   na chunk client; sem ele, todos os islands quebram em hidratação).
// - Deno Deploy clássico (.deno.dev): DENO_DEPLOYMENT_ID setado.
// - Deno Deploy EA (.deno.net): DENO_DEPLOYMENT_ID pode não vir;
//   DENO_REGION / DENO_REVISION_ID costumam estar populados.
// - dev local: nenhum dos três → IN_DEPLOY=false, serve do symlink local.
function detectDenoDeploy(): boolean {
  if (typeof Deno === "undefined") return false;
  try {
    return !!(
      Deno.env.get("DENO_DEPLOYMENT_ID") ||
      Deno.env.get("DENO_REGION") ||
      Deno.env.get("DENO_REVISION_ID")
    );
  } catch {
    return false;
  }
}
const IN_DEPLOY = detectDenoDeploy();

/** Retorna a URL final do asset. URLs absolutas (http(s)://) passam direto.
 *  Em prod, paths começando com '/' viram URL absoluta do jsDelivr. */
export function cdn(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!IN_DEPLOY) return path; // dev: serve do Deno local
  if (!path.startsWith("/")) path = "/" + path;
  return CDN_BASE + path;
}
