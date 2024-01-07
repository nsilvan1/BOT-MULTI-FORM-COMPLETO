const { Modal, MessageActionRow, MessageEmbed, TextInputComponent } = require('discord.js');

module.exports = class InteractionCreateModal {
    constructor(client) {
        this.client = client;
        this.name = 'interactionCreate';
    }

    run = async (interaction) => {
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour12: false
        });

        try {
            if (interaction.isButton()) {
                const buttonId = interaction.customId;

                if (buttonId === 'verificar') {
                    const modal = new Modal()
                        .setCustomId('nickname_modal')
                        .setTitle('Alterar Apelido');

                    const nomeInput = new TextInputComponent()
                        .setCustomId('nome')
                        .setLabel('Nome do personagem')
                        .setPlaceholder('・Nome do personagem')
                        .setMinLength(1)
                       .setMaxLength(15) // ID MAXIMO
                        .setRequired(true)
                        .setStyle('SHORT');

                    const idInput = new TextInputComponent()
                        .setCustomId('id')
                        .setLabel('Seu ID')
                        .setMinLength(2) // MINIMO DE 2
                        .setMaxLength(25) // MAXIMO DE 25
                        .setPlaceholder('・ID na cidade')
                        .setRequired(true)
                        .setStyle('SHORT');

                    const senhaInput = new TextInputComponent()
                        .setCustomId('senha')
                        .setLabel('Senha')
                        .setPlaceholder('・Senha informada pelo Instrutor')
                        .setRequired(true)
                        .setStyle('SHORT');

                    const firstActionRow = new MessageActionRow().addComponents(nomeInput);
                    const secondActionRow = new MessageActionRow().addComponents(idInput);
                    const thirdActionRow = new MessageActionRow().addComponents(senhaInput);

                    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

                    await interaction.showModal(modal);
                }
            } else if (interaction.isModalSubmit() && interaction.customId === 'nickname_modal') {
                // Deferir a resposta imediatamente para evitar o erro
                await interaction.deferReply({ ephemeral: true });

                const nome = interaction.fields.getTextInputValue('nome');
                const id = interaction.fields.getTextInputValue('id');
                const senhaInserida = interaction.fields.getTextInputValue('senha');
                const senhaCorreta = this.client.senhaApelido; // Acessar a senha global

                if (senhaInserida !== senhaCorreta) {
                    return interaction.editReply({ content: 'Senha incorreta.', ephemeral: true });
                }


                const novoApelido = `${nome} | ${id}`;

                console.log(`\x1b[32m${interaction.user.tag} \x1b[0mAlterou o apelido para \x1b[34m${novoApelido}\x1b[0m em \x1b[35m${dataFormatada}\x1b[0m`);

                const member = interaction.guild.members.cache.get(interaction.user.id);

                try {
                    await member.setNickname(novoApelido);
                    const embed = new MessageEmbed()
                        .setDescription(`Seu apelido foi alterado para: ${novoApelido}`)
                        .setColor('GREEN');

                    await interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    if (error.code === 50013) {
                        await interaction.editReply({ content: "Não tenho permissão para alterar apelidos neste servidor." });
                    } else {
                        console.error("Erro ao alterar o apelido:", error);
                        await interaction.editReply({ content: "Não foi possível alterar seu apelido devido a um erro." });
                    }
                }
            }
        } catch (error) {
            console.error('Erro na interação:', error);
        }
    };
};
