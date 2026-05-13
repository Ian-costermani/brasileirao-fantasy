import type {
  CartolaAtleta,
  CartolaMercadoStatus,
  CartolaPontuadoAtleta,
} from "./types.ts";

const BASE = "https://api.cartola.globo.com";

export const POSICAO_ID_NOME: Record<number, string> = {
  1: "Goleiro",
  2: "Lateral",
  3: "Zagueiro",
  4: "Meia",
  5: "Atacante",
  6: "Técnico",
};

export const POSICAO_NOME_CHAVE: Record<string, string> = {
  "Goleiro": "GOL",
  "Lateral": "LAT",
  "Zagueiro": "ZAG",
  "Meia": "MEI",
  "Atacante": "ATA",
  "Técnico": "TEC",
};

// Cache in-process das chamadas Cartola — TTL curto pra balancear
// frescor (status pode mudar) vs latência (cartola atletas/mercado é
// 350KB JSON, parsing demora). Compartilhado entre requests no mesmo
// isolate do Deno Deploy.
interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}
const cartolaCache = new Map<string, CacheEntry<unknown>>();
const CARTOLA_TTL_MS: Record<string, number> = {
  "/atletas/mercado": 60_000, // 1min — catálogo muda pouco
  "/mercado/status": 30_000, // 30s — bola_rolando precisa ser fresco
  "/partidas": 60_000,
  "/atletas/pontuados": 15_000, // 15s — durante rodada muda rápido
};
const CARTOLA_TTL_DEFAULT = 60_000;

async function fetchCartola<T>(path: string): Promise<T> {
  const now = Date.now();
  const cached = cartolaCache.get(path);
  if (cached && cached.expiresAt > now) return cached.value as T;
  const r = await fetch(`${BASE}${path}`, {
    headers: { "User-Agent": "Mozilla/5.0 CartolaMiniApp/1.0" },
  });
  if (!r.ok) throw new Error(`Cartola ${path} → ${r.status}`);
  const value = await r.json() as T;
  const ttl = CARTOLA_TTL_MS[path] ?? CARTOLA_TTL_DEFAULT;
  cartolaCache.set(path, { value, expiresAt: now + ttl });
  return value;
}

export function fetchMercadoStatus(): Promise<CartolaMercadoStatus> {
  return fetchCartola("/mercado/status");
}

export function fetchAtletasMercado(): Promise<{
  atletas: CartolaAtleta[];
  clubes: Record<
    string,
    { nome: string; abreviacao: string; nome_fantasia?: string }
  >;
  posicoes: Record<string, { nome: string; abreviacao: string }>;
  rodada_atual: number;
}> {
  return fetchCartola("/atletas/mercado");
}

/** Versão slim do clube — só nome+abreviacao (resto não usamos). */
type ClubeMin = { nome: string; abreviacao: string; nome_fantasia?: string };

/** Cache em KV da resposta do Cartola /atletas/mercado. Resposta crua é
 *  ~350KB JSON; persistimos em chunks porque o limite por value em
 *  Deno KV é ~64KB. Retorna mesmo shape de fetchAtletasMercado(). */
const MERCADO_CACHE_TTL_MS = 5 * 60 * 1000; // 5min
const CHUNK_SIZE = 200; // ~16-20KB por chunk

interface ChunkMeta {
  rodada: number;
  cachedAt: number;
  clubes: Record<string, ClubeMin>;
  chunkCount: number;
}

export async function fetchAtletasMercadoCacheado(kv: Deno.Kv): Promise<{
  atletas: CartolaAtleta[];
  clubes: Record<string, ClubeMin>;
  rodada_atual: number;
}> {
  const META_KEY = ["mercado_cache", "meta"];
  const metaRes = await kv.get<ChunkMeta>(META_KEY);
  const now = Date.now();
  if (metaRes.value && now - metaRes.value.cachedAt < MERCADO_CACHE_TTL_MS) {
    const meta = metaRes.value;
    const chunkPromises: Promise<Deno.KvEntryMaybe<CartolaAtleta[]>>[] = [];
    for (let i = 0; i < meta.chunkCount; i++) {
      chunkPromises.push(kv.get<CartolaAtleta[]>(["mercado_cache", "c", i]));
    }
    const chunks = await Promise.all(chunkPromises);
    const atletas: CartolaAtleta[] = [];
    for (const ch of chunks) {
      if (ch.value) atletas.push(...ch.value);
    }
    return { rodada_atual: meta.rodada, clubes: meta.clubes, atletas };
  }
  const fresh = await fetchAtletasMercado();
  // Persiste em chunks em background (não bloqueia o retorno)
  void (async () => {
    try {
      const count = Math.ceil(fresh.atletas.length / CHUNK_SIZE);
      // KV atomic permite múltiplos sets numa transação só
      let tx = kv.atomic();
      for (let i = 0; i < count; i++) {
        const chunk = fresh.atletas.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        tx = tx.set(["mercado_cache", "c", i], chunk);
      }
      tx = tx.set(META_KEY, {
        rodada: fresh.rodada_atual,
        cachedAt: now,
        clubes: fresh.clubes,
        chunkCount: count,
      } satisfies ChunkMeta);
      await tx.commit();
    } catch (e) {
      console.warn("[mercado_cache] persist failed:", e);
    }
  })();
  return {
    atletas: fresh.atletas,
    clubes: fresh.clubes,
    rodada_atual: fresh.rodada_atual,
  };
}

export function fetchAtletasPontuados(): Promise<{
  atletas: Record<string, CartolaPontuadoAtleta>;
  rodada_id: number;
}> {
  return fetchCartola("/atletas/pontuados");
}

export interface CartolaPartida {
  partida_id: number;
  clube_casa_id: number;
  clube_visitante_id: number;
  partida_data: string; // "YYYY-MM-DD HH:MM:SS"
  timestamp: number; // Unix seconds
  placar_oficial_mandante: number | null;
  placar_oficial_visitante: number | null;
  local: string;
  status_transmissao_tr: string; // "AGENDADA" | "EM ANDAMENTO" | "ENCERRADA" | ...
  valida: boolean;
}

export interface CartolaClube {
  abreviacao: string;
  nome?: string;
  nome_fantasia?: string;
  escudos?: Record<string, string>;
}

export function fetchPartidas(): Promise<{
  partidas: CartolaPartida[];
  clubes: Record<string, CartolaClube>;
  rodada?: number;
}> {
  return fetchCartola("/partidas");
}

export function fetchPartidasRodada(rodada: number) {
  return fetchCartola<{
    partidas: CartolaPartida[];
    clubes: Record<string, CartolaClube>;
    rodada?: number;
  }>(`/partidas/${rodada}`);
}
