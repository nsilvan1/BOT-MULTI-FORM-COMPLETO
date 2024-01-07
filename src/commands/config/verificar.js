const Command = require("../../structures/Command");
const config = require('../../../config.json');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

module.exports = class extends Command {
    constructor(client) {
        super(client, {
            name: "verificar",
            description: "Envia uma mensagem com instruções para verificação no servidor",
            options: [
                {
                    name: 'senha',
                    description: 'Senha para alteração de apelido',
                    type: 'STRING',
                    required: true,
                },
            ],
        });
    }

    run = async (interaction) => {
         // Armazenar a senha globalmente
         const senha = interaction.options.getString('senha');
         this.client.senhaApelido = senha;

        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false
        });
    
        console.log(`\x1b[32m${interaction.user.tag} \x1b[0musou o comando\x1b[0m ${interaction}\x1b[0m em \x1b[35m${dataFormatada}\x1b[0m`);
    
        // Verifica se o usuário tem permissão para usar o comando
        if (!interaction.member.permissions.has("MANAGE_GUILD")) {
            return interaction.reply({
                content: "Você não tem permissão para usar este comando!",
                ephemeral: true,
            });
        }

        // Criação do botão que abrirá o modal
        const openModalButton = new MessageButton()
            .setCustomId('verificar')
            .setLabel('Alterar Nome')
            .setStyle('SUCCESS');

        const row = new MessageActionRow().addComponents(openModalButton); 

        // Criação do embed com instruções de verificação
        const verifyEmbed = new MessageEmbed()
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setColor("#109010")
            .setDescription(`**ATENÇÃO**
                \n**ALTERE SEU NOME NO BOTÃO ABAIXO!**
                \nPara alterar o Nome, você vai precisar de uma SENHA.
                \nA senha senha foi informada no Recrutamente PRESENCIAL
                \nVocê só poderá alterar o nome uma ÚNICA vez!

                \n**SE VOCÊ NÃO ESTA NO RECRUTAMENTO PRECISAL NAO VAI CONSEGUIR ALTERAR O NOME!**
                `)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setTimestamp();
  
        // Envia a mensagem com o botão de verificação
        await interaction.reply({
            content: "Mensagem de verificação enviada com sucesso!",
            ephemeral: true,
        });

        await interaction.channel.send({ embeds: [verifyEmbed], components: [row] });

        // Notificar o usuário sobre a definição da senha
        await interaction.followUp({ content: 'Senha definida com sucesso.', ephemeral: true });

        // Criação do Embed para o Log
        const logEmbed = new MessageEmbed()
            .setTitle(`Comando ${interaction} Executado`)
            .setColor("#34ebd8")
            .setDescription(`O comando **${interaction}** foi utilizado por ${interaction.user.tag}`)
            .addFields(
                { name: "Executado por", value: `<@${interaction.user.id}>`, inline: true },
                { name: "Canal", value: `<#${interaction.channel.id}>`, inline: true },
                { name: "Hora", value: dataFormatada, inline: true }
            )
            .setTimestamp();



            
        // Enviando o Embed de Log para o canal específico
        const logChannelId = config.channelLogCommands;
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        } else {
            console.warn("Canal de log não encontrado. Verifique a configuração.");
        }
    };
};
