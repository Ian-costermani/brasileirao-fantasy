import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ ok: false, erro: "Content-Type deve ser application/json" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    let dados: unknown;
    try {
      dados = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false, erro: "JSON inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      const kv = await Deno.openKv();
      await kv.set(["rodada_atual"], dados);
    } catch (e) {
      return new Response(
        JSON.stringify({ ok: false, erro: String(e) }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
};
