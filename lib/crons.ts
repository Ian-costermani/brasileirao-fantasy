import {
  fetchMercadoStatus,
  fetchAtletasMercado,
  fetchAtletasPontuados,
  POSICAO_ID_NOME,
  POSICAO_NOME_CHAVE,
} from "./cartola.ts";
import {
  getAllElencos,
  setElenco,
  setRodadaStatus,
  POSICAO_CHAVES_CACHE,
} from "./kv.ts";
import type { AtletaCacheKV } from "./types.ts";

async function sincronizarAtletas(kv: Deno.Kv): Promise<void> {
  const data = await fetchAtletasMercado();
  const now = new Date().toISOString();

  // Atualiza cache de atletas por posição (para busca/troca)
  const grupos: Record<string, Record<string, { apelido: string; clube: string; clube_id: number; posicao: string; posicao_id: number }>> = {};
  for (const c of POSICAO_CHAVES_CACHE) grupos[c] = {};

  const statusMap = new Map<number, number | null>();

  for (const a of data.atletas) {
    const posNome = POSICAO_ID_NOME[a.posicao_id];
    if (!posNome) continue;
    const posChave = POSICAO_NOME_CHAVE[posNome];
    if (!posChave || !grupos[posChave]) continue;
    const clube = data.clubes[String(a.clube_id)];
    grupos[posChave][String(a.atleta_id)] = {
      apelido: a.apelido,
      clube: clube?.nome ?? "",
      clube_id: a.clube_id,
      posicao: posNome,
      posicao_id: a.posicao_id,
    };
    statusMap.set(a.atleta_id, a.status_id ?? null);
  }

  for (const [chave, atletas] of Object.entries(grupos)) {
    const cache: AtletaCacheKV = { atualizadoEm: now, atletas };
    await kv.set(["atletas_cache", chave], cache);
  }

  // Atualiza status_id nos elencos (lesionado, suspenso, provável, etc.)
  const elencos = await getAllElencos(kv);
  for (const [chave, elenco] of Object.entries(elencos)) {
    let alterado = false;
    for (const [id, jogador] of Object.entries(elenco.jogadores)) {
      const sid = statusMap.get(jogador.atleta_id);
      if (sid === undefined) continue;
      if (jogador.status_id === sid) continue;
      elenco.jogadores[id] = {
        ...jogador,
        status_id: sid,
        provavel:  sid === 5,
        lesionado: sid === 2,
        suspenso:  sid === 3,
        nulo:      sid === 6,
      };
      alterado = true;
    }
    if (alterado) await setElenco(kv, chave, elenco);
  }

  console.log(`[cron] atletas sincronizados: ${data.atletas.length}`);
}

async function atualizarTudo(kv: Deno.Kv): Promise<void> {
  const now = new Date().toISOString();

  // Sempre busca apenas o status do mercado (leve)
  const mercado = await fetchMercadoStatus();

  // Mercado aberto: apenas salva status aguardando, sem buscar atletas
  if (mercado.status_mercado === 2) {
    await setRodadaStatus(kv, {
      status: "aguardando",
      rodada: mercado.rodada_atual,
      fechamento: mercado.fechamento,
      atualizadoEm: now,
    });
    return;
  }

  // Mercado fechado: busca pontuados para scoring ao vivo
  let pontuados;
  try {
    pontuados = await fetchAtletasPontuados();
  } catch {
    await setRodadaStatus(kv, {
      status: "aguardando_inicio",
      rodada: mercado.rodada_atual,
      atualizadoEm: now,
    });
    return;
  }

  if (!pontuados?.atletas || Object.keys(pontuados.atletas).length === 0) {
    await setRodadaStatus(kv, {
      status: "aguardando_inicio",
      rodada: mercado.rodada_atual,
      atualizadoEm: now,
    });
    return;
  }

  // Atualiza pontos + entrou_em_campo nos elencos
  const elencos = await getAllElencos(kv);
  for (const [chave, elenco] of Object.entries(elencos)) {
    let alterado = false;
    for (const [id, jogador] of Object.entries(elenco.jogadores)) {
      const p = pontuados.atletas[String(jogador.atleta_id)];
      if (!p) continue;
      const novoPontos = p.pontuacao ?? 0;
      const novoEntrou = p.entrou_em_campo ?? null;
      if (jogador.pontos === novoPontos && jogador.entrou_em_campo === novoEntrou) continue;
      elenco.jogadores[id] = { ...jogador, pontos: novoPontos, entrou_em_campo: novoEntrou };
      alterado = true;
    }
    if (alterado) await setElenco(kv, chave, elenco);
  }

  await setRodadaStatus(kv, {
    status: "ao_vivo",
    rodada: pontuados.rodada_id ?? mercado.rodada_atual,
    atualizadoEm: now,
  });

  console.log(`[cron] pontuação atualizada: rodada ${pontuados.rodada_id}`);
}

export function registrarCrons(): void {
  // Sync do catálogo de atletas: 1× por dia às 9h UTC (= 6h BRT)
  Deno.cron("sync-atletas", "0 9 * * *", async () => {
    try {
      const kv = await Deno.openKv();
      await sincronizarAtletas(kv);
    } catch (e) {
      console.error("[cron] sync-atletas erro:", e);
    }
  });

  // Status + pontuação ao vivo: a cada 5 minutos
  Deno.cron("atualizar", "*/5 * * * *", async () => {
    try {
      const kv = await Deno.openKv();
      await atualizarTudo(kv);
    } catch (e) {
      console.error("[cron] atualizar erro:", e);
    }
  });
}
