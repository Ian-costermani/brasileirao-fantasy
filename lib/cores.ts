// Cores oficiais (aproximadas) por clube. Usadas pra renderizar a camisa
// estilizada do jogador. Fallback é o chassis cinza-escuro.

export interface CoresClube {
  primary: string;
  secondary: string;
}

const CORES: Record<string, CoresClube> = {
  "Athletico-PR": { primary: "#E31837", secondary: "#000000" },
  "Atlético-MG": { primary: "#000000", secondary: "#FFFFFF" },
  "Bahia": { primary: "#005CB7", secondary: "#E31837" },
  "Botafogo": { primary: "#000000", secondary: "#FFFFFF" },
  "Bragantino": { primary: "#E31837", secondary: "#FFFFFF" },
  "RB Bragantino": { primary: "#E31837", secondary: "#FFFFFF" },
  "Chapecoense": { primary: "#0F8D2A", secondary: "#FFFFFF" },
  "Corinthians": { primary: "#000000", secondary: "#FFFFFF" },
  "Coritiba": { primary: "#0F8D2A", secondary: "#FFFFFF" },
  "Cruzeiro": { primary: "#003DA5", secondary: "#FFFFFF" },
  "Flamengo": { primary: "#E5161B", secondary: "#000000" },
  "Fluminense": { primary: "#7A0F1F", secondary: "#0F4730" },
  "Grêmio": { primary: "#0E72B5", secondary: "#000000" },
  "Internacional": { primary: "#E5161B", secondary: "#FFFFFF" },
  "Mirassol": { primary: "#FFD400", secondary: "#0F8D2A" },
  "Palmeiras": { primary: "#005A2C", secondary: "#FFFFFF" },
  "Remo": { primary: "#005CB7", secondary: "#FFFFFF" },
  "Santos": { primary: "#FFFFFF", secondary: "#000000" },
  "São Paulo": { primary: "#FFFFFF", secondary: "#E5161B" },
  "Vasco": { primary: "#000000", secondary: "#FFFFFF" },
  "Vitória": { primary: "#E5161B", secondary: "#000000" },
};

const FALLBACK: CoresClube = { primary: "#1B1D26", secondary: "#7A7B82" };

export function coresClube(clube: string | null | undefined): CoresClube {
  if (!clube) return FALLBACK;
  return CORES[clube] ?? FALLBACK;
}
