const Command = require("../../structures/Command");
const config = require('../../../config.json')

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = class CargosCommand extends Command {
  constructor(client) {
    super(client, {
      name: "hierarquia",
      description: "Mostra a hierarquia de cargos do servidor.",
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

      const cargosInclusos = ["👨‍💼 | Aluno(a)", 
                              "👨‍💼 | Agente de 3ª Classe",
                              "👨‍💼 | Agente de 2ª Classe",
                              "👨‍💼 | Agente de 1ª Classe",
                              "2º Sargento",
                              "2º Sargento", 
                              "3º Sargento", 
                              "Cabo",
                              "Soldado"
                            ];

      const cargos = guild.roles.cache
        .filter(role => cargosInclusos.includes(role.name))
        .sort((a, b) => b.position - a.position);

      let mensagem = "\`\`\`Hierarquia Policia Civil:\`\`\`";

      cargos.forEach(cargo => {
        const membrosDoCargo = cargo.members.filter(member => !member.user.bot);
        const mencoesMembros = membrosDoCargo.map(member => member.toString()).join(" \n ");
        
        // Adiciona ao texto da mensagem
        mensagem += `**\`\`\`🚨   ${cargo.name}   🚨\`\`\`**\n ${mencoesMembros}`;
      });

      await interaction.reply(mensagem);
    } catch (error) {
      console.error("Erro ao executar o comando cargos:", error);
      return interaction.reply({
        content: "Erro ao executar o comando. Verifique as permissões e tente novamente.",
        ephemeral: true,
      });
    }
    // Criação do Embed para o Log
    const logEmbed = new MessageEmbed()
      .setTitle(`**${interaction}** Executado`)
      .setColor("#34ebd8") // Cor do embed
      .setDescription(`O comando **${interaction}** foi utilizado por ${interaction.user.tag}`)
      .addFields(
        { name: "Executado por", value: `<@${interaction.user.id}>`, inline: true },
        { name: "Canal", value: `<#${interaction.channel.id}>`, inline: true },
        { name: "Data e Hora", value: dataFormatada, inline: true }
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
  }; 
};