const { MessageEmbed } = require("discord.js");
const Command = require("../../structures/Command");

module.exports = class MembrosEmCargosCommand extends Command {
  constructor(client) {
    super(client, {
      name: "membroscargos",
      description: "Mostra os membros em cada cargo do servidor.",
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
      const guild = interaction.guild;
      if (!guild) {
        return interaction.reply("Este comando só pode ser executado em um servidor.");
      }

      const rolesWithMembers = guild.roles.cache
        .filter((role) => role.members.size > 0 && !role.everyone && role.name !== "@everyone")
        .map((role) => ({
          roleName: role.name,
          memberCount: role.members.size,
          members: role.members
            .filter((member) => !member.user.bot) // Opcional: remova bots da lista
            .map((member) => member.toString()) // Menciona o membro
            .join(", "),
        }));

      // Cria um embed com as informações
      const embed = new MessageEmbed()
        .setTitle("Membros em Cada Cargo")
        .setColor("#00ff00"); // Cor verde, você pode ajustar conforme necessário

      let fields = []; // Inicializa um array para armazenar os campos

      rolesWithMembers.forEach((roleInfo, index, array) => {
        // Adiciona o campo do cargo
        fields.push({ name: `Cargo: ${roleInfo.roleName}`, value: `Total: ${roleInfo.memberCount}\n${roleInfo.members}` });

        // Adiciona uma linha em branco entre os blocos, exceto no último
        if (index < array.length - 1) {
          fields.push({ name: "\u200b", value: "\u200b" }); // Espaço em branco zerado
        }
      });

      embed.addFields(fields); // Adiciona todos os campos ao embed

      // Responde à interação com o embed
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Erro ao executar o comando membroscargos:", error);
    }
  };
};
