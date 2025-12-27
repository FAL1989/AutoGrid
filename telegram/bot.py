"""
Telegram Bot

Provides notifications and commands for the trading bot.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


class TelegramBot:
    """
    Telegram Bot for AutoGrid.

    Features:
    - Real-time notifications (order fills, P&L updates)
    - Commands to check bot status
    - Alerts for errors and warnings

    Commands:
    - /start - Initialize bot
    - /status - Get current bot status
    - /balance - Get account balance
    - /stop - Stop trading (requires confirmation)
    """

    def __init__(self, token: str, chat_id: str) -> None:
        """
        Initialize Telegram Bot.

        Args:
            token: Telegram bot token from BotFather
            chat_id: Chat ID to send messages to
        """
        self.token = token
        self.chat_id = chat_id
        self._app: Any = None
        self._running = False

    async def start(self) -> None:
        """Start the Telegram bot."""
        try:
            from telegram import Update
            from telegram.ext import (
                Application,
                CommandHandler,
                ContextTypes,
            )

            self._app = Application.builder().token(self.token).build()

            # Register handlers
            self._app.add_handler(CommandHandler("start", self._cmd_start))
            self._app.add_handler(CommandHandler("status", self._cmd_status))
            self._app.add_handler(CommandHandler("balance", self._cmd_balance))
            self._app.add_handler(CommandHandler("stop", self._cmd_stop))

            await self._app.initialize()
            await self._app.start()
            self._running = True

            logger.info("Telegram bot started")

        except Exception as e:
            logger.error(f"Failed to start Telegram bot: {e}")
            raise

    async def stop(self) -> None:
        """Stop the Telegram bot."""
        if self._app:
            await self._app.stop()
            await self._app.shutdown()
        self._running = False
        logger.info("Telegram bot stopped")

    async def send_message(self, text: str) -> None:
        """Send a message to the configured chat."""
        if not self._app:
            logger.warning("Telegram bot not initialized")
            return

        try:
            await self._app.bot.send_message(
                chat_id=self.chat_id,
                text=text,
                parse_mode="HTML",
            )
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")

    async def notify_order_filled(
        self,
        symbol: str,
        side: str,
        quantity: float,
        price: float,
    ) -> None:
        """Send notification for filled order."""
        emoji = "🟢" if side == "buy" else "🔴"
        message = (
            f"{emoji} <b>Order Filled</b>\n\n"
            f"Symbol: {symbol}\n"
            f"Side: {side.upper()}\n"
            f"Quantity: {quantity}\n"
            f"Price: ${price:,.2f}"
        )
        await self.send_message(message)

    async def notify_error(self, error: str) -> None:
        """Send error notification."""
        message = f"⚠️ <b>Error</b>\n\n{error}"
        await self.send_message(message)

    async def notify_pnl_update(
        self,
        realized_pnl: float,
        unrealized_pnl: float,
    ) -> None:
        """Send P&L update notification."""
        total_pnl = realized_pnl + unrealized_pnl
        emoji = "📈" if total_pnl >= 0 else "📉"
        message = (
            f"{emoji} <b>P&L Update</b>\n\n"
            f"Realized: ${realized_pnl:,.2f}\n"
            f"Unrealized: ${unrealized_pnl:,.2f}\n"
            f"Total: ${total_pnl:,.2f}"
        )
        await self.send_message(message)

    # Command handlers

    async def _cmd_start(self, update: Any, context: Any) -> None:
        """Handle /start command."""
        await update.message.reply_text(
            "👋 Welcome to AutoGrid!\n\n"
            "Commands:\n"
            "/status - Bot status\n"
            "/balance - Account balance\n"
            "/stop - Stop trading"
        )

    async def _cmd_status(self, update: Any, context: Any) -> None:
        """Handle /status command."""
        # TODO: Get actual bot status
        await update.message.reply_text(
            "🤖 <b>Bot Status</b>\n\n"
            "Status: Running\n"
            "Strategy: Grid\n"
            "Active Orders: 0",
            parse_mode="HTML",
        )

    async def _cmd_balance(self, update: Any, context: Any) -> None:
        """Handle /balance command."""
        # TODO: Get actual balance
        await update.message.reply_text(
            "💰 <b>Balance</b>\n\n"
            "USDT: $1,000.00\n"
            "BTC: 0.00000000",
            parse_mode="HTML",
        )

    async def _cmd_stop(self, update: Any, context: Any) -> None:
        """Handle /stop command."""
        await update.message.reply_text(
            "⚠️ Are you sure you want to stop the bot?\n"
            "This will cancel all open orders.\n\n"
            "Reply /confirm_stop to proceed."
        )
