# Waydock eve agent template

A chief-of-staff [eve](https://eve.dev) agent backed by [Waydock](https://waydock.ai): ask about
your day, inbox, meetings, follow-ups, and tasks, and let the agent act on them
with your approval.

The integration comes from Waydock's official eve registry item
(`eve add @waydock/waydock`, source at
[waydock/plugins](https://github.com/waydock/plugins/tree/main/eve)): an
[MCP connection](https://eve.dev/docs/connections) plus two packaged skills
(`waydock-mcp` usage guidance and a `waydock-morning-triage` procedure). The
model discovers Waydock tools at runtime via `connection_search` and calls
them as `waydock__<tool>`. The approval policy is manifest-driven and
fail-closed: any tool Waydock's live manifest does not flag `readOnly` —
including tools this file has never seen — pauses for human approval. To pick
up connection updates later, re-run `npx eve add @waydock/waydock`.

You bring your own model: the agent runs on your Vercel AI Gateway credentials
(or any provider key you configure), so inference is billed to you, not to
Waydock.

## Setup

1. Install dependencies and link a Vercel project for AI Gateway credentials:

   ```bash
   npm install
   npx eve link
   ```

2. Get an API key from [waydock.ai/settings/account/mcp](https://waydock.ai/settings/account/mcp)
   and put it in `.env.local` (and in Vercel env for production):

   ```bash
   WAYDOCK_MCP_KEY=...   # sent as Authorization: Bearer <token>
   ```

   See [waydock.ai/docs/authentication](https://waydock.ai/docs/authentication).

3. Run it:

   ```bash
   npm run dev
   ```

   Try: "what does my day look like?", "anything urgent in my inbox?",
   "nudge the pending follow-ups" (this one will ask for approval).

## Telegram (optional)

`agent/channels/telegram.ts` puts the agent behind a Telegram bot with a strict
user allowlist: only ids in `TELEGRAM_ALLOWED_USER_IDS` reach the agent;
everyone else is dropped before any model call. Configure:

```bash
TELEGRAM_BOT_TOKEN=...            # from @BotFather
TELEGRAM_WEBHOOK_SECRET_TOKEN=... # e.g. openssl rand -hex 32
TELEGRAM_ALLOWED_USER_IDS=...     # your numeric id, from @userinfobot
TELEGRAM_BOT_USERNAME=...         # optional, for @-mentions in groups
```

After deploying, register the webhook (eve mounts `POST /eve/v1/telegram`):

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://<your-domain>/eve/v1/telegram",
       "secret_token":"'"$TELEGRAM_WEBHOOK_SECRET_TOKEN"'",
       "allowed_updates":["message","callback_query"]}'
```

## Structure

| Path | Purpose |
| --- | --- |
| `agent/agent.ts` | Model config (`anthropic/claude-sonnet-5` via AI Gateway) |
| `agent/instructions.md` | Identity and behavior |
| `agent/connections/waydock.ts` | Waydock MCP connection (from `@waydock/waydock`): auth + manifest-driven approval policy |
| `agent/skills/waydock-mcp/` | Packaged skill: how to use Waydock tools well |
| `agent/skills/waydock-morning-triage/` | Packaged skill: ranked morning triage procedure |
| `agent/channels/eve.ts` | Default HTTP channel and route auth |
| `agent/channels/telegram.ts` | Optional Telegram channel with user allowlist |

## Deploy

```bash
npx eve deploy
```

Set the `WAYDOCK_*` (and any `TELEGRAM_*`) env vars on the Vercel project
first. Before real use, replace `placeholderAuth()` in `agent/channels/eve.ts`
with your auth provider — see
[Authentication](https://eve.dev/docs/guides/auth-and-route-protection).
