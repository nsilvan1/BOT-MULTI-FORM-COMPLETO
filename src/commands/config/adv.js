const { MessageEmbed } = require('discord.js');
const config = require('../../../config.json')

const Command = require("../../structures/Command");

module.exports = class AdvCommand extends Command {
  constructor(client) {
    super(client, {
      name: "adv",
      description: "Aplica uma advertência a um membro",
      options: [
        {
          name: 'membro',
          description: 'Membro que receberá a advertência',
          type: 'USER',
          required: true,
        },
        {
          name: 'nivel',
          description: 'Nível da advertência (1, 2, 3 ou 4)',
          type: 'INTEGER',
          required: true,
          choices: [
            { name: 'Verbal', value: 1 },
            { name: '1° ADV', value: 2 },
            { name: '2° ADV', value: 3 },
            { name: '3° ADV', value: 4 },
          ],
        },
        {
          name: 'situacao',
          description: 'Situação da advertência',
          type: 'STRING',
          required: true,
          choices: [
            { name: 'Aplicado', value: 'Aplicado' },
            { name: 'Aplicado (Caso queira, recorrer em 3 dias)', value: 'Aplicado (Caso queira, recorrer em 3 dias)' },
            { name: 'Aplicado (Exonerado)', value: 'Aplicado (Exonerado)' },
          ],
        },
        {
          name: 'motivo',
          description: 'Motivo da advertência',
          type: 'STRING',
          required: true,
        },
        {
          name: 'punicao',
          description: 'Qual a punição a ser cumprida',
          type: 'STRING',
          required: false,
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
    try {
      // Verifica se o bot tem permissão para gerenciar mensagens, criar convites e gerenciar cargos
      if (!interaction.guild.members.me.permissions.has('MANAGE_MESSAGES') || !interaction.guild.members.me.permissions.has('CREATE_INSTANT_INVITE') || !interaction.guild.members.me.permissions.has('MANAGE_ROLES')) {
        return interaction.reply({
          content: 'O bot não tem permissão para gerenciar mensagens, criar convites ou gerenciar cargos!',
          ephemeral: true,
        });
      }

      const membro = interaction.options.getMember('membro');
      const nivel = interaction.options.getInteger('nivel');
      const motivo = interaction.options.getString('motivo');
      const punicao = interaction.options.getString('punicao');
      const situacao = interaction.options.getString('situacao');
      const aplicador = interaction.member; // Quem aplicou a advertência

      // Aplica a advertência (simulando com uma mensagem)
      // await membro.send(`Você recebeu uma advertência de nível ${nivel} em ${interaction.guild.name} por: ${motivo} (Aplicada por: ${aplicador.user.tag})`);
      
      // Define o canal de advertência (ADV)
      const canalAdvId = config.CHANEL_ADV; // ID do canal fornecido
      // const canalAdvId = '1177607358659166329'; // ID do canal fornecido

      const canalAdv = interaction.guild.channels.cache.get(canalAdvId);

      // Verifica se o canal de advertência existe
      if (!canalAdv) {
        return interaction.reply({
          content: 'Canal de advertência não encontrado. Configure o canal de advertência antes de usar este comando.',
          ephemeral: true,
        });
      }

      // Escolhe a cor com base no nível de advertência
      let cor;
      let cargoId;

      switch (nivel) {
        case 1:
          cor = '#FFFF00'; // Amarelo para Nível 1
          cargoId = "1180266866283921550"; // ID do cargo do Nível 1
          break;
        case 2:
          cor = '#FFA500'; // Laranja para Nível 2
          cargoId = "1151017036051382297"; // ID do cargo do Nível 2
          break;
        case 3:
          cor = '#FF0000'; // Vermelho para Nível 3
          cargoId = "1151017036051382296"; // ID do cargo do Nível 3
          break;
        default:
          cor = '#FFFFFF'; // Branco padrão
        case 4:
          cor = '#FFFF00'; // Amarelo para Nível 4
          cargoId = "1151017036051382295"; // ID do cargo do Nível 4
          break;  
      }

      // Cria um embed
      const embed = new MessageEmbed()
      .setTitle(`⛔ Nova Advertencia Nível ${nivel} Registrada ⛔`)
      .setColor(cor)
        .addFields(
          { name: 'Membro', value: membro.toString(), inline: true },
          { name: 'Aplicada por', value: aplicador.toString(), inline: true },
          { name: 'Situação', value: situacao, inline: true },
          { name: 'Motivo', value: motivo, inline: true },
          { name: 'Punição', value: punicao, inline: true }


        )
        .setTimestamp();

      // Envia o embed no canal de advertência
      await canalAdv.send({ embeds: [embed] });

      // Adiciona o cargo ao membro
      const cargo = interaction.guild.roles.cache.get(cargoId);
      if (cargo) {
        await membro.roles.add(cargo);
      }

        // Criação do Embed para o Log
        const logEmbed = new MessageEmbed()
        .setTitle(`Comando **${interaction.commandName}** Executado`)
        .setColor("#34ebd8")
        .setDescription(`O comando **${interaction.commandName}** foi utilizado por ${interaction.user.tag}`)
        .addFields(
          { name: "Executado por", value: `<@${interaction.user.id}>`, inline: true },
          { name: "Canal", value: `<#${interaction.channel.id}>`, inline: true },
          { name: "Data e Hora", value: new Date().toLocaleString(), inline: true }
        )
        .setTimestamp();

        // Enviando o Embed de Log para o canal específico
        const logChannelId = config.channelLogCommands;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
        logChannel.send({ embeds: [logEmbed] });
        } else {
        console.warn("Canal de log não encontrado. Verifique a configuração.");
        }
      // Responde ao autor do comando
      await interaction.reply({ content: `Advertência aplicada com sucesso`, ephemeral: false });
    } catch (error) {
      console.error("Erro ao aplicar advertência:", error);
      return interaction.reply({
        content: "Erro ao aplicar advertência. Verifique as permissões e tente novamente.",
        ephemeral: true,
      });
    }
  };
};