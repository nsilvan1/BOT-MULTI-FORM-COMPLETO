const config = require('../../../config.json')
//// COLOCAR PARA PUXAR AS SIGLAS E CARGOS DO CONFIG JSON
const { MessageEmbed, Permissions } = require('discord.js');
const Command = require("../../structures/Command");

module.exports = class RebaixarMembrosCommand extends Command {
  constructor(client) {
    super(client, {
      name: "rebaixarmembros",
      description: "Rebaixa um membro, removendo um cargo e atribuindo um novo",
      options: [
        {
          name: 'membro',
          description: 'Membro a ser rebaixado',
          type: 'USER',
          required: true,
        },
        {
          name: 'cargo_remover',
          description: 'Cargo atual a ser removido',
          type: 'ROLE',
          required: true,
        },
        {
          name: 'cargo_adicionar',
          description: 'Novo cargo a ser atribuído (opcional)',
          type: 'ROLE',
          required: true,
        },
      ],
    });
  }

  run = async (interaction) => {
    try {
      console.log(`\x1b[36mRebaixamento de membro iniciado por ${interaction.user.tag}\x1b[0m`);

      if (!interaction.guild.members.me.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        console.log("\x1b[31mPermissão insuficiente para gerenciar cargos.\x1b[0m");
        return interaction.reply({
          content: 'O bot não tem permissão para gerenciar cargos!',
          ephemeral: true,
        });
      }

      const membro = interaction.options.getMember('membro');
      const cargoRemover = interaction.options.getRole('cargo_remover');
      const cargoAdicionar = interaction.options.getRole('cargo_adicionar', false);

      if (cargoRemover && !cargoRemover.editable) {
        return interaction.reply({
          content: 'Não tenho permissão para remover o cargo especificado!',
          ephemeral: true,
        });
      }

      if (cargoAdicionar && !cargoAdicionar.editable) {
        return interaction.reply({
          content: 'Não tenho permissão para adicionar o novo cargo!',
          ephemeral: true,
        });
      }

      console.log(`\x1b[34mRemovendo cargo: ${cargoRemover.name} de ${membro.user.tag}\x1b[0m`);
      await membro.roles.remove(cargoRemover);

      if (cargoAdicionar) {
        console.log(`\x1b[35mAdicionando novo cargo: ${cargoAdicionar.name} a ${membro.user.tag}\x1b[0m`);
        await membro.roles.add(cargoAdicionar);
      }

      // Mapeamento de cargos para siglas
      const cargoParaSigla = {
        "Sub Comandante": "[SUB-CMD] ",
        "Coronel": "[CEL] ",
        "Tenente Coronel": "[TEN CEL] ",
        "Capitão": "[CAP] ",
        "Cabo": "[CB] "
        // Adicione mais mapeamentos conforme necessário
      };

      let novaSigla = cargoParaSigla[cargoAdicionar ? cargoAdicionar.name : ""] || "";
      let apelidoAtual = membro.nickname || membro.user.username;
      let apelidoAlterado = false;
      let novoApelido = apelidoAtual;

      if (novaSigla !== "") {
        let regexParaRemoverSiglas = /\[.*?\]\s*/g;
        let apelidoSemSigla = apelidoAtual.replace(regexParaRemoverSiglas, ''); 
        novoApelido = `${novaSigla}${apelidoSemSigla}`;
        apelidoAlterado = true;

        try {
          await membro.setNickname(novoApelido);
          console.log(`\x1b[32mApelido de ${membro.user.tag} atualizado para ${novoApelido}\x1b[0m`);
        } catch (err) {
          console.error(`\x1b[31mErro ao atualizar o apelido de ${membro.user.tag}:`, err, "\x1b[0m");
          apelidoAlterado = false; // Se ocorrer um erro, o apelido não foi alterado
        }
      } else {
        console.log(`\x1b[33mNenhuma atualização de apelido necessária para ${membro.user.tag}\x1b[0m`);
      }

      console.log(`\x1b[32mMembro ${membro.user.tag} rebaixado com sucesso.\x1b[0m`);

      // Resposta do comando
      await interaction.reply({
        content: `Membro ${membro.toString()} rebaixado com sucesso!`,
        ephemeral: false,
      });
      const embedConfirmacao = new MessageEmbed()
      .setTitle('POLÍCIA CIVIL - EM DEFESA DE QUEM PRECISAR!')
        .setColor('#00FF00')
        .setDescription(`**CIDADE REPUBLICA RJ**
        \n**REBAIXAMENTO DE OFICIAIS**\n\nO Alto comando vem através deste, expressar no uso de suas atribuições, visando suprir suas necessidades hierárquicas, informar o rebaixamento do oficial listado abaixo:
        \nFUNCIONAL: ${membro.toString()}
        \nPara a função de: ${cargoAdicionar ? cargoAdicionar.toString() : "Nenhum"}
        \nAgradecemos os serviços prestados até o momento.\n\nCumpra-se.
        \nAtenciosamente, ${interaction.user.toString()}`)
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text:'PCERJ - Departamento de Recursos Humanos'})
        .setTimestamp();
    
    // Envia o embed de confirmação para o mesmo canal onde o comando foi chamado
    await interaction.channel.send({ embeds: [embedConfirmacao] });
      // Log do rebaixamento
      const canalEmbedID = config.channelLogCommands; // ID do canal de logs
      // const canalEmbedID = "1178075468759584850"; // ID do canal de logs

      const canalEmbed = interaction.guild.channels.cache.get(canalEmbedID);
      // Log do rebaixamento
      const campoApelidoAtualizado = apelidoAlterado
        ? `De ${apelidoAtual} para ${novoApelido}`
        : "Não";
      const embedLog = new MessageEmbed()
        .setTitle('Rebaixamento de Membro')
        .setColor('#FF0000')
        .setDescription(`Membro rebaixado por ${interaction.user.toString()}`)
         .addFields(
          { name: 'Membro Rebaixado:', value: membro.toString() },
          { name: 'Cargo Removido:', value: cargoRemover.toString() },
          { name: 'Novo Cargo:', value: cargoAdicionar ? cargoAdicionar.toString() : "Nenhum" },
          { name: 'Apelido Atualizado:', value: campoApelidoAtualizado }
        )
        .setTimestamp();

      canalEmbed.send({ embeds: [embedLog] });

    } catch (error) {
      console.error("Erro ao rebaixar membro:", error);
      return interaction.reply({
        content: "Erro ao rebaixar membro. Verifique as permissões e tente novamente.",
        ephemeral: true,
      });
    }
  };
};
