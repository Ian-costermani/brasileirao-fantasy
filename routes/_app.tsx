import { AppProps } from "$fresh/server.ts";

export default function App({ Component }: AppProps) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0a3d20" />
        <title>Fantasy Cartola - Ranking</title>
        <link rel="stylesheet" href="/styles.css?v=54" />
      </head>
      <body>
        {
          /* Filtro global usado pra remover fundo branco das fotos de jogador.
            new_alpha = 3 - (R+G+B)  → branco vira transparente, tons médios
            preservam opacidade. */
        }
        <svg
          width="0"
          height="0"
          style="position:absolute"
          aria-hidden="true"
        >
          <defs>
            <filter id="bf-remove-white" color-interpolation-filters="sRGB">
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        -1 -1 -1 0 3"
              />
            </filter>
          </defs>
        </svg>
        <Component />
      </body>
    </html>
  );
}
