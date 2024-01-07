const { MessageEmbed } = require("discord.js");
const Command = require("../../structures/Command");

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "Verifica a latência do bot e fornece informações do servidor.",
    });
  }

  run = async (interaction) => {
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour12: false
    });

    console.log(`\x1b[32m${interaction.user.tag} \x1b[0musou o comando\x1b[0m ${interaction}\x1b[0m em \x1b[35m${dataFormatada}\x1b[0m`);

    try {
      const latency = interaction.client.ws.ping; // Uso do ping do WebSocket

      const guild = interaction.guild;
      if (!guild) {
        return interaction.reply("Este comando só pode ser executado em um servidor.");
      }

      // As verificações de permissões devem ser feitas aqui (exemplo simplificado)
      if (!guild.members.me.permissions.has("VIEW_AUDIT_LOG")) {
        return interaction.reply("Não tenho as permissões necessárias para executar esse comando aqui.");
      }

      // As informações a seguir são dinâmicas e funcionarão em qualquer servidor
      const totalMembers = guild.memberCount;
      const onlineMembers = guild.members.cache.filter(member => member.presence?.status === "online").size;
      const offlineMembers = totalMembers - onlineMembers;

      const totalRoles = guild.roles.cache.size;
      const rolesWithMemberCount = guild.roles.cache
        .filter(role => role.members.size > 0)
        .map(role => `${role.name}: ${role.members.size}`)
        .join("\n");

      const embed = new MessageEmbed()
        .setTitle("Pong!")
        .addFields(
          { name: "Latência", value: `${latency}ms`, inline: true },
          { name: "Servidor", value: guild.name, inline: true },
          { name: "Membros Totais", value: totalMembers.toString(), inline: true },
          { name: "Membros Online", value: onlineMembers.toString(), inline: true },
          { name: "Membros Offline", value: offlineMembers.toString(), inline: true },
          { name: "Total de Cargos", value: totalRoles.toString(), inline: true },
          { name: "Membros em Cargos", value: rolesWithMemberCount || "Nenhum membro em cargos" }
        )
        .setColor("#00ff00"); // Cor verde

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao executar o comando ping:", error);
      interaction.reply("Houve um erro ao tentar executar esse comando.");
    }
  };
};
