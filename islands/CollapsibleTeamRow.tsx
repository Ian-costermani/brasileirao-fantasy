import { useState } from "preact/hooks";
import { ComponentChildren } from "preact";

interface Props {
  /** Cabeçalho clicável */
  summary: ComponentChildren;
  /** Conteúdo que expande/colapsa */
  expanded: ComponentChildren;
  /** Cor accent (CSS hex) usada no border-left, glow etc */
  accent: string;
  /** Modifier extra (ex: "bf-team-row--mine bf-team-row--lider") */
  modifier?: string;
}

/**
 * Linha colapsável animada via grid-template-rows trick (compat universal).
 * Substitui <details>/<summary> que dependiam de ::details-content novo demais.
 */
export default function CollapsibleTeamRow(
  { summary, expanded, accent, modifier = "" }: Props,
) {
  const [open, setOpen] = useState(false);
  return (
    <div
      class={`bf-team-row ${open ? "bf-team-row--open" : ""} ${modifier}`}
      style={{ "--accent": accent } as Record<string, string>}
    >
      <button
        type="button"
        class="bf-team-row__summary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {summary}
      </button>
      <div class="bf-team-row__expanded-wrap" aria-hidden={!open}>
        <div class="bf-team-row__expanded-inner">
          {expanded}
        </div>
      </div>
    </div>
  );
}
