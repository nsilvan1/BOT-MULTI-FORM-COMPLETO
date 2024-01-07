// src/commands/abrirrec.js
const Command = require("../../structures/Command");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const query = require('../../utils/database'); // A importação da função de consulta ao banco de dados

module.exports = class AbrirRecCommand extends Command {
    constructor(client) {
        super(client, {
            name: "abrirrec",
            description: "Mensagem com a função de realizar formulario",
        });
    }

    run = async (interaction) => {
        // Formatação da data atual para log
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour12: false
    });

    console.log(`\x1b[32m${interaction.user.tag} \x1b[0musou o comando\x1b[0m ${interaction}\x1b[0m em \x1b[35m${dataFormatada}\x1b[0m`);


        // Verificação das permissões do usuário que executou o comando
        if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
            return interaction.reply({
                content: "Você não tem permissão para usar este comando!",
                ephemeral: true,
            });
        }

        // Busca as configurações do servidor no banco de dados
        let serverSettings;
        try {
            serverSettings = await query('SELECT * FROM ServerSettings WHERE server_id = ?', [interaction.guild.id]);
            if (serverSettings.length === 0) throw new Error('Configurações do servidor não encontradas.');
        } catch (error) {
            // Log do erro ao buscar configurações
            console.error('Erro ao buscar as configurações do servidor no banco de dados:', error);
            return interaction.reply("Erro ao buscar as configurações do servidor no banco de dados.");
        }

        // Supondo que o bloco try foi bem-sucedido, serverSettings já tem os dados necessários
        // Não precisa de uma segunda consulta ao banco de dados
        const urlManual = serverSettings[0]?.url_manual || 'https://github.com/'; // Substitua 'URL_PADRAO' pela sua URL padrão

        // Criação dos botões para interação
        const button1 = new MessageButton()
            .setLabel("Realizar Formulário")
            .setEmoji("📝")
            .setStyle("SECONDARY")
            .setCustomId("realizar-formulario");

        const button2 = new MessageButton()
            .setLabel("Manual de conduta")
            .setEmoji('📚')
            .setStyle('LINK')
            .setURL(urlManual);

            const row = new MessageActionRow().addComponents(button1, button2);

            // Primeiro, tenta apagar a última mensagem do bot no canal
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: 100 });
            const botMessages = fetchedMessages.filter(m => m.author.id === this.client.user.id && !m.system);
            if (botMessages.size > 0) {
                const lastBotMessage = botMessages.last();
                // Verifica se a última mensagem não é a interação atual
                if (lastBotMessage.id !== interaction.id) {
                    await lastBotMessage.delete().catch(console.error);
                }
            }
        // Criação da embed para a mensagem de resposta
        const embed1 = new MessageEmbed()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setColor("#109010")
        .setDescription(`**FORMULÁRIO FECHADO**
        \n**ATENÇÃO:**
        \nIDADE MÍNIMA PARA INGRESSAR NA CORPORAÇÃO: **16 ANOS**
        Não fazemos recrutamento à parte, apenas por formulário!
        Não pedir/insistir no PV de NINGUÉM.
        Sua ficha precisa estar limpa! 
        \n **LEIAM O MANUAL DE CONDUTA!**
       `)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setImage("https://i.imgur.com/Ons4SBD.png")
        .setFooter({ text: "❗ Caso apresentar algum erro, contate a STAFF!" })
        .setTimestamp();

        // Envia a mensagem embed com botões para o canal
        await interaction.reply({ embeds: [embed1], components: [row] });

        // Criação da embed para o log de comandos
        const logEmbed = new MessageEmbed()
            .setTitle(`Comando ${interaction.commandName} Executado`)
            .setColor("#34ebd8")
            .setDescription(`O comando abrirrec foi utilizado por ${interaction.user.tag}`)
            .addFields(
                { name: "Executado por", value: `<@${interaction.user.id}>`, inline: true },
                { name: "Canal", value: `<#${interaction.channel.id}>`, inline: true },
                { name: "Hora", value: dataFormatada, inline: true }
            )
            .setTimestamp();

        // Busca o canal de logs baseado nas configurações e envia o logEmbed para lá
        const logChannelId = serverSettings[0].logChannelId;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        } else {
            console.warn(`Canal de log não encontrado para o servidor ${interaction.guild.name}. Verifique a configuração.`);
        }
    };
};