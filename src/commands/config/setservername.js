const Command = require("../../structures/Command");
const query = require('../../utils/database');

module.exports = class ConfigCommand extends Command {
  constructor(client) {
    super(client, {
      name: "config",
      description: "Configura as opções do servidor.",
      options: [
        {
          name: "manual_url",
          description: "Define a URL do manual de conduta.",
          type: "STRING",
          required: false
        },
        {
          name: "logs_geral",
          description: "Define o canal para logs.",
          type: "CHANNEL",
          required: false
        },
        // Adicione outras opções conforme necessário
      ],
    });
  }

  run = async (interaction) => {
    // Verifica se o usuário é administrador
    if (!interaction.member.permissions.has("ADMINISTRATOR")) {
      return interaction.reply({
        content: "Você não tem permissão para usar este comando.",
        ephemeral: true
      });
    }

    // Processamento das opções do comando
    const manualUrl = interaction.options.getString("manual_url");
    const logChannelId = interaction.options.getChannel("logs_geral")?.id;

    try {
      // Se uma URL do manual foi fornecida, atualize no banco de dados
      if (manualUrl) {
        await query(
          'UPDATE ServerSettings SET url_manual = ? WHERE server_id = ?',
          [manualUrl, interaction.guild.id]
        );
        interaction.reply({ content: "URL do manual de conduta atualizada com sucesso!", ephemeral: true });
      }

      // Se um logChannelId foi fornecido, atualize no banco de dados
      if (logChannelId) {
        await query(
          'UPDATE ServerSettings SET logChannelId = ? WHERE server_id = ?',
          [logChannelId, interaction.guild.id]
        );
        interaction.reply({ content: "Canal de logs atualizado com sucesso!", ephemeral: true });
      }

      // Se nenhuma opção for fornecida, informe ao usuário
      if (!manualUrl && !logChannelId) {
        interaction.reply({ content: "Nenhuma configuração foi atualizada. Por favor, forneça uma opção válida.", ephemeral: true });
      }

    } catch (error) {
      console.error('Erro ao atualizar as configurações do servidor:', error);
      interaction.reply({ content: "Ocorreu um erro ao atualizar as configurações do servidor.", ephemeral: true });
    }
  };
};
