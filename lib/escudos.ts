// Mapping clube → arquivo de escudo em /static/escudos/.
// Cobre todos os arquivos atuais; clubes faltantes retornam null
// (PlayerPin cai num placeholder textual).
const CLUBE_FILE: Record<string, string> = {
  "Athletico-PR": "athletico-pr.jpg",
  "Atlético-MG": "atletico-mg.jpg",
  "Bahia": "bahia.jpg",
  "Botafogo": "botafogo.jpg",
  "Bragantino": "Bragantino.jpg",
  "RB Bragantino": "Bragantino.jpg",
  "Chapecoense": "chapecoense.jpg",
  "Corinthians": "corinthians.jpg",
  "Coritiba": "coritiba.jpg",
  "Cruzeiro": "cruzeiro.jpg",
  "Flamengo": "flamengo.jpg",
  "Fluminense": "fluminense.jpg",
  "Grêmio": "gremio.jpg",
  "Internacional": "internacional.jpg",
  "Mirassol": "mirassol.jpg",
  "Palmeiras": "palmeiras.jpg",
  "Remo": "remo.jpg",
  "Santos": "santos.jpg",
  "São Paulo": "sao-paulo.jpg",
  "Vasco": "vasco.jpg",
  "Vitória": "vitoria.jpg",
};

export function escudoUrl(clube: string | null | undefined): string | null {
  if (!clube) return null;
  const file = CLUBE_FILE[clube];
  return file ? `/escudos/${file}` : null;
}
