const path = require('path');
const { MessageEmbed } = require('discord.js');
const mysql = require('mysql');
const Command = require("../../structures/Command");

const configPath = path.resolve(__dirname, '../../../config.json');
const config = require(configPath);
var memberId = 0;
var memberName = '';
module.exports = class BlacklistCommand extends Command {
  constructor(client) {
    super(client, {
      name: "blacklist",
      description: "Adiciona ou remove um membro da Blacklist",
      options: [
        {
          name: 'membro',
          description: 'Membro que será manipulado na Blacklist',
          type: 'USER',
          required: true,
        },
        {
          name: 'motivo',
          description: 'Motivo da inclusão ou remoção da Blacklist',
          type: 'STRING',
          required: true,
        },
        {
          name: 'acao',
          description: 'Ação a ser realizada (adicionar ou remover)',
          type: 'STRING',
          required: true,
          choices: [
            { name: 'adicionar', value: 'adicionar' },
            { name: 'remover', value: 'remover' },
          ],
        },
      ],
    });
  }

  run = async (interaction) => {
    try {
      // Verifica se o bot tem permissão para gerenciar mensagens, criar convites e gerenciar cargos
      if (!interaction.guild.members.me.permissions.has('MANAGE_MESSAGES') || !interaction.guild.members.me.permissions.has('CREATE_INSTANT_INVITE') || !interaction.guild.me.permissions.has('MANAGE_ROLES')) {
        return interaction.reply({
          content: 'O bot não tem permissão para gerenciar mensagens, criar convites ou gerenciar cargos!',
          ephemeral: true,
        });
      }

      const membro = interaction.options.getMember('membro');
      memberId = membro.user.id
      memberName = membro.user.username

      const motivo = interaction.options.getString('motivo');
      const aplicador = interaction.member; // Quem aplicou a inclusão na Blacklist

      if (interaction.options.getString('acao') === 'adicionar') {
        // Verifica se o membro já está na Blacklist
        if (await this.isBlacklisted(membro, interaction.user.id, 1)) { 
          return interaction.reply({
            content: 'Este membro já está na Blacklist.',
            ephemeral: true,
          });
        }

        // Adiciona o membro à Blacklist
        // console.log(interaction)
        await this.addToBlacklist(membro.id, motivo, interaction.user,1);

        // Restante do seu código permanece o mesmo
        // const canalBlacklistId = config.channelLogBlacklist; // ID do canal fornecido
        const canalBlacklistId = "1151017038278557696"; // ID do canal fornecido
        const canalBlacklist = interaction.guild.channels.cache.get(canalBlacklistId);

        if (!canalBlacklist) {
          return interaction.reply({
            content: 'Canal de Blacklist não encontrado. Configure o canal de Blacklist antes de usar este comando.',
            ephemeral: true,
          });
        }
 
        // Cria um embed
        const embed = new MessageEmbed()
          .setTitle(`⛔ Membro Adicionado à Blacklist ⛔`)
          .setColor('#FF0000')
          .addFields(
            { name: 'Membro', value: membro.toString(), inline: true },
            { name: 'Adicionado por', value: aplicador.toString(), inline: true },
            { name: 'Motivo', value: motivo, inline: true }
          )
          .setTimestamp();

        // Envia o embed no canal de advertência
        await canalBlacklist.send({ embeds: [embed] });

        await interaction.reply({ content: `Membro adicionado à Blacklist com sucesso`, ephemeral: false });
      } else if (interaction.options.getString('acao') === 'remover') {
        // Verifica se o membro está na Blacklist
        if (await this.isBlacklisted(membro, interaction.user.id, 0)) {
          return interaction.reply({
            content: 'Este membro não está na Blacklist.',
            ephemeral: true,
          });
        }

        // Remove o membro da Blacklist
        const motivoRemocao = await this.removeFromBlacklist(membro.id, interaction.user);

        // Restante do seu código permanece o mesmo
        // const canalBlacklistId = config.channelLogBlacklist; // ID do canal fornecido
        const canalBlacklistId = "1151017038278557696"; // ID do canal fornecido

        const canalBlacklist = interaction.guild.channels.cache.get(canalBlacklistId);

        if (!canalBlacklist) {
          return interaction.reply({
            content: 'Canal de Blacklist não encontrado. Configure o canal de Blacklist antes de usar este comando.',
            ephemeral: true,
          });
        }

        // Cria um embed
        const embed = new MessageEmbed()
          .setTitle(`⛔ Membro Removido da Blacklist ⛔`)
          .setColor('#00FF00')
          .addFields(
            { name: 'Membro', value: membro.toString(), inline: true },
            { name: 'Removido por', value: aplicador.toString(), inline: true },
            { name: 'Motivo da Remoção', value: motivo, inline: true }
          )
          .setTimestamp();

        // Envia o embed no canal de advertência
        await canalBlacklist.send({ embeds: [embed] });

        await interaction.reply({ content: `Membro removido da Blacklist com sucesso`, ephemeral: false });
      }
    } catch (error) {
      console.error("\x1b[31m[BOT]\x1b[0m Erro ao manipular a Blacklist:", error); // Vermelho
      return interaction.reply({
        content: "Erro ao manipular a Blacklist. Verifique as permissões e tente novamente.",
        ephemeral: true,
      });
    }
  };

  async isBlacklisted(member, admin, status) {
    const connection = mysql.createConnection({
      host: config.ipBanco,
      user: config.userBanco,
      password: config.passBanco,
      database: config.nomedatabase,
    });

    console.log("\x1b[35m[BOT]\x1b[0m Iniciando operação de verificação na Blacklist"); // Magenta

    return new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error("\x1b[31m[BOT]\x1b[0m Erro ao conectar ao banco de dados:", err); // Vermelho
          reject(err);
          return;
        }
        console.log("\x1b[35m[BOT]\x1b[0m Conexão bem-sucedida ao banco de dados!"); // Magenta

        console.log(`\x1b[35m[BOT]\x1b[0m Verificando se ${memberName} está na Blacklist...`); // Magenta
        connection.query(`SELECT * FROM blacklist d WHERE d.discordId = ? and d.ativo = ? 
                          and d.id = (select max(d1.id) from blacklist d1 where d1.discordId = d.discordId)`, [member.user.id, status], (error, results) => {
          if (error) {
            console.error("\x1b[31m[BOT]\x1b[0m Erro ao executar a consulta:", error); // Vermelho
            reject(error);
          } else {
            console.log("\x1b[35m[BOT]\x1b[0m Consulta executada com sucesso!"); // Magenta
            // console.log("\x1b[35m[BOT]\x1b[0m Resultados:", results); // Magenta
            resolve(results.length > 0);
          }
          connection.end();
        });
      });
    });
  }

  async addToBlacklist(memberId, motivo, admin,status) {
    const connection = mysql.createConnection({
      host: config.ipBanco,
      user: config.userBanco,
      password: config.passBanco,
      database: config.nomedatabase,
    });

    console.log("\x1b[35m[BOT]\x1b[0m Iniciando operação de adição à Blacklist"); // Magenta

    return new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error("\x1b[31m[BOT]\x1b[0m Erro ao conectar ao banco de dados:", err); // Vermelho
          reject(err);
          return;
        }
        console.log("\x1b[35m[BOT]\x1b[0m Conexão bem-sucedida ao banco de dados!"); // Magenta
        if (status == 1)  {
        console.log(`\x1b[35m[BOT]\x1b[0m Adicionando ${memberName} à Blacklist...`); // Magenta
        } else {
          console.log(`\x1b[35m[BOT]\x1b[0m Removendo ${memberName} à Blacklist...`); // Magenta
        }
        connection.query('INSERT INTO blacklist (member_name, discordId, motivo_inclusao, adicionado_por,nome_adicionado_por,ativo) VALUES (?,?,?,?,?, ?)', [memberName, memberId, motivo, admin.id,admin.username, status], (error) => {
          if (error) {
            console.error("\x1b[31m[BOT]\x1b[0m Erro ao executar a inserção:", error); // Vermelho
            reject(error);
          } else {
            console.log("\x1b[35m[BOT]\x1b[0m Inserção bem-sucedida!"); // Magenta
            resolve();
          }
          connection.end();
        });
      });
    });
  }

  async removeFromBlacklist(memberId, admin) {
    const connection = mysql.createConnection({
      host: config.ipBanco,
      user: config.userBanco,
      password: config.passBanco,
      database: config.nomedatabase,
    });

    console.log("\x1b[35m[BOT]\x1b[0m Iniciando operação de remoção da Blacklist"); // Magenta

    return new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error("\x1b[31m[BOT]\x1b[0m Erro ao conectar ao banco de dados:", err); // Vermelho
          reject(err);
          return;
        }
        console.log("\x1b[35m[BOT]\x1b[0m Conexão bem-sucedida ao banco de dados!"); // Magenta

        console.log("\x1b[35m[BOT]\x1b[0m Removendo membro da Blacklist..."); // Magenta
        this.addToBlacklist(memberId, 'Remoção da blacklist', admin,0)
        connection.query('SELECT motivo_inclusao FROM blacklist WHERE discordId = ? AND ativo = 0', [memberId], (selectError, selectResults) => {
          if (selectError) {
            console.error("\x1b[31m[BOT]\x1b[0m Erro ao obter o motivo da remoção:", selectError); // Vermelho
            reject(selectError);
          } else {
            const motivoRemocao = selectResults[0] ? selectResults[0].motivo : 'Motivo não disponível';
            resolve(motivoRemocao);
          }
          connection.end();
        });
      });
    });
  }
};