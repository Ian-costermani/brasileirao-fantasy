import type { BancoPino } from "./Field.tsx";
import { statusInfo } from "./Field.tsx";

interface Props {
  jogadores: BancoPino[];
  /** Mostra pontos abaixo do nome (/ao-vivo). Default false (escalação
      estática em /liga). */
  showPoints?: boolean;
  /** Esconde badges de status (provável/dúvida/etc). Default igual ao
      Field — /liga usa false pra limpar visual, /ao-vivo usa false
      implícito porque liveMode esconde status mesmo. */
  showStatus?: boolean;
}

const POS_TO_CLASS: Record<string, string> = {
  Goleiro: "gol",
  Lateral: "lat",
  Zagueiro: "zag",
  Meia: "mei",
  Atacante: "ata",
  Técnico: "ata",
};

/**
 * Row horizontal scrollável com os reservas do elenco — visual igual
 * ao pool do MeuTimeEditor mas read-only (sem buttons/seleção). Usado
 * em /liga (escalação estática) e /ao-vivo (com pontos live).
 */
export default function ReservasRow(
  { jogadores, showPoints = false, showStatus = false }: Props,
) {
  if (!jogadores.length) return null;

  return (
    <div class="bf-pool">
      <div class="bf-pool__label">
        Reservas <span class="bf-pool__grupo-qtd">{jogadores.length}</span>
      </div>
      <div class="bf-pool__row">
        {jogadores.map((p, i) => {
          const posCls = POS_TO_CLASS[p.posicao ?? ""] ?? "mei";
          const hasCutout = !!p.foto &&
            (p.foto.includes("thesportsdb") || p.foto.includes("/atletas/"));
          const status = !showStatus ? null : statusInfo(p.statusId);
          const pts = showPoints && p.pts != null ? p.pts : null;
          return (
            <div
              class={`bf-pool__item bf-pool__item--${posCls}`}
              key={p.atletaId ?? i}
            >
              {p.escudo && (
                <img
                  class="bf-pool__badge bf-pool__badge--escudo"
                  src={p.escudo}
                  alt=""
                />
              )}
              {status && (
                <span
                  class="bf-pool__badge bf-pool__badge--status"
                  style={{ "--st-color": status.cor } as Record<string, string>}
                  title={status.title}
                  aria-label={status.title}
                >
                  {status.sym}
                </span>
              )}
              {hasCutout
                ? (
                  <img
                    class="bf-pool__face"
                    src={p.foto!}
                    alt=""
                    loading="lazy"
                  />
                )
                : (
                  <div class="bf-pool__face bf-pool__face--placeholder">
                    <span class="bf-pool__face-initial">
                      {(p.nome ?? "?").charAt(0)}
                    </span>
                  </div>
                )}
              <span class="bf-pool__pos">{p.pos ?? ""}</span>
              <span class="bf-pool__name">{p.nome ?? ""}</span>
              {pts != null && (
                <span
                  class={`bf-pool__pts ${pts < 0 ? "bf-pool__pts--neg" : ""}`}
                >
                  {pts > 0 ? "+" : ""}
                  {pts.toFixed(1).replace(".", ",")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
