const { MessageEmbed } = require("discord.js");
const config = require("../config.json");
const { format } = require('date-fns');
const mysql = require('mysql');
const connection = mysql.createPool({
  host: config.ipBanco,
  user: config.userBanco,
  password: config.passBanco,
  database: config.nomedatabase
});

const userReproved = async (interaction, discordId) => {
  const member = await interaction.guild.members.fetch(discordId);

  const reprovedMessageContent = `:x:  <@${discordId}> seu **FORMULÁRIO** foi reprovado. Formule melhor suas respostas.`;
  await member.send(reprovedMessageContent);
  await member.roles.remove(config.roleAwaitResponse || null).catch((e) => e);
  await member.roles.add(config.roleReproved || null).catch((e) => e);

  const channelReproved = await interaction.guild.channels.cache.get(
    config.channelReproved
  );

  // Mensagem para channelReproved sem embed
  channelReproved.send(reprovedMessageContent);

  const configLogAproved = await interaction.guild.channels.cache.get(
    config.channelLogResulted
  );
  
  // Log de Reprovados com embed
  const embedReproved = new MessageEmbed()
    .setTitle("LOG de Reprovados")
    .setColor("#FF0000")
    .setDescription(`Reprovado por: <@${interaction.user.id}>
                    \nUsuario reprovado: <@${discordId}>`)
    .setTimestamp();

  configLogAproved?.send({ embeds: [embedReproved] });

  interaction.reply({
    content: `**Usuario reprovado com sucesso: <@${discordId}>**`,
    ephemeral: true,
  });
  connection.query(`SELECT h.id, f.id as idFormulario FROM formulario f
  LEFT join  hststatus h  on f.id = idFormulario
  WHERE f.idDiscord = '${discordId}'`,
    function (err, result, fields) {
      insert(discordId, interaction.user.username, result[0].idFormulario);
    })
  //
  interaction.message.delete();
};

function insert(idDiscord, name, idFormulario) {
  let sql = `insert into hststatus(idFormulario, discordAprovador, Status,DataAvaliacao ) values(${idFormulario}, '${name}','REPROVADO', now())`
  console.log(sql)
  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    const now = new Date();
    let sql1 = `update formulario 
                set status = 'REPROVADO'
                where id = ${idFormulario}`
    connection.query(sql1, function (err, result) {
      if (err) console.log(err);
      const now = new Date();
      console.log(idDiscord)
    })
  })
}

module.exports = { userReproved };
