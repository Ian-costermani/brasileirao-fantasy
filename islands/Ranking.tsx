import { useEffect, useRef, useState } from "preact/hooks";
import { Bola } from "../components/Bola.tsx";
import { GraficoLinhas, type TimeDados } from "../components/GraficoLinhas.tsx";

interface Jogador {
  nome: string;
  posicao: string;
  pontuacao: number;
  escalacao: "Sim" | "Banco" | "Não";
}

interface Time {
  nome: string;
  dono: string;
  pontuacao: number;
  jogadores: Jogador[];
}

interface RodadaDados {
  rodada: number;
  atualizadoEm: string;
  status?: string;
  times: Time[];
}

type Aba = "elenco" | "ao_vivo" | "classificacao";

const POSICAO_CSS: Record<string, string> = {
  "Goleiro": "gol", "Zagueiro": "zag", "Lateral": "lat",
  "Meia": "mei", "Atacante": "atk", "Técnico": "tec",
};

const POSICAO_ABREV: Record<string, string> = {
  "Goleiro": "GOL", "Zagueiro": "ZAG", "Lateral": "LAT",
  "Meia": "MEI", "Atacante": "ATK", "Técnico": "TEC",
};

const CORES_TIMES: Record<string, string> = {
  "FILHOS DE KIEZA":     "#f79a99",
  "BOTAFOFO FR":         "#FDCAAA",
  "MALVADINHOS FC":      "#F8FAA9",
  "CHUTOCA FC":          "#D1FA9E",
  "BENDERMEM 23":        "#AFF8A9",
  "888 PARTNERS":        "#B8F8D2",
  "TODOS COM BOLSONARO": "#BEF3F6",
  "PIRATAS DO CARILLE":  "#9FC5E8",
  "DORIVAL JUNIORS":     "#E3C0F3",
};

const ORDEM_ELENCO: Record<string, number> = {
  "FILHOS DE KIEZA": 0, "BOTAFOFO FR": 1, "MALVADINHOS FC": 2,
  "CHUTOCA FC": 3, "BENDERMEM 23": 4, "888 PARTNERS": 5,
  "TODOS COM BOLSONARO": 6, "PIRATAS DO CARILLE": 7, "DORIVAL JUNIORS": 8,
};

const NOMES_ELENCO: Record<string, string> = {
  "MALVADINHOS FC":      "Ilha de Paquetá",
  "CHUTOCA FC":          "Crefilho da Gama",
  "TODOS COM BOLSONARO": "Moleicester City",
  "PIRATAS DO CARILLE":  "Papai Chegou FC",
  "DORIVAL JUNIORS":     "Pedro Álvares Pardal",
};

const INTERVALO_POLLING = 2 * 60 * 1000;

