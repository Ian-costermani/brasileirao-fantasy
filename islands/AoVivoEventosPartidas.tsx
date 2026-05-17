import { useEffect, useState } from "preact/hooks";
import SectionHeader from "../components/SectionHeader.tsx";
import Partidas from "../components/Partidas.tsx";
import { escudoUrl } from "../lib/escudos.ts";
import { eventos, type EventoScout } from "../lib/scout.ts";

/** Metadados estáticos de cada atleta da liga — vêm do SSR. */
export interface AtletaMeta {
  atleta_id: number;
  apelido: string;
  clube: string;
  posicao: string;
  escudo: string | null;
  foto: string | null;
}

interface Props {
  /** Todos os atletas escalados/banco de todos os 9 times da liga.
      Usado pra filtrar pontuados (Cartola devolve TODOS os atletas
      da rodada) e pra exibir apelido/escudo/foto nos eventos. */
  ligaAtletas: AtletaMeta[];
}

interface PontuadoLive {
  pontuacao?: number;
  scout?: Record<string, number>;
  entrou_em_campo?: boolean;
}

interface CartolaPontuadosResp {
  atletas?: Record<string, PontuadoLive>;
}

interface CartolaPartidasResp {
  partidas?: Array<{
    partida_id: number;
    clube_casa_id: number;
    clube_visitante_id: number;
    partida_data: string;
    timestamp: number;
    placar_oficial_mandante: number | null;
    placar_oficial_visitante: number | null;
    local: string;
    status_transmissao_tr: string;
    valida: boolean;
  }>;
  clubes?: Record<string, {
    abreviacao: string;
    nome?: string;
    nome_fantasia?: string;
    escudos?: Record<string, string>;
  }>;
}

const POLL_MS = 30_000;

export default function AoVivoEventosPartidas({ ligaAtletas }: Props) {
  const [pontuados, setPontuados] = useState<CartolaPontuadosResp | null>(null);
  const [partidas, setPartidas] = useState<CartolaPartidasResp | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);

  async function refetch() {
    try {
      const [pResp, pdResp] = await Promise.all([
        fetch("/api/live/atletas/pontuados").then((r) => {
          if (!r.ok) throw new Error(`pontuados ${r.status}`);
          return r.json();
        }),
        fetch("/api/live/partidas").then((r) => {
          if (!r.ok) throw new Error(`partidas ${r.status}`);
          return r.json();
        }),
      ]);
      setPontuados(pResp);
      setPartidas(pdResp);
      setAtualizadoEm(new Date());
      setErro(null);
    } catch (e) {
      setErro(String(e));
    }
  }

  useEffect(() => {
    refetch();
    const id = setInterval(refetch, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const carregando = !pontuados && !erro;

  // Junta metadata + dados live, filtra só quem teve evento na rodada
  // (scouts não-vazios depois do filtro de chave conhecida).
  const eventosLiga = ligaAtletas
    .map((a) => {
      const live = pontuados?.atletas?.[String(a.atleta_id)];
      const evs = eventos(live?.scout).filter((e) => e.info.chave);
      return { ...a, pontos: live?.pontuacao ?? 0, events: evs };
    })
    .filter((j) => j.events.length > 0)
    .sort((a, b) => b.pontos - a.pontos);

  // Sobrescreve escudos das partidas pra usar os locais (jsDelivr)
  // em vez dos placeholders coloridos da Cartola.
  const clubesPartidas: CartolaPartidasResp["clubes"] = {};
  for (const [id, c] of Object.entries(partidas?.clubes ?? {})) {
    const nome = c.nome_fantasia ?? c.nome ?? "";
    const url = escudoUrl(nome);
    clubesPartidas![id] = url
      ? { ...c, escudos: { ...(c.escudos ?? {}), "30x30": url } }
      : c;
  }

  const atualizadoTxt = atualizadoEm
    ? atualizadoEm.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    : null;

  return (
    <>
      <SectionHeader
        right={atualizadoTxt && (
          <span class="bf-meta-text">atualizado às {atualizadoTxt}</span>
        )}
      >
        Eventos da liga
      </SectionHeader>
      {eventosLiga.length === 0
        ? (
          <div class="bf-empty-state">
            {carregando
              ? "Carregando…"
              : erro
              ? `erro: ${erro}`
              : "Aguardando eventos…"}
          </div>
        )
        : (
          <div class="bf-events">
            {eventosLiga.map((j) => (
              <article class="bf-event-row" key={j.atleta_id}>
                {j.foto && (
                  <img class="bf-event-row__face" src={j.foto} alt="" />
                )}
                <div class="bf-event-row__meta">
                  <div class="bf-event-row__name">
                    {j.escudo && (
                      <img
                        class="bf-event-row__escudo"
                        src={j.escudo}
                        alt=""
                      />
                    )}
                    {j.apelido}
                  </div>
                  <div class="bf-event-row__chips">
                    {j.events.slice(0, 6).map((e: EventoScout) => (
                      <span
                        class={`bf-event-chip bf-event-chip--${e.info.tipo}`}
                        key={e.codigo}
                        title={e.info.label}
                      >
                        <span class="bf-event-chip__icon">{e.info.icon}</span>
                        {e.qtd > 1 && (
                          <span class="bf-event-chip__qtd">{e.qtd}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div class="bf-event-row__pts">
                  <span
                    class={`bf-event-row__pts-value ${
                      j.pontos < 0 ? "bf-event-row__pts-value--neg" : ""
                    }`}
                  >
                    {j.pontos > 0 ? "+" : ""}
                    {j.pontos.toFixed(1).replace(".", ",")}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

      <SectionHeader>Partidas</SectionHeader>
      {partidas?.partidas && partidas.partidas.length > 0
        ? (
          <Partidas
            partidas={partidas.partidas}
            clubes={clubesPartidas ?? {}}
          />
        )
        : (
          <div class="bf-empty-state">
            {carregando ? "Carregando…" : "Sem partidas"}
          </div>
        )}
    </>
  );
}
