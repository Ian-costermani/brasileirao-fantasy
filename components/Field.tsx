export type Posicao = "gol" | "lat" | "zag" | "mei" | "ata";

export interface Pino {
  nome?: string;
  num?: string;
  capt?: boolean;
  pts?: number | null;
  escudo?: string | null;
  pos?: string;
  cores?: { primary: string; secondary: string };
}

export interface Escalacao {
  gk: Pino;
  def: Pino[];
  mid: Pino[];
  ata: Pino[];
}

interface Props {
  jogadores?: Partial<Escalacao>;
  showPoints?: boolean;
  empty?: boolean;
}

const COLOR_VAR: Record<"yellow" | "blue" | "magenta" | "orange", string> = {
  yellow: "var(--bf-yellow)",
  blue: "var(--bf-blue)",
  magenta: "var(--bf-magenta)",
  orange: "var(--bf-orange)",
};

function PlayerPin(
  { p, accent, showPoints, empty }: {
    p: Pino;
    accent: keyof typeof COLOR_VAR;
    showPoints: boolean;
    empty: boolean;
  },
) {
  const isEmpty = empty && !p.num && !p.cores;
  const cls = ["bf-pin"];
  if (isEmpty) cls.push("bf-pin--empty");
  const pts = showPoints && p.pts != null ? p.pts : null;
  const shirtStyle: Record<string, string> = {
    "--shirt-color": COLOR_VAR[accent],
  };
  if (p.cores) {
    shirtStyle["--team-primary"] = p.cores.primary;
    shirtStyle["--team-secondary"] = p.cores.secondary;
  }

  return (
    <div class={cls.join(" ")}>
      <div class="bf-pin__shirt" style={shirtStyle}>
        {p.cores
          ? (
            <svg
              viewBox="0 0 100 100"
              class="bf-pin__jersey"
              aria-hidden="true"
            >
              {/* Corpo + sleeves */}
              <path
                d="M30 10 L8 22 L13 40 L27 40 L27 92 Q27 98 33 98 L67 98 Q73 98 73 92 L73 40 L87 40 L92 22 L70 10 L60 17 L50 22 L40 17 Z"
                fill="var(--team-primary)"
                stroke="var(--shirt-color)"
                stroke-width="3.5"
                stroke-linejoin="round"
              />
              {/* Gola/secundária — triangle no decote */}
              <path
                d="M30 10 L70 10 L60 17 L50 22 L40 17 Z"
                fill="var(--team-secondary)"
                stroke="var(--shirt-color)"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          )
          : (
            <span class="bf-pin__placeholder">
              {isEmpty ? "+" : (p.num ?? "")}
            </span>
          )}
        {p.capt && <span class="bf-pin__capt-badge">C</span>}
      </div>
      {p.nome && (
        <div class="bf-pin__name">
          {p.escudo && (
            <img class="bf-pin__name-escudo" src={p.escudo} alt="" />
          )}
          <span>{p.nome}</span>
        </div>
      )}
      {p.pos && (
        <div
          class="bf-pin__pos"
          style={{ "--pos-color": COLOR_VAR[accent] } as Record<string, string>}
        >
          {p.pos}
        </div>
      )}
      {pts != null && (
        <div class={`bf-pin__pts ${pts < 0 ? "bf-pin__pts--neg" : ""}`}>
          {pts > 0 ? "+" : ""}
          {pts}
        </div>
      )}
    </div>
  );
}

export default function Field(
  { jogadores, showPoints = false, empty = false }: Props,
) {
  const gk = jogadores?.gk ?? {};
  const def = jogadores?.def ?? [];
  const mid = jogadores?.mid ?? [];
  const ata = jogadores?.ata ?? [];

  return (
    <div class="bf-field">
      <svg
        class="bf-field__lines"
        viewBox="0 0 100 140"
        preserveAspectRatio="none"
      >
        <rect x="2" y="2" width="96" height="136" rx="1" />
        <line x1="2" y1="70" x2="98" y2="70" />
        <circle cx="50" cy="70" r="10" />
        <rect x="22" y="2" width="56" height="14" />
        <rect x="34" y="2" width="32" height="6" />
        <rect x="22" y="124" width="56" height="14" />
        <rect x="34" y="132" width="32" height="6" />
        <path d="M 42 16 A 8 8 0 0 0 58 16" />
        <path d="M 42 124 A 8 8 0 0 1 58 124" />
      </svg>
      <div class="bf-field__row bf-field__row--gk">
        <PlayerPin
          p={gk}
          accent="yellow"
          showPoints={showPoints}
          empty={empty}
        />
      </div>
      <div class="bf-field__row bf-field__row--def">
        {def.map((p, i) => (
          <PlayerPin
            key={i}
            p={p}
            accent="blue"
            showPoints={showPoints}
            empty={empty}
          />
        ))}
      </div>
      <div class="bf-field__row bf-field__row--mid">
        {mid.map((p, i) => (
          <PlayerPin
            key={i}
            p={p}
            accent="magenta"
            showPoints={showPoints}
            empty={empty}
          />
        ))}
      </div>
      <div class="bf-field__row bf-field__row--ata">
        {ata.map((p, i) => (
          <PlayerPin
            key={i}
            p={p}
            accent="orange"
            showPoints={showPoints}
            empty={empty}
          />
        ))}
      </div>
    </div>
  );
}
