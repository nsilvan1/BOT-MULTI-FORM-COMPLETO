const { MessageEmbed, Permissions } = require('discord.js');
const Command = require("../../structures/Command");

module.exports = class PromoverMembrosCommand extends Command {
  constructor(client) {
    super(client, {
      name: "promovermembros",
      description: "Promove vários membros, opcionalmente removendo um cargo e atribuindo um novo",
      options: [
        {
          name: 'membros',
          description: 'Lista de membros a serem promovidos (mencione-os)',
          type: 'STRING',
          required: true,
        },
        {
          name: 'cargo_adicionar',
          description: 'Cargo a ser atribuído durante a promoção',
          type: 'ROLE',
          required: true,
        },
        {
          name: 'cargo_remover',
          description: 'Cargo a ser removido durante a promoção (opcional)',
          type: 'ROLE',
          required: false,
        },
      ],
    });
  }

  run = async (interaction) => {
    try {
      console.log(`\x1b[36mPromoção de membros iniciado por ${interaction.user.tag}\x1b[0m`);

      if (!interaction.guild.members.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        console.log("\x1b[31mPermissão insuficiente para gerenciar cargos.\x1b[0m");
        return interaction.reply({
          content: 'O bot não tem permissão para gerenciar cargos!',
          ephemeral: true,
        });
      }

      const membrosMencionados = interaction.options.getString('membros').split(' ');
      const membros = membrosMencionados.map(m => interaction.guild.members.cache.get(m.replace(/[<@!&>]/g, '')));
      const cargoRemover = interaction.options.getRole('cargo_remover', false);
      const cargoAdicionar = interaction.options.getRole('cargo_adicionar');

      if (!cargoAdicionar.editable) {
        return interaction.reply({
          content: 'Não tenho permissão para atribuir o cargo especificado!',
          ephemeral: true,
        });
      }

      // Mapeamento de cargos para siglas
      const cargoParaSigla = {
        "Sub Comandante": "[SUB-CMD] ",
        "Coronel": "[CEL] ",
        "Tenente Coronel": "[TEN CEL] ",
        "Capitão": "[CAP] ",
        "Major": "[MJ] "
      };

      for (const membro of membros) {
        if (!membro) {
          console.log("\x1b[33mMembro inválido encontrado na lista.\x1b[0m");
          continue;
        }
        console.log(`\x1b[32mPromovendo membro: ${membro.user.tag}\x1b[0m`);
      
        if (cargoRemover && cargoRemover.editable) {
          console.log(`\x1b[34mRemovendo cargo: ${cargoRemover.name} de ${membro.user.tag}\x1b[0m`);
          await membro.roles.remove(cargoRemover);
        }
        console.log(`\x1b[35mAdicionando cargo: ${cargoAdicionar.name} a ${membro.user.tag}\x1b[0m`);
        await membro.roles.add(cargoAdicionar);
      
        let novaSigla = cargoParaSigla[cargoAdicionar.name] || "";
        let apelidoAtual = membro.nickname || membro.user.username;
      
        if (novaSigla !== "") {
          console.log(`\x1b[36mAtualizando sigla para: ${novaSigla}\x1b[0m`);
          let regexParaRemoverSiglas = /\[.*?\]\s*/g;
          let apelidoSemSigla = apelidoAtual.replace(regexParaRemoverSiglas, ''); 
          let novoApelido = `${novaSigla}${apelidoSemSigla}`;
      
          try {
            await membro.setNickname(novoApelido);
            console.log(`\x1b[32mApelido de ${membro.user.tag} atualizado para ${novoApelido}\x1b[0m`);
          } catch (err) {
            console.error(`\x1b[31mErro ao atualizar o apelido de ${membro.user.tag}:`, err, "\x1b[0m");
          }
        } else {
          console.log(`\x1b[33mNenhuma atualização de apelido necessária para ${membro.user.tag}\x1b[0m`);
        }
      }
      
      console.log("\x1b[32mMembros promovidos com sucesso.\x1b[0m");
      
      // Criação do embed para a resposta
      const embedResposta = new MessageEmbed()
        .setTitle('POLÍCIA CIVIL - EM DEFESA DE QUEM PRECISAR!')
        .setColor('#00FF00')
        .setDescription(`**CIDADE REPUBLICA RJ**
        \n**PROMOÇÃO DE OFICIAIS**\n\nO Alto comando vem através deste, expressar no uso de suas atribuições, visando suprir suas necessidades hierárquicas, informar a promoção do oficial listado abaixo:
        \nFUNCIONAL: ${membros.map(membro => membro.toString()).join('  ')}
        \nPara a função de: ${cargoAdicionar.toString()}
        \nAgradecemos os serviços prestado e a dedicação.\n\nCumpra-se.
        \nAtenciosamente, ${interaction.user.toString()}`)
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text:'PCERJ - Departamento de Recursos Humanos'})
        .setTimestamp();

      await interaction.reply({ embeds: [embedResposta], ephemeral: false });

      // Log de promoção
      const canalEmbedID = "1178075468759584850"; // ID do canal de logs
      const canalEmbed = interaction.guild.channels.cache.get(canalEmbedID);
      const embed = new MessageEmbed()
        .setTitle('Promoção de Membros')
        .setColor('#00FF00')
        .setDescription(`Membros promovidos por ${interaction.user.toString()}`);

        // Inicializa o array de campos
        let fields = [
          { name: 'Membros Promovidos:', value: membros.map(membro => membro.toString()).join(', ') },
          { name: 'Cargo Atribuído:', value: cargoAdicionar.toString() }
        ];

        // Adiciona o campo opcional se 'cargoRemover' estiver definido
        if (cargoRemover) {
          fields.push({ name: 'Cargo Removido:', value: cargoRemover.toString() });
        }

        // Adiciona os campos ao embed
        embed.addFields(fields).setTimestamp();


      canalEmbed.send({ embeds: [embed] });

    } catch (error) {
      console.error("Erro ao promover membros:", error);
      return interaction.reply({
        content: "Erro ao promover membros. Verifique as permissões e tente novamente.",
        ephemeral: true,
      });
    }
  };
};