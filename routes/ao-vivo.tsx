import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { CHAVES_TIMES, getAllElencos, getFotos } from "../lib/kv.ts";
import { calcularMelhorTime } from "../lib/substituicao.ts";
import {
  type CartolaClube,
  type CartolaPartida,
  fetchAtletasPontuados,
  fetchMercadoStatus,
  fetchPartidas,
} from "../lib/cartola.ts";
import TopBar from "../components/TopBar.tsx";
import BottomNav from "../components/BottomNav.tsx";
import TeamCrest from "../components/TeamCrest.tsx";
import SectionHeader from "../components/SectionHeader.tsx";
import Pill from "../components/Pill.tsx";
import Field, { type Escalacao, type Pino } from "../components/Field.tsx";
import Partidas from "../components/Partidas.tsx";
import { escudoUrl } from "../lib/escudos.ts";
import { coresClube } from "../lib/cores.ts";
import { fotoUrl } from "../lib/fotos.ts";
import { timeLigaInfo } from "../lib/times-liga.ts";
import { eventos, type EventoScout } from "../lib/scout.ts";

const CHAVE_USUARIO = "aguiar";

const POS_ABREV: Record<string, string> = {
  "Goleiro": "GOL",
  "Lateral": "LAT",
  "Zagueiro": "ZAG",
  "Meia": "MEI",
  "Atacante": "ATK",
  "Técnico": "TEC",
};

interface JogadorAoVivo {
  atleta_id: number;
  apelido: string;
  clube: string;
  posicao: string;
  pontos: number;
  entrouEmCampo: boolean;
  substituido: boolean;
  escudo: string | null;
  foto: string | null;
  events: EventoScout[];
}

interface AoVivoData {
  rodada: number;
  status: "aberto" | "fechado" | "ao_vivo" | "encerrado";
  bolaRolando: boolean;
  totalParcial: number;
  jogadores: JogadorAoVivo[];
  escalacao: Escalacao | null;
  partidas: CartolaPartida[];
  clubesPartidas: Record<string, CartolaClube>;
  atualizadoEm: string;
}

export const handler: Handlers<AoVivoData> = {
  async GET(_req, ctx) {
    const kv = await Deno.openKv();
    const [elencos, fotos, mercado, pontuados, partidasResp] = await Promise
      .all([
        getAllElencos(kv),
        getFotos(kv),
        fetchMercadoStatus().catch(() => null),
        fetchAtletasPontuados().catch(() => null),
        fetchPartidas().catch(() => null),
      ]);

    const elenco = elencos[CHAVE_USUARIO];
    if (!elenco) {
      return ctx.render({
        rodada: 0,
        status: "fechado",
        bolaRolando: false,
        totalParcial: 0,
        jogadores: [],
        escalacao: null,
        partidas: [],
        clubesPartidas: {},
        atualizadoEm: new Date().toISOString(),
      });
    }

    const escaladosCalc = calcularMelhorTime(Object.values(elenco.jogadores))
      .filter((j) => j.escalacao === "Sim");

    const jogadores: JogadorAoVivo[] = escaladosCalc.map((j) => {
      const pontuadoApi = pontuados?.atletas?.[String(j.atleta_id)] as
        | {
          pontuacao?: number;
          scout?: Record<string, number>;
          entrou_em_campo?: boolean;
        }
        | undefined;
      const pts = pontuadoApi?.pontuacao ?? j.pontos ?? 0;
      const entrou = pontuadoApi?.entrou_em_campo ?? j.entrou_em_campo ?? false;
      return {
        atleta_id: j.atleta_id,
        apelido: j.apelido_api,
        clube: j.clube,
        posicao: j.posicao,
        pontos: pts,
        entrouEmCampo: !!entrou,
        substituido: !!j.substituido,
        escudo: escudoUrl(j.clube),
        foto: fotos[String(j.atleta_id)] ?? fotoUrl(j.apelido_api) ?? null,
        events: eventos(pontuadoApi?.scout),
      };
    });

    const totalParcial = Math.round(
      jogadores.reduce((s, j) => s + (j.pontos ?? 0), 0) * 100,
    ) / 100;

    // Monta Escalacao pro Field
    const pino = (j: JogadorAoVivo): Pino => ({
      nome: j.apelido,
      pts: j.pontos,
      escudo: j.escudo,
      cores: coresClube(j.clube),
      pos: POS_ABREV[j.posicao],
      foto: j.foto,
    });
    const gk = jogadores.find((j) => j.posicao === "Goleiro");
    const def = jogadores.filter((j) =>
      j.posicao === "Zagueiro" || j.posicao === "Lateral"
    );
    const mid = jogadores.filter((j) => j.posicao === "Meia");
    const ata = jogadores.filter((j) => j.posicao === "Atacante");
    const escalacao: Escalacao | null = jogadores.length
      ? {
        gk: gk ? pino(gk) : {},
        def: def.map(pino),
        mid: mid.map(pino),
        ata: ata.map(pino),
      }
      : null;

    // Sobrescreve escudos das partidas pra usar locais
    const clubesPartidas: Record<string, CartolaClube> = {};
    for (const [id, c] of Object.entries(partidasResp?.clubes ?? {})) {
      const nome = c.nome_fantasia ?? c.nome ?? "";
      const url = escudoUrl(nome);
      clubesPartidas[id] = url
        ? { ...c, escudos: { ...(c.escudos ?? {}), "30x30": url } }
        : c;
    }

    const status: AoVivoData["status"] = mercado?.status_mercado === 2
      ? "aberto"
      : mercado?.bola_rolando
      ? "ao_vivo"
      : "fechado";

    return ctx.render({
      rodada: mercado?.rodada_atual ?? 0,
      status,
      bolaRolando: mercado?.bola_rolando ?? false,
      totalParcial,
      jogadores,
      escalacao,
      partidas: partidasResp?.partidas ?? [],
      clubesPartidas,
      atualizadoEm: new Date().toISOString(),
    });
  },
};

export default function AoVivo({ data }: PageProps<AoVivoData>) {
  const visual = timeLigaInfo(CHAVE_USUARIO);
  const meta = CHAVES_TIMES[CHAVE_USUARIO];
  const displayName = visual?.displayName ?? meta?.nome_time ?? "Time";
  const ptsFmt = data.totalParcial.toFixed(1).replace(".", ",");
  const isLive = data.bolaRolando || data.status === "ao_vivo";

  // Jogadores com eventos relevantes (chave) — pra timeline
  const comEventos = data.jogadores
    .filter((j) => j.events.length > 0)
    .sort((a, b) => b.pontos - a.pontos);

  return (
    <>
      <Head>
        <title>Ao Vivo · Brasileirão Fantasy</title>
        <link rel="stylesheet" href="/bf-styles.css?v=2" />
      </Head>
      <div class="bf-viewport">
        <TopBar />

        <div class="bf-aovivo-hero">
          {isLive
            ? <Pill variant="lime" live>Ao Vivo · Rodada {data.rodada}</Pill>
            : (
              <Pill>
                {data.status === "aberto" ? "Mercado aberto" : "Fora da rodada"}
                {" · Rodada "}
                {data.rodada}
              </Pill>
            )}
          <div class="bf-aovivo-hero__total">
            <span class="bf-label-micro">Sua parcial</span>
            <span class="bf-aovivo-hero__total-value">{ptsFmt}</span>
            <span class="bf-aovivo-hero__total-foot">pontos</span>
          </div>
          <div class="bf-aovivo-hero__team">
            <TeamCrest chave={CHAVE_USUARIO} size={28} />
            <span>{displayName}</span>
          </div>
        </div>

        <SectionHeader>Campo</SectionHeader>
        {data.escalacao
          ? (
            <Field
              jogadores={data.escalacao}
              showPoints
              accent={visual?.accent}
            />
          )
          : <div class="bf-empty-state">Sem escalação</div>}

        <SectionHeader>Eventos da rodada</SectionHeader>
        {comEventos.length === 0
          ? (
            <div class="bf-empty-state">
              {isLive ? "Aguardando eventos…" : "Sem dados de rodada"}
            </div>
          )
          : (
            <div class="bf-events">
              {comEventos.map((j) => (
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
                    <div class="bf-event-row__events">
                      {j.events.slice(0, 6).map((e) => (
                        <span
                          class={`bf-event-row__pill bf-event-row__pill--${e.info.tipo}`}
                          key={e.codigo}
                          title={e.info.label}
                        >
                          <span class="bf-event-row__pill-icon">
                            {e.info.icon}
                          </span>
                          {e.qtd > 1 && (
                            <span class="bf-event-row__pill-qtd">×{e.qtd}</span>
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
        <Partidas
          partidas={data.partidas}
          clubes={data.clubesPartidas}
        />

        <BottomNav active="live" />
      </div>
    </>
  );
}