export default function Ranking() {
  const [dados, setDados] = useState<RodadaDados | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<Aba>("elenco");
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set());
  const [ultimaVerificacao, setUltimaVerificacao] = useState<Date | null>(null);
  const [minutosAtras, setMinutosAtras] = useState(0);
  const [classificacao, setClassificacao] = useState<TimeDados[] | null>(null);
  const [carregandoClassif, setCarregandoClassif] = useState(false);
  const abaInicializada = useRef(false);

  const buscarDados = async () => {
    try {
      const resposta = await fetch("/api/ranking");
      const json: RodadaDados | null = await resposta.json();
      if (json) {
        setDados(json);
        // Define aba padrão apenas na primeira carga
        if (!abaInicializada.current) {
          setAba(json.status === "pre_rodada" ? "elenco" : "ao_vivo");
          abaInicializada.current = true;
        }
      }
      setUltimaVerificacao(new Date());
    } catch (erro) {
      console.error("Erro ao buscar ranking:", erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarDados();
    const intervalo = setInterval(buscarDados, INTERVALO_POLLING);
    return () => clearInterval(intervalo);
  }, []);

  // Busca dados de classificação apenas quando a aba é aberta (lazy)
  useEffect(() => {
    if (aba !== "classificacao" || classificacao || carregandoClassif) return;
    setCarregandoClassif(true);
    fetch("/api/classificacao")
      .then((r) => r.json())
      .then((json) => setClassificacao(json))
      .catch((e) => console.error("Erro classificação:", e))
      .finally(() => setCarregandoClassif(false));
  }, [aba]);

  useEffect(() => {
    const calcular = () => {
      if (!ultimaVerificacao) return;
      setMinutosAtras(Math.floor((Date.now() - ultimaVerificacao.getTime()) / 60_000));
    };
    calcular();
    const timer = setInterval(calcular, 30_000);
    return () => clearInterval(timer);
  }, [ultimaVerificacao]);

  const toggleExpandir = (index: number) => {
    setExpandidos((prev) => {
      const novo = new Set(prev);
      novo.has(index) ? novo.delete(index) : novo.add(index);
      return novo;
    });
  };

  const textoAtualizacao = () => {
    if (!ultimaVerificacao) return "";
    if (minutosAtras === 0) return "Verificado agora";
    if (minutosAtras === 1) return "Verificado há 1 min";
    return `Verificado há ${minutosAtras} min`;
  };

  const classeEscalacao = (esc: string) => {
    if (esc === "Banco") return "esc-banco";
    if (esc === "Não") return "esc-nao";
    return "";
  };

  if (carregando) {
    return (
      <div class="loading">
        <div class="loading-spinner" />
        <p>Carregando dados da rodada...</p>
      </div>
    );
  }

  // Abas sempre visíveis — mesmo sem dados
  const tabBar = (
    <div class="tab-bar">
      <button
        class={`tab-btn${aba === "elenco" ? " tab-ativa" : ""}`}
        onClick={() => { setAba("elenco"); setExpandidos(new Set()); }}
      >
        <Bola size={13} class="tab-icone" />
        Elenco
      </button>
      <button
        class={`tab-btn${aba === "ao_vivo" ? " tab-ativa" : ""}`}
        onClick={() => { setAba("ao_vivo"); setExpandidos(new Set()); }}
      >
        <span class="tab-dot-ao-vivo" />
        Ao Vivo
      </button>
      <button
        class={`tab-btn${aba === "classificacao" ? " tab-ativa" : ""}`}
        onClick={() => { setAba("classificacao"); setExpandidos(new Set()); }}
      >
        <span class="tab-icone-classif">📈</span>
        Classificação
      </button>
    </div>
  );

  if (!dados) {
    return (
      <div class="ranking-container">
        {tabBar}
        <div class="sem-dados">
          <Bola size={52} class="sem-dados-icone-svg" />
          <h2>Aguardando início da rodada...</h2>
          <p>Os dados aparecerão aqui assim que a rodada começar.</p>
          <button class="btn-atualizar" onClick={buscarDados}>Verificar agora</button>
        </div>
      </div>
    );
  }

  // Aba classificação — renderiza independente dos dados de ranking
  if (aba === "classificacao") {
    return (
      <div class="ranking-container">
        {tabBar}
        <div class="rodada-info">
          <span class="rodada-badge rodada-badge-pre">Temporada</span>
          <span class="atualizacao-info">{textoAtualizacao()}</span>
        </div>
        {carregandoClassif
          ? <div class="loading"><div class="loading-spinner" /><p>Carregando classificação...</p></div>
          : !classificacao
            ? <div class="sem-dados">
                <p style="color:var(--text-3);font-size:.9rem;">Nenhum dado de classificação disponível ainda.</p>
              </div>
            : <GraficoLinhas dados={classificacao} coresTimes={CORES_TIMES} />}
      </div>
    );
  }

  const preRodada = dados.status === "pre_rodada";
  const modoElenco = aba === "elenco";

  // Ordena conforme a aba ativa
  const timesSorted = [...dados.times].sort((a, b) =>
    modoElenco
      ? (ORDEM_ELENCO[a.nome] ?? 99) - (ORDEM_ELENCO[b.nome] ?? 99)
      : b.pontuacao - a.pontuacao
  );

  // Aba "Ao Vivo" ainda sem dados de rodada
  const aoVivoSemRodada = aba === "ao_vivo" && preRodada;

  return (
    <div class="ranking-container">
      {tabBar}

      {/* Indicador de rodada / atualização */}
      <div class="rodada-info">
        {modoElenco
          ? <span class="rodada-badge rodada-badge-pre">Elenco</span>
          : preRodada
            ? <span class="rodada-badge rodada-badge-pre">Aguardando</span>
            : <span class="rodada-badge">Rodada {dados.rodada}</span>}
        <span class="atualizacao-info">{textoAtualizacao()}</span>
      </div>

      {/* Aba Ao Vivo sem rodada em andamento */}
      {aoVivoSemRodada && (
        <div class="sem-dados">
          <Bola size={52} class="sem-dados-icone-svg" />
          <h2>Rodada ainda não começou</h2>
          <p>O ranking aparecerá aqui assim que os jogos começarem.</p>
        </div>
      )}

      {/* Lista de times */}
      {!aoVivoSemRodada && (
        <div class="times-lista">
          {timesSorted.map((time, index) => (
            <div
              key={`${time.nome}-${index}`}
              class={`time-card${!modoElenco && index === 0 ? " primeiro-lugar" : ""}${
                expandidos.has(index) ? " expandido" : ""
              }`}
              onClick={() => toggleExpandir(index)}
              role="button"
              aria-expanded={expandidos.has(index)}
            >
              <div class="time-header">
                <div class="posicao-wrapper">
                  <span class="posicao">
                    {modoElenco
                      ? <Bola size={18} color={CORES_TIMES[time.nome]} />
                      : index === 0 ? "🏆" : `#${index + 1}`}
                  </span>
                </div>

                <div class="time-info">
                  <span class="time-nome">
                    {!modoElenco && (
                      <Bola size={10} color={CORES_TIMES[time.nome]} class="bola-inline" />
                    )}
                    {modoElenco
                      ? (NOMES_ELENCO[time.nome] ?? time.nome)
                      : time.nome}
                  </span>
                  <span class="time-dono">{time.dono}</span>
                </div>

                {!modoElenco && (
                  <div class="pontuacao-wrapper">
                    <span class="pontuacao">{time.pontuacao.toFixed(2)}</span>
                    <span class="pontuacao-label">pts</span>
                  </div>
                )}

                <span class="expandir-icone" aria-hidden>
                  {expandidos.has(index) ? "▲" : "▼"}
                </span>
              </div>

              {expandidos.has(index) && (
                <div class="jogadores-lista">
                  <div class="jogadores-header">
                    <span>Jogador</span>
                    <span>Pos</span>
                    <span>Esc</span>
                    {!modoElenco && <span>Pts</span>}
                  </div>
                  {[...time.jogadores]
                    .sort((a, b) => {
                      const ordem: Record<string, number> = { "Sim": 0, "Banco": 1, "Não": 2 };
                      const diff = (ordem[a.escalacao] ?? 3) - (ordem[b.escalacao] ?? 3);
                      return diff !== 0 ? diff : b.pontuacao - a.pontuacao;
                    })
                    .map((jogador, jIdx) => {
                      const posKey = POSICAO_CSS[jogador.posicao] ?? jogador.posicao.toLowerCase();
                      const posAbrev = POSICAO_ABREV[jogador.posicao] ?? jogador.posicao.substring(0, 3).toUpperCase();
                      const escClass = classeEscalacao(jogador.escalacao);
                      return (
                        <div
                          key={jIdx}
                          class={`jogador-linha${escClass ? ` ${escClass}` : ""}${modoElenco ? " pre-rodada-linha" : ""}`}
                        >
                          <span class="jogador-nome">{jogador.nome}</span>
                          <span class={`posicao-badge posicao-${posKey}`}>{posAbrev}</span>
                          <span class={`esc-badge esc-${jogador.escalacao === "Não" ? "nao" : jogador.escalacao === "Banco" ? "banco" : "sim"}`}>
                            {jogador.escalacao === "Sim" ? "✓" : jogador.escalacao === "Banco" ? "B" : "—"}
                          </span>
                          {!modoElenco && (
                            <span class={`jogador-pontuacao ${jogador.pontuacao > 0 ? "positivo" : "zero"}`}>
                              {jogador.pontuacao.toFixed(2)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  <div class="legenda-esc">
                    <span><span class="esc-badge esc-sim">✓</span> Titular</span>
                    <span><span class="esc-badge esc-banco">B</span> Banco</span>
                    <span><span class="esc-badge esc-nao">—</span> Fora</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
