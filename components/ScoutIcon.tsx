/**
 * Ícones SVG inline pros 21 scouts do Cartola — substitui os emojis
 * (que renderizam inconsistente entre OS/browsers e perdem detalhe
 * em tamanho pequeno).
 *
 * Convenção:
 * - viewBox 24×24
 * - stroke-width 2, currentColor — herda cor do chip (.bf-event-chip)
 * - cards (CA/CV) usam fill colorido fixo (override pelo .bf-event-chip)
 */

import type { JSX } from "preact";

interface Props {
  codigo: string;
  size?: number;
}

/** Atributos comuns de stroke pra desenhos line-art. */
const STROKE = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const ICONS: Record<string, JSX.Element> = {
  // ===== POSITIVOS =====

  // G — Gol (bola)
  G: (
    <g {...STROKE}>
      <circle cx="12" cy="12" r="8" />
      <polygon points="12,7 16,10 14,15 10,15 8,10" />
    </g>
  ),

  // A — Assistência (seta curva pra alvo)
  A: (
    <g {...STROKE}>
      <path d="M4 16 Q10 4 18 8" />
      <path d="M14 6 L18 8 L17 13" />
    </g>
  ),

  // FT — Na trave (gol + bola batendo)
  FT: (
    <g {...STROKE}>
      <path d="M5 4 L5 18 L19 18 L19 4" />
      <line x1="3" y1="18" x2="21" y2="18" />
      <circle cx="12" cy="14" r="2" fill="currentColor" />
    </g>
  ),

  // FS — Falta sofrida (escudo simples)
  FS: (
    <g {...STROKE}>
      <path d="M12 3 L20 6 L20 13 Q20 19 12 21 Q4 19 4 13 L4 6 Z" />
    </g>
  ),

  // DS — Desarme (bloco/parede)
  DS: (
    <g {...STROKE}>
      <rect x="3" y="6" width="18" height="4" />
      <rect x="3" y="14" width="18" height="4" />
      <line x1="9" y1="6" x2="9" y2="10" />
      <line x1="15" y1="6" x2="15" y2="10" />
      <line x1="6" y1="14" x2="6" y2="18" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="18" y1="14" x2="18" y2="18" />
    </g>
  ),

  // PS — Pênalti sofrido (mão)
  PS: (
    <g {...STROKE}>
      <path d="M9 11 L9 5 Q9 4 10 4 Q11 4 11 5 L11 11" />
      <path d="M11 11 L11 4 Q11 3 12 3 Q13 3 13 4 L13 11" />
      <path d="M13 11 L13 5 Q13 4 14 4 Q15 4 15 5 L15 11" />
      <path d="M15 11 L15 7 Q15 6 16 6 Q17 6 17 7 L17 14" />
      <path d="M9 11 L9 16 Q9 21 14 21 Q17 21 17 18 L17 14" />
    </g>
  ),

  // DD — Defesa difícil (luva)
  DD: (
    <g {...STROKE}>
      <path d="M7 11 L7 5 Q7 3 9 3 Q11 3 11 5 L11 11" />
      <path d="M11 11 L11 4 Q11 2 13 2 Q15 2 15 4 L15 11" />
      <path d="M15 11 L15 6 Q15 4 17 4 Q19 4 19 6 L19 14" />
      <path d="M7 11 L7 17 Q7 22 13 22 Q19 22 19 17 L19 14" />
    </g>
  ),

  // DP — Defesa de pênalti (luva + estrela)
  DP: (
    <g {...STROKE}>
      <path d="M5 13 L5 7 Q5 5 7 5 Q9 5 9 7 L9 13" />
      <path d="M9 13 L9 6 Q9 4 11 4 Q13 4 13 6 L13 13" />
      <path d="M13 13 L13 8 Q13 6 15 6 Q17 6 17 8 L17 15" />
      <path d="M5 13 L5 18 Q5 22 11 22 Q17 22 17 18 L17 15" />
      <path d="M19 4 L20 6 L22 6 L20.5 7.5 L21 9.5 L19 8.5 L17 9.5 L17.5 7.5 L16 6 L18 6 Z" />
    </g>
  ),

  // SG — Sem gols sofrer (escudo + check)
  SG: (
    <g {...STROKE}>
      <path d="M12 3 L20 6 L20 13 Q20 19 12 21 Q4 19 4 13 L4 6 Z" />
      <path d="M8 12 L11 15 L16 9" />
    </g>
  ),

  // ===== NEGATIVOS =====

  // FC — Falta cometida (chuteira / X)
  FC: (
    <g {...STROKE}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </g>
  ),

  // PP — Pênalti perdido (bola + X)
  PP: (
    <g {...STROKE}>
      <circle cx="12" cy="12" r="7" />
      <line x1="7" y1="7" x2="17" y2="17" />
      <line x1="17" y1="7" x2="7" y2="17" />
    </g>
  ),

  // PC — Pênalti cometido (mão pra baixo / sinal)
  PC: (
    <g {...STROKE}>
      <path d="M12 4 L12 14" />
      <path d="M8 10 L12 14 L16 10" />
      <line x1="6" y1="20" x2="18" y2="20" />
    </g>
  ),

  // CA — Cartão amarelo (retângulo amarelo preenchido)
  CA: (
    <g>
      <rect
        x="8"
        y="3"
        width="9"
        height="14"
        rx="1"
        fill="currentColor"
        transform="rotate(-15 12.5 10)"
      />
    </g>
  ),

  // CV — Cartão vermelho (retângulo preenchido — cor vem do chip)
  CV: (
    <g>
      <rect
        x="8"
        y="3"
        width="9"
        height="14"
        rx="1"
        fill="currentColor"
        transform="rotate(-15 12.5 10)"
      />
    </g>
  ),

  // GC — Gol contra (bola entrando na rede do lado errado)
  GC: (
    <g {...STROKE}>
      <path d="M3 6 L3 18 L21 18 L21 6" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <circle cx="12" cy="13" r="2.5" fill="currentColor" />
      <path d="M18 13 L15 13 M16 11 L15 13 L16 15" />
    </g>
  ),

  // GS — Gol sofrido (bola entrando no gol)
  GS: (
    <g {...STROKE}>
      <path d="M3 6 L3 18 L21 18 L21 6" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <circle cx="12" cy="13" r="2.5" />
      <path d="M6 13 L9 13 M8 11 L9 13 L8 15" />
    </g>
  ),

  // I — Impedimento (bandeirinha do bandeirinha)
  I: (
    <g {...STROKE}>
      <line x1="6" y1="3" x2="6" y2="21" />
      <path d="M6 4 L18 7 L6 11 Z" fill="currentColor" />
    </g>
  ),

  // PI — Passe incompleto (seta tracejada)
  PI: (
    <g {...STROKE}>
      <path d="M4 12 L6 12 M9 12 L11 12 M14 12 L16 12" stroke-dasharray="2 2" />
      <path d="M16 8 L20 12 L16 16" />
    </g>
  ),

  // PE — Passe errado (seta + X)
  PE: (
    <g {...STROKE}>
      <path d="M4 12 L14 12" />
      <path d="M11 9 L14 12 L11 15" />
      <line x1="17" y1="7" x2="21" y2="11" />
      <line x1="21" y1="7" x2="17" y2="11" />
    </g>
  ),

  // ===== NEUTROS =====

  // FD — Finalização defendida (seta + escudo)
  FD: (
    <g {...STROKE}>
      <path d="M3 12 L9 12" />
      <path d="M7 9 L9 12 L7 15" />
      <path d="M16 5 L21 7 L21 12 Q21 16 16 18 Q11 16 11 12 L11 7 Z" />
    </g>
  ),

  // FF — Finalização fora (seta pra cima-direita saindo)
  FF: (
    <g {...STROKE}>
      <path d="M5 19 L19 5" />
      <path d="M19 5 L13 5 M19 5 L19 11" />
    </g>
  ),
};

/** Fallback genérico (círculo) pra códigos não mapeados. */
const FALLBACK = (
  <g {...STROKE}>
    <circle cx="12" cy="12" r="3" />
  </g>
);

export default function ScoutIcon({ codigo, size = 12 }: Props) {
  const inner = ICONS[codigo] ?? FALLBACK;
  return (
    <svg
      class={`bf-scout-icon bf-scout-icon--${codigo}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {inner}
    </svg>
  );
}
