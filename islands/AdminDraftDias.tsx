import { useState } from "preact/hooks";

interface Props {
  iniciais: number[];
}

const DIAS = [
  { id: 0, nome: "dom" },
  { id: 1, nome: "seg" },
  { id: 2, nome: "ter" },
  { id: 3, nome: "qua" },
  { id: 4, nome: "qui" },
  { id: 5, nome: "sex" },
  { id: 6, nome: "sáb" },
];

export default function AdminDraftDias({ iniciais }: Props) {
  const [sel, setSel] = useState<Set<number>>(new Set(iniciais));
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function toggle(d: number) {
    const novo = new Set(sel);
    if (novo.has(d)) novo.delete(d);
    else novo.add(d);
    setSel(novo);
  }

  async function salvar() {
    setSalvando(true);
    setFeedback(null);
    try {
      const r = await fetch("/api/admin/draft-dias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dias: [...sel].sort((a, b) => a - b) }),
      });
      const d = await r.json();
      if (d.ok) {
        setFeedback("Salvo ✓");
        setTimeout(() => setFeedback(null), 1500);
      } else {
        setFeedback(d.erro ?? "Erro");
      }
    } catch (e) {
      setFeedback(String(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div class="bf-draft-dias">
      <div class="bf-draft-dias__chips">
        {DIAS.map((d) => (
          <button
            key={d.id}
            type="button"
            class={`bf-draft-dias__chip ${
              sel.has(d.id) ? "bf-draft-dias__chip--on" : ""
            }`}
            onClick={() => toggle(d.id)}
          >
            {d.nome}
          </button>
        ))}
      </div>
      <div class="bf-draft-dias__acoes">
        <button
          type="button"
          class="bf-draft-dias__btn"
          onClick={salvar}
          disabled={salvando}
        >
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        {feedback && <span class="bf-draft-dias__feedback">{feedback}</span>}
      </div>
    </div>
  );
}
