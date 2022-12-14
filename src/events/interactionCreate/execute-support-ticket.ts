import handleErrorReply from "utils/handleErrorReply";
import { closeTicket, closeTicketCheck } from "utils/tickets/closeTicketHandler";
import { createTicket } from "utils/tickets/openTicketHandler";
import createInteractionCreateEventListener from "./createInteractionCreateEventListener";

export default createInteractionCreateEventListener(async (interaction) => {
    if (!interaction.isButton()) return;

    try {
        if (interaction.customId === "close_ticket_check") {
            await closeTicketCheck(interaction);
        } else if (interaction.customId.startsWith("create_ticket_")) {
            await createTicket(interaction);
        } else if (interaction.customId === "close_ticket") {
            await closeTicket(interaction);
        }
    } catch (e) {
        handleErrorReply(e, interaction);
    }
});
