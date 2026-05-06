import { Bola } from "../components/Bola.tsx";

export default function Pagina404() {
  return (
    <div class="error-404">
      <Bola size={48} class="sem-dados-icone-svg" />
      <h1>404 — Página não encontrada</h1>
      <p>Essa página não existe.</p>
      <a href="/">← Voltar ao ranking</a>
    </div>
  );
}
