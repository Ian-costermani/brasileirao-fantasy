import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async GET() {
    const kv = await Deno.openKv();
    const resultado = await kv.get(["rodada_atual"]);

    // Retorna null se ainda não há dados — o frontend trata isso como "aguardando"
    return new Response(
      JSON.stringify(resultado.value ?? null),
      {
        headers: {
          "Content-Type": "application/json",
          // Sem cache: o frontend precisa sempre dos dados mais recentes
          "Cache-Control": "no-store",
          // Permite acesso de qualquer origem (útil para testes locais)
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  },
};
