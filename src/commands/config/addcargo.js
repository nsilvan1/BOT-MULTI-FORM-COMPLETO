const { MessageEmbed, MessageMentions } = require('discord.js');

const Command = require("../../structures/Command");

module.exports = class SetarCargoCommand extends Command {
  constructor(client) {
    super(client, {
      name: "addcargo",
      description: "Atribui um cargo a um membro",
      options: [
        {
          name: 'membro',
          description: 'Membro a quem o cargo será atribuído',
          type: 'USER',
          required: true,
        },
        {
          name: 'cargo',
          description: 'Cargo a ser atribuído',
          type: 'ROLE',
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

    console.log(`\x1b[32m${interaction.user.tag} \x1b[0musou o comando\x1b[0m $@{interaction}\x1b[0mem \x1b[35m${dataFormatada}\x1b[0m`);

    try {
      // Verifica se o bot tem permissão para gerenciar cargos
      if (!interaction.guild.members.me.permissions.has('MANAGE_ROLES')) {
        return interaction.reply({
          content: 'O bot não tem permissão para gerenciar cargos!',
          ephemeral: true,
        });
      }

      const membro = interaction.options.getMember('membro');
      const cargo = interaction.options.getRole('cargo');

      // Verifica se o cargo é atribuível
      if (!cargo.editable) {
        return interaction.reply({
          content: 'O cargo não é atribuível!',
          ephemeral: true,
        });
      }

      // Atribui o cargo
      await membro.roles.add(cargo);

      // Obtém o canal específico onde você deseja enviar o embed
      const canalEmbed = interaction.guild.channels.cache.get('1178075468759584850'); // Substitua 'ID_DO_CANAL' pelo ID real do canal desejado

      // Cria um embed
      const embed = new MessageEmbed()
        .setTitle('Atribuição de Cargo')
        .setColor('#109010') // Cor verde, você pode alterar para outra cor se desejar
        .setDescription(`${interaction.user.toString()} atribui o cargo ${cargo.toString()} em ${membro.toString()}`)
        .setTimestamp();

      // Envia o embed para o canal específico
      await canalEmbed.send({ embeds: [embed] });

      // Responde no canal onde o comando foi chamado
      await interaction.reply({ content: 'Cargo atribuído com sucesso!', ephemeral: false });
    } catch (error) {
      console.error("Erro ao atribuir cargo:", error);
      return interaction.reply({
        content: "Erro ao atribuir cargo. Verifique as permissões e tente novamente.",
        ephemeral: true,
      });
    }
  };
};