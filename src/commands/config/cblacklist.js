const Command = require("../../structures/Command");
const { MessageEmbed } = require('discord.js');
const mysql = require('mysql');
const config = require('../../../config.json'); // Ajuste o caminho conforme necessário

module.exports = class ConsultarBlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: "cblacklist",
      description: "Consulta se um membro está na Blacklist",
      options: [
        {
          name: 'membro',
          description: 'ID do membro a ser consultado',
          type: 'USER',
          required: true,
        },
      ],
    });
  }
 
  run = async (interaction) => {
    const membro = interaction.options.getMember('membro');
    const memberId = membro.user.id;

    try {
      const resultado = await this.consultarBlacklist(memberId);
      if (resultado) {
        const embed = new MessageEmbed()
          .setTitle(`⛔ Informações da Blacklist`)
          .setColor('#FF0000')
          .addFields(
            { name: 'Membro', value: `<@${memberId}>`, inline: true },
            { name: 'Adicionado por', value: `${resultado.nome_adicionado_por}`, inline: true },
            { name: 'Motivo', value: resultado.motivo_inclusao, inline: true },
            { name: 'Data de Inclusão', value: resultado.data_inclusao.toLocaleString(), inline: true },
            { name: 'Ativo', value: resultado.ativo.toLocaleString(), inline: true }

          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply({ content: `O membro <@${memberId}> não está na blacklist.`, ephemeral: true });
      }
    } catch (error) {
      console.error("Erro ao consultar a blacklist:", error);
      await interaction.reply({ content: "Erro ao consultar a blacklist. Tente novamente mais tarde.", ephemeral: true });
    }
  };

  consultarBlacklist(memberId) {
    return new Promise((resolve, reject) => {
      const connection = mysql.createConnection({
        host: config.ipBanco,
        user: config.userBanco,
        password: config.passBanco,
        database: config.nomedatabase,
      });
 
      connection.connect(err => {
        if (err) {
          console.error("Erro ao conectar ao banco de dados:", err);
          reject(err);
          return;
        }

        connection.query('SELECT * FROM blacklist WHERE discordId = ? AND ativo = 1 ORDER BY id DESC LIMIT 1', [memberId], (error, results) => {
          connection.end();

          if (error) {
            console.error("Erro ao executar a consulta:", error);
            reject(error);
            return;
          }

          if (results.length > 0) {
            resolve(results[0]);
          } else {
            resolve(null);
          }
        });
      });
    });
  }
};
