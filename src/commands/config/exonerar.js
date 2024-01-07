const { MessageEmbed, Permissions } = require('discord.js');
const Command = require("../../structures/Command");

module.exports = class ExonerarMembrosCommand extends Command {
  constructor(client) {
    super(client, {
      name: "exonerar",
      description: "Exonera vários membros, remove todos os cargos e atribui um cargo específico",
      options: [
        {
          name: 'membros',
          description: 'Lista de membros a serem exonerados (mencione-os)',
          type: 'STRING',
          required: true,
        },
        {
          name: 'motivo',
          description: 'Motivo da exoneração',
          type: 'STRING',
          required: true,
        },
      ],
    });
  }

  run = async (interaction) => {
    try {
      if (!interaction.guild.members.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        return interaction.reply({
          content: 'O bot não tem permissão para gerenciar cargos!',
          ephemeral: true,
        });
      }

      const membrosMencionados = interaction.options.getString('membros').split(' ');
      const membros = membrosMencionados.map(m => interaction.guild.members.cache.get(m.replace(/[<@!&>]/g, '')));
      const motivo = interaction.options.getString('motivo');
      const cargoID = '976136588574740520'; // Cargo a ser atribuído
      const cargoID2 = '842067039119867944'; // Cargo do comando a ser mencionado
      const cargoID3 = '842067041942241310'; // Outro cargo do comando a ser mencionado
      const cargoID4 = '842067051849842750'; // Outro cargo geral
      const canalEmbed1ID = config.channelLogCommands; // Canal de logs
      const canalEmbed2ID = '1178075468759584850'; // Canal para publicar exoneração
      const dataHoraAtual = new Date().toLocaleString();
      let alreadyReplied = false;
      let listaMembrosExonerados = ""; // String para armazenar a lista formatada de membros exonerados
      const outrosCargosMencionados = [
        `<@&${cargoID2}>`, 
        `<@&${cargoID3}>`, 
        `||<@&${cargoID4}>||`]; 

      for (const membro of membros) {
        if (!membro) continue;

        await membro.roles.set([]);
        await membro.roles.add(cargoID);
        
        // Remove apenas a sigla do apelido do membro
        let apelidoAtual = membro.nickname || membro.user.username;
        let apelidoSemSigla = apelidoAtual.replace(/\[.*?\]\s*/g, '');
        
        if (apelidoAtual !== apelidoSemSigla) {
          console.log(`\x1b[34mRemovendo sigla do apelido de: ${membro.user.tag}. Antigo: ${apelidoAtual}, Novo: ${apelidoSemSigla}\x1b[0m`);
          await membro.setNickname(apelidoSemSigla);
        } else {
          console.log(`\x1b[34mNenhuma sigla encontrada no apelido de: ${membro.user.tag}\x1b[0m`);
        }
        // loop onde armazena a listagem de membros
        listaMembrosExonerados += `\n- ${membro.toString()}`; // Adiciona o membro exonerado à lista

        console.log(`\x1b[32m${interaction.user.tag}\x1b[0m exonerou \x1b[36m${membro.user.tag}\x1b[0m em \x1b[35m${dataHoraAtual}\x1b[0m`);

        if (!alreadyReplied) {
          await interaction.reply({ content: 'Iniciando processo de exoneração...', ephemeral: false });
          alreadyReplied = true;
        }
      }   // fim do loop

        if (listaMembrosExonerados) {
        const canalEmbed1 = interaction.guild.channels.cache.get(canalEmbed1ID);
        const embed1 = new MessageEmbed()
        .setTitle('Exoneração de Membros')
        .setColor('#FF0000')
        .setDescription('Os seguintes membros foram exonerados:')
        .addFields(
          { name: 'Membros Exonerados:', value: listaMembrosExonerados },
          { name: 'Exonerado por:', value: interaction.user.toString() },
          { name: 'Motivo:', value: motivo }
        )
        .setTimestamp();

        await canalEmbed1.send({ embeds: [embed1] });
        }

      if (listaMembrosExonerados) {
        const canalEmbed2 = interaction.guild.channels.cache.get(canalEmbed2ID);
        const embed2 = new MessageEmbed()
        .setTitle('POLÍCIA CIVIL DO ESTADO DO RIO DE JANEIRO')
        .setDescription('\n**O Alto Comando vêm por meio deste anúncio, comunicar a exoneração dos seguintes oficiais:**', '\u200B')
        .addFields(
          { name: '\u200B\nQRA:', value: listaMembrosExonerados },
          { name: 'Motivo:', value: motivo },
          { name: '\u200B\nAgradecemos pelos serviços prestados e desejamos boa sorte em seu respectivo futuro!', value: '\u200B' },
          { name: 'Cumpra-se.', value: '\u200B' },
          { name: 'Att:', value: outrosCargosMencionados.slice(0, 2).join(' ') },
          { name: '\u200B', value: outrosCargosMencionados[2] }
        )
        .setFooter({ text: 'PCERJ - Departamento de Recursos Humanos' })
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setTimestamp();

        await canalEmbed2.send({ embeds: [embed2] });
      }

      // mensagem no privado de cada membro após ser exonerado
      for (const membro of membros) {
        if (!membro) continue;

        const embedDM = new MessageEmbed()
        .setTitle('Notificação de Exoneração')
        .setColor('#FF0000')
        .setDescription(`Você foi exonerado da **PCERJ** na **Republica RP**.`)
        .addFields(
          { name: 'Motivo:', value: motivo },
          { name: 'Canal', value: 'Você pode se juntar ao canal aqui: <#1172013859016552480>' } // ID do Canal a ser mencionado, caso nao queira comentar esta linha
        )
        .setTimestamp()
        .setFooter({ text: 'PCERJ - Departamento de Recursos Humanos' });

          // .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          // .setThumbnail(interaction.guild.iconURL({ dynamic: true }));
          

        try {
          await membro.send({ embeds: [embedDM] });
        } catch (error) {
          console.log(`Não foi possível enviar DM para ${membro.user.tag}: ${error}`);
        }
      }

      if (alreadyReplied) {
        await interaction.editReply({ content: 'Processo de exoneração concluído.', ephemeral: false });
      } else {
        await interaction.reply({ content: 'Nenhum membro válido para exoneração.', ephemeral: false });
      }
    } catch (error) {
      console.error("\x1b[31mErro ao exonerar membros:", error);
      if (!alreadyReplied) {
        await interaction.reply({ content: "Ocorreu um erro. Verifique os logs para mais detalhes.", ephemeral: true });
      } else {
        await interaction.followUp({ content: "Ocorreu um erro após iniciar a exoneração. Verifique os logs para mais detalhes.", ephemeral: true });
      }
    }
  };
};