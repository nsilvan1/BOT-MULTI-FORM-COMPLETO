const { MessageEmbed } = require("discord.js");
const config = require("../config.json");
const mysql = require('mysql');
const connection = mysql.createPool({
  host: config.ipBanco,
  user: config.userBanco,
  password: config.passBanco,
  database: config.nomedatabase
});

const userAproved = async (interaction, discordId) => {
  // Obter o objeto de canal específico
  const specificChannel = interaction.guild.channels.cache.get(config.CHANEL_ANUNCIOREC);

  if (!specificChannel) {
    await interaction.reply('Canal específico não encontrado. Verifique a configuração.');
    return;
  }

  // embed privado
  const embed = new MessageEmbed()
    .setColor("#00FF00")
    .setDescription(`✅ <@${discordId}> seu **FORMULÁRIO** foi **APROVADO,** fique atento às datas e horários em: <#${specificChannel.id}> para efetuar o recrutamento`);

  const member = await interaction.guild.members.fetch(discordId);
  await member.send({ embeds: [embed] });
  await member.roles.remove(config.roleAwaitResponse || null).catch((e) => e);
  await member.roles.add(config.roleAproved || null).catch((e) => e);

  // embed canal aprovado
  const embedAproved = new MessageEmbed()
    .setColor("#00FF00")
    .setDescription(`✅ <@${discordId}> seu **FORMULÁRIO** foi **APROVADO,** fique atento às datas e horários em: <#${specificChannel.id}> para efetuar o recrutamento`);

  const channelAproved = await interaction.guild.channels.cache.get(config.channelAproved);
  await channelAproved.send({ embeds: [embedAproved] });

  const configLogAproved = await interaction.guild.channels.cache.get(config.channelLogResulted);

  await configLogAproved?.send({
    embeds: [
      new MessageEmbed()
        .setTitle("LOG de Aprovados")
        .setColor('#00FF00')
        .setDescription(`Aprovado por: <@${interaction.user.id}>\nUsuario aprovado: <@${discordId}>`)
        .setTimestamp()
    ],
  });

  // Enviar a primeira resposta
  await interaction.reply({
    content: `**Usuario aprovado com sucesso: <@${discordId}>**`,
    ephemeral: true,
  });

  // Verificar se a mensagem da interação existe antes de tentar deletar
  if (interaction.message) {
    await interaction.message.delete().catch(e => console.error(e));
  }

  connection.query(`SELECT h.id, f.id as idFormulario FROM formulario f
  LEFT join  hststatus h  on f.id = idFormulario
  WHERE f.idDiscord = '${discordId}'`,
    function (err, result, fields) {
      if (err) {
        console.error(err);
        return;
      }
      insert(discordId, interaction.user.username, result[0].idFormulario);
    });
};

function insert(idDiscord, name, idFormulario) {
  let sql = `insert into hststatus(idFormulario, discordAprovador, Status,DataAvaliacao ) values(${idFormulario}, '${name}','APROVADO', now())`;
  console.log(sql);
  connection.query(sql, function (err, result) {
    if (err) {
      console.error(err);
      return;
    }
    let sql1 = `update formulario set status = 'APROVADO' where id = ${idFormulario}`;
    connection.query(sql1, function (err, result) {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Formulário ${idFormulario} atualizado`);
    });
  });
}

module.exports = { userAproved };
