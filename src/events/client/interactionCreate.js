const Event = require("../../structures/Event");
const config = require("../../../config.json");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { userAproved } = require("../../../assets/userAproved");
const { userReproved } = require("../../../assets/userReproved");
const query = require('../../utils/database'); // Importação direta da função query

const mysql = require('mysql');
const connection = mysql.createPool({
  host: config.ipBanco,
  user: config.userBanco,
  password: config.passBanco,
  database: config.nomedatabase
});

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: "interactionCreate",
    });
  }

  run = async (interaction) => {
    // Verifique se é um comando antes de continuar
    if (interaction.isCommand()) {
      if (!interaction.guild) return;

      let isActive = false;

      try {
        const result = await query(
          'SELECT active FROM ServerSettings WHERE server_id = ?',
          [interaction.guild.id]
        );

        if (result && result.length > 0 && result[0].active === 1) {
          isActive = true;
        }
      } catch (error) {
        console.error('Erro ao verificar se o servidor está ativo:', error);
        return interaction.reply({ content: "Erro ao processar o comando.", ephemeral: true });
      }

      if (!isActive) {
        return interaction.reply({ content: "Os comandos deste bot estão desativados neste servidor.", ephemeral: true });
      }

      const cmd = this.client.commands.find(
        (c) => c.name === interaction.commandName
      );

      if (cmd) {
        if (cmd.requireDatabase) {
          interaction.guild.db =
            (await this.client.db.guilds.findById(interaction.guild.id)) ||
            new this.client.db.guilds({ _id: interaction.guild.id });
        }
        const embedErr = new MessageEmbed()
          .setColor("#2f3136")
          .setDescription(
            "<a:seta:911023947909300286> **Não tenho permissão para executar os comandos, preciso de permissão: `Administrador`**"
          );
        if (!interaction.guild.members.me.permissions.has("ADMINISTRATOR"))
          return interaction.reply({ embeds: [embedErr], ephemeral: true });
        cmd.run(interaction);
      }
    } else if (interaction.isButton()) {
      const buttonId = interaction.customId;
      ////
      if (buttonId == "realizar-formulario") {
        const existingFormChannel = interaction.guild.channels.cache.find(
          (c) => c.topic == interaction.user.id
        );

        connection.query(`SELECT * FROM blacklist d WHERE d.discordId = ${interaction.user.id} and d.ativo = 1
        and d.id = (select max(d1.id) from blacklist d1 where d1.discordId = d.discordId)`,
          async function (err, result, fields) {
            console.log(result)
            if (result.length > 0) {
              return interaction.reply({
                content: "**Você está na blacklist favor entrar em contato com os Administradores.**",
                ephemeral: true,
              });
            }
            else {

              // Verificar se o usuário tem um cargo específico
              const hasSpecificRole = interaction.member.roles.cache.some(role => role.id === config.roleVisitor);

              if (existingFormChannel) {
                return interaction.reply({
                  content: "**Você já tem um Formulário em aberto. Conclua-o antes de iniciar outro.**",
                  ephemeral: true,
                });
              }

              if (!hasSpecificRole) {
                return interaction.reply({
                  content: "** Você ja preencheu um Formulario, aguarde a leitura.**",
                  ephemeral: true,
                });
              }

              const channel = await interaction.guild.channels.create(
                `�・al-${interaction.user.username}`,
                {
                  type: "GUILD_TEXT",
                  parent: config.categoryChannelForm,

                  topic: `${interaction.user.id}`,
                  permissionOverwrites: [
                    {
                      id: interaction.guild.id,
                      deny: ["VIEW_CHANNEL"],
                    },
                    {
                      id: interaction.user.id,
                      allow: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "READ_MESSAGE_HISTORY",
                        "ATTACH_FILES",
                        "EMBED_LINKS",
                        "ADD_REACTIONS",
                      ],
                    },
                  ],
                }
              );

              interaction.reply({
                embeds: [
                  new MessageEmbed()
                    .setDescription(
                      `<@${interaction.user.id}>, seu canal de **Formulário** foi criado com sucesso em: <#${channel.id}>`
                    )
                    .setColor("#2f3136"),
                ],
                components: [
                  new MessageActionRow().addComponents(
                    new MessageButton()
                      .setLabel("Ir para o canal")
                      .setEmoji("📨")
                      .setStyle("LINK")
                      .setURL(
                        `https://discord.com/channels/${interaction.guild.id}/${channel.id}`
                      )
                  ),
                ],
                ephemeral: true,
              });

              const embedCreateChannel = new MessageEmbed()

                .setColor("#2f3136")
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                // .setImage("https://media.discordapp.net/attachments/710178308154851418/1170742145854996570/wl.png?ex=655a2596&is=6547b096&hm=42d9d2404269d0e2e64ba073f829301063dbe120010b0255cc1ee02be6648c5c&=&width=810&height=103")
                .setTitle("Formulário iniciado")
                .setDescription(
                  `**${interaction.user.username}**, aqui está o canal do seu **Formulário**, abaixo citamos algumas instruções para efetuar de maneira correta!
            \nVocê possui 1 hora para realizar o Formulário, depois disso o canal será deletado tendo que recomeçar.
            \nFaça com **atenção**, **cautela** e **preencha todos** os campos corretamente.
            \nApós o envio, ele será enviado nossos recrutadores que irá avaliar as suas respostas.
            \nFique tranquilo que o resultado será enviado aos respectivos canais aqui no Discord da Policia.
            \nBoa sorte! `
                );
              const startAllowList = await channel.send({
                embeds: [embedCreateChannel],
                components: [],
              });

              const questionMessages = Object.keys(config.QUESTION).map(
                (key, index) => `${config.QUESTION[key]}`
              );
              const questions = [];
              const filterCol = (i) => i.user.id === interaction.user.id;
              const collector = channel.createMessageCollector({
                filterCol,
                time: 3600000,
              });
              let questionIndex = 0;
              let confirmed = true;
              async function confirmAllowlist() {
                const confirmButton = new MessageButton()
                  .setCustomId("confirm_form")
                  .setLabel("Confirmar Formulário")
                  .setStyle("SUCCESS");

                const cancelButton = new MessageButton()
                  .setCustomId("cancel_form")
                  .setLabel("Cancelar Formulário")
                  .setStyle("DANGER");

                const row = new MessageActionRow()
                  .addComponents(confirmButton)
                  .addComponents(cancelButton);
                firstQuestion.delete().catch(e => e)
                const response = await channel.send({
                  content:
                    "Selecione umas das alternativas (Em 5 minutos caso não tenha respostas o canal será deletado!)",
                  components: [row],
                });
                const collectorFilter = (i) => i.user.id === interaction.user.id;
                try {
                  const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 60000 * 5,
                  });

                  if (confirmation.customId == "cancel_form") {
                    confirmed = false;
                    return channel.delete();
                  } else {
                    confirmed = true;
                  }
                } catch (e) {
                  confirmed = false;
                  return channel.delete();
                }
              }

              const firstQuestion = await startAllowList.reply({
                embeds: [
                  new MessageEmbed()
                    .setAuthor({
                      name: `Pergunta ${questions.length + 1}/17`,
                      iconURL: interaction.guild.iconURL({ dynamic: true }),
                    })
                    .setDescription(`${questionMessages[questionIndex]}`)
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                ],
              });
              collector.on("collect", async (collectedMessage) => {
                questions.push(collectedMessage.content);
                collectedMessage.delete().catch(e => e)
                if (questions.length >= 17) {
                  collector.stop();
                } else {
                  questionIndex++;
                  firstQuestion.edit({
                    embeds: [
                      new MessageEmbed()
                        .setAuthor({
                          name: `Pergunta ${questions.length + 1}/17`,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                        })
                        .setDescription(`${questionMessages[questionIndex]}`)
                        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    ],
                  });
                }
              });
              // Coleta perguntas
              collector.on("end", async (collected, reason) => {
                if (reason === "time") {
                  channel.delete();
                } else {
                  await confirmAllowlist();
                  if (!confirmed) return;
                  const member = await interaction.guild.members.fetch(
                    interaction.user.id
                  );
                  await member.send({
                    embeds: [new MessageEmbed()
                      .setDescription(`📃 Seu **FORMULÁRIO** foi enviado para análise. Aguarde a leitura.`)
                      .setColor('#ffff00')]
                  })
                  const embedAnswers = new MessageEmbed()
                    .setTitle("� Novo Formulario recebido")
                    .setColor("#3498db")
                    .setDescription(
                      `Respostas de <@${interaction.user.id}> abaixo!`
                    );

                  let idDiscord = interaction.user.id
                  let nameDiscord = interaction.user.username
                  connection.query(`SELECT * FROM formulario WHERE idDiscord = '${idDiscord}'`,
                    function (err, result, fields) {
                      if (result && result[0] && result[0].id) {
                        console.log("update")
                        update(result[0].id)
                      } else {
                        console.log("insert")
                        insert(idDiscord, nameDiscord, interaction);

                      }
                    })

                  for (let i = 0; i < questions.length; i++) {
                    embedAnswers.addFields({
                      name: `Pergunta: ${questionMessages[i]}`,
                      value: `\`\`\`${questions[i]}\`\`\``,
                    });
                  }

                  const channelStaff = interaction.guild.channels.cache.get(
                    config.channelReceiveForm
                  );
                  await member.roles.remove(config.roleVisitor || null).catch((e) => e);
                  await member.roles
                    .add(config.roleAwaitResponse || null)
                    .catch((e) => e);
                  channelStaff.send({
                    embeds: [embedAnswers],
                    components: [
                      new MessageActionRow()
                        .addComponents(
                          new MessageButton()
                            .setLabel("Aprovado")
                            .setCustomId("al_aproved_" + interaction.user.id)
                            .setEmoji("✅")
                            .setStyle("SECONDARY")
                        )
                        .addComponents(
                          new MessageButton()
                            .setLabel("Reprovado")
                            .setCustomId("al_reproved_" + interaction.user.id)
                            .setEmoji("❌")
                            .setStyle("SECONDARY")
                        ),
                    ],
                  });
                  channel.delete();
                }
              });

            }
          })
      } 
      else if (buttonId.startsWith("al_aproved_")) {
        const userId = buttonId.split("_")[2];
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false
       });
        // Verifica se o membro ainda está no servidor
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) {
          console.log(`\x1b[32m${interaction.user.tag}\x1b[0m | Membro \x1b[33m(ID: ${userId})\x1b[0m não encontrado no servidor para aprovação.\x1b[35m ${dataFormatada}\x1b[0m`); // Vermelho para erro
          return interaction.reply({ content: "Membro não está mais no servidor.", ephemeral: true });
        }
        console.log(`\x1b[32m${interaction.user.tag}\x1b[0m aprovou o membro \x1b[32m${member.user.tag} (ID: ${userId})\x1b[0m.`); // Verde para aprovação
        // Chama a função de aprovação
        userAproved(interaction, userId);
    } else if (buttonId.startsWith("al_reproved_")) {
        const userId = buttonId.split("_")[2];
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour12: false
       });
        // Verifica se o membro ainda está no servidor
        const member = await interaction.guild.members.fetch(userId).catch(() => null);
        if (!member) {
          console.log(`\x1b[32m${interaction.user.tag}\x1b[0m | Membro \x1b[33m(ID: ${userId})\x1b[0m não encontrado no servidor para reprovação.\x1b[35m ${dataFormatada}\x1b[0m`); // Vermelho para erro
          return interaction.reply({ content: "Membro não está mais no servidor.", ephemeral: true });
        }
        console.log(`\x1b[34m${interaction.user.tag}\x1b[0m reprovou o membro \x1b[34m${member.user.tag} (ID: ${userId})\x1b[0m.`); // Azul para reprovação
        // Chama a função de reprovação
        userReproved(interaction, userId);
    }
    
    }
  };
};

function update(id, idDiscord) {
  let sql = `update formulario 
             set dataEnvio = now(), 
                 status = 'PENDENTE'
               where id = ${id}`
  console.log(sql)
  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    const now = new Date();
    console.log(idDiscord)
  })
}

function insert(idDiscord, name) {
  let sql = `insert into formulario(idDiscord, Nome, status,dataEnvio ) values(${idDiscord}, '${name}','PENDENTE', now())`
  console.log(sql)
  connection.query(sql, function (err, result) {
    if (err) console.log(err);
    const now = new Date();
  })
};
