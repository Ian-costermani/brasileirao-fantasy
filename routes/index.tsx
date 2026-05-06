import { Head } from "$fresh/runtime.ts";
import Ranking from "../islands/Ranking.tsx";
import { Bola } from "../components/Bola.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fantasy Cartola - Ranking</title>
      </Head>
      <div class="app">
        <header class="header">
          <div class="header-content">
            <h1>
              <Bola size={22} class="header-bola" />
              Fantasy Cartola
            </h1>
            <p>Ranking em tempo real</p>
          </div>
        </header>
        <main class="main">
          <Ranking />
        </main>
      </div>
    </>
  );
}
