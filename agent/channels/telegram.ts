import { defaultTelegramAuth, telegramChannel } from "eve/channels/telegram";

// Only Telegram user ids listed in TELEGRAM_ALLOWED_USER_IDS (comma-separated)
// may talk to the bot; everyone else is silently dropped before a session or
// model call ever happens. Get your id from @userinfobot on Telegram.
const allowedUserIds = new Set(
  (process.env.TELEGRAM_ALLOWED_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);

export default telegramChannel({
  botUsername: process.env.TELEGRAM_BOT_USERNAME,
  async onMessage(ctx, message) {
    const from = message.from;
    if (!from || from.isBot || !allowedUserIds.has(from.id)) {
      return null;
    }
    if (!(message.text || message.caption).trim() && message.attachments.length === 0) {
      return null;
    }
    await ctx.telegram.startTyping();
    return { auth: defaultTelegramAuth(message) };
  },
});
