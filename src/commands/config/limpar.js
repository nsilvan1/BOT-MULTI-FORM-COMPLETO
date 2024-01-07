const Command = require("../../structures/Command");
const config = require('../../../config.json')
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = class LimparCommand extends Command {
  constructor(client) {
    super(client, {
      name: "limpar",
      description: "Limpa as últimas mensagens no canal",
      options: [
        {
          name: 'quantidade',
          description: 'Número de mensagens a serem apagadas',
          type: 'INTEGER',
          required: true,
        },
      ],
    });
  }

  run = async (interaction) => {
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour12: false
    });

    console.log(`\x1b[32m${interaction.user.tag} \x1b[0musou o comando\x1b[0m ${interaction}\x1b[0m em \x1b[35m${dataFormatada}\x1b[0m`);

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.reply({
        content: "Você não tem permissão para usar este comando!",
        ephemeral: true,
      });
    }

    let quantidade = interaction.options.getInteger('quantidade') + 1; // Adiciona 1 para incluir a mensagem do comando

    if (quantidade <= 0 || quantidade > 100) {
      return interaction.reply({
        content: "A quantidade deve ser um número entre 1 e 100.",
        ephemeral: true,
      });
    }

    // Responde imediatamente à interação
    const confirmationMessage = await interaction.reply({
      content: `Excluindo ${quantidade - 1} mensagens...`, // Exibe a quantidade correta
      ephemeral: false,
    });

    // Deleta as mensagens em segundo plano em lotes
    const channel = interaction.channel;
    let deletedMessages = 0;

    while (deletedMessages < quantidade) {
      const messagesToDelete = Math.min(quantidade - deletedMessages, 100);
      const fetched = await channel.messages.fetch({ limit: messagesToDelete });
      await channel.bulkDelete(fetched).catch((error) => {
        console.error("Erro ao excluir mensagens:", error);
      });
      deletedMessages += fetched.size;
    }
      // Criação do Embed para o Log
      const logEmbed = new MessageEmbed()
      .setTitle("Comando Fecharrec Executado")
      .setColor("#34ebd8")
      .setDescription(`O comando **fecharrec** foi utilizado por ${interaction.user.tag}`)
      .addFields(
        { name: "Executado por", value: `<@${interaction.user.id}>`, inline: true },
        { name: "Canal", value: `<#${interaction.channel.id}>`, inline: true },
        { name: "Hora", value: dataFormatada, inline: true }
      )
      .setTimestamp();
    
          // Enviando o Embed de Log para o canal específico
          const logChannelId = config.channelLogCommands; // Substitua com o ID do seu canal de logs
          const logChannel = interaction.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
          } else {
            console.warn("Canal de log não encontrado. Verifique a configuração.");
          }
          
    // Deleta a mensagem de confirmação após a exclusão das mensagens
    if (confirmationMessage && !confirmationMessage.deleted) {
      confirmationMessage.delete().catch((error) => {
        console.error("Erro ao excluir mensagem de confirmação:", error);
      });
    }
    
  };
};
