import { Handlers } from "$fresh/server.ts";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const handler: Handlers = {
  async POST(req) {
    try {
      const contentType = req.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        return new Response(
          JSON.stringify({ ok: false, erro: "Content-Type deve ser application/json" }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      let dados: unknown;
      try {
        dados = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ ok: false, erro: "JSON inválido" }),
          { status: 400, headers: JSON_HEADERS },
        );
      }

      const kv = await Deno.openKv();
      await kv.set(["rodada_atual"], dados);

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: JSON_HEADERS },
      );
    } catch (e) {
      return new Response(
        JSON.stringify({
          ok: false,
          erro: String(e),
          stack: e instanceof Error ? e.stack : undefined,
        }),
        { status: 500, headers: JSON_HEADERS },
      );
    }
  },
};
