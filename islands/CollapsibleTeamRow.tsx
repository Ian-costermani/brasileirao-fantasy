import { useState } from "preact/hooks";
import { ComponentChildren } from "preact";
import TeamCrest from "../components/TeamCrest.tsx";
import Sparkline from "../components/Sparkline.tsx";

interface Props {
  /** Identificador interno (chave do dono) — usado pro TeamCrest */
  chave: string;
  /** Posição no ranking (1, 2, 3...) */
  pos: number;
  /** Nome do time exibido */
  displayName: string;
  /** Nome do dono */
  dono: string;
  /** Total acumulado de pontos formatado (ex: "0,0") */
  totalFmt: string;
  /** Cor neon do time (hex) */
  accent: string;
  /** É o time do usuário? Aplica modifier --mine */
  isMine?: boolean;
  /** Histórico de pontos por rodada — vira sparkline no cabeçalho */
  historico?: Record<string, number>;
  /** Conteúdo que aparece colapsado/expandido (Field SSR) */
  children: ComponentChildren;
}

/**
 * Linha colapsável animada via grid-template-rows trick (compat universal).
 * Renderiza summary (cabeçalho) com props simples + children (escalação).
 */
export default function CollapsibleTeamRow(
  {
    chave,
    pos,
    displayName,
    dono,
    totalFmt,
    accent,
    isMine,
    historico,
    children,
  }: Props,
) {
  const [open, setOpen] = useState(false);
  const isLider = pos === 1;
  const cls = ["bf-team-row"];
  if (open) cls.push("bf-team-row--open");
  if (isLider) cls.push("bf-team-row--lider");
  if (isMine) cls.push("bf-team-row--mine");

  return (
    <div
      class={cls.join(" ")}
      style={{ "--accent": accent } as Record<string, string>}
    >
      <button
        type="button"
        class="bf-team-row__summary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span class="bf-team-row__pos">
          {isLider ? "🏆" : `#${pos}`}
        </span>
        <div class="bf-team-row__meta">
          <div class="bf-team-row__name">{displayName}</div>
          <div class="bf-team-row__owner">{dono}</div>
          {historico && Object.keys(historico).length >= 2 && (
            <Sparkline historico={historico} accent={accent} />
          )}
        </div>
        <TeamCrest chave={chave} size={36} />
        <div class="bf-team-row__pts">
          <span class="bf-team-row__pts-value">{totalFmt}</span>
          <span class="bf-team-row__pts-foot">PTS</span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="bf-team-row__chev"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div class="bf-team-row__expanded-wrap" aria-hidden={!open}>
        <div class="bf-team-row__expanded-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
