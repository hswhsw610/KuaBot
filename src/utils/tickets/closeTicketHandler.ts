import type { ButtonInteraction, ChatInputCommandInteraction, GuildChannel } from "discord.js";
import { ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { TicketStatus } from "schema/ticketSchema";
import { ActionRow } from "structure/ActionRow";
import dbManager from "structure/DBManager";
import logger from "structure/Logger";
import replyEphemeralEmbed from "utils/replyEphemeralEmbed";
import { uploadTranscript } from "./ticketTranscriptHandler";

export const notTicketReply = replyEphemeralEmbed(
    new EmbedBuilder()
        .setColor("Red")
        .setTitle("엇, 이 명령어는 문의 채널에서만 입력하실 수 있어요!")
        .setDescription("닫으려는 문의 채널에서 계속해 주세요!"),
);

export const closeTicketCheck = async (interaction: ButtonInteraction | ChatInputCommandInteraction) => {
    const supportTicket = await dbManager.SupportTicket.findById(interaction.channelId);
    if (supportTicket == null) {
        interaction.reply(notTicketReply);
        return;
    }
    interaction.reply({
        ephemeral: true,
        embeds: [
            new EmbedBuilder()
                .setColor("Gold")
                .setTitle("정말로 닫으실 건가요?")
                .setDescription("실수가 아닌지 확인하는 거랍니다! :D\n또한, 문의를 닫으시면 제가 개인 메세지로 채팅 기록을 보내드려요."),
        ],
        components: [
            new ActionRow(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("close_ticket")
                    .setLabel("정말로 문의를 닫아주세요!"),
            ),
        ],
    });
};

export const closeTicket = async (interaction: ButtonInteraction) => {
    const supportTicket = await dbManager.SupportTicket.findById(interaction.channelId);
    if (supportTicket == null) {
        interaction.reply(notTicketReply);
        return;
    }
    interaction.channel?.delete();
};

export const onTicketDelete = async (channel: GuildChannel) => {
    const supportTicket = await dbManager.SupportTicket.findById(channel.id);
    if (supportTicket == null) return;
    if (supportTicket.status === TicketStatus.CREATED) {
        await logger.ticket(supportTicket, channel.client);
    } else {
        const url = await uploadTranscript(supportTicket.transcript);
        await logger.ticket(supportTicket, channel.client, url);
    }
    await supportTicket.remove();
};
