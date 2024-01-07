// src/events/client/guildDelete.js
const query = require('../../utils/database');

module.exports = class GuildDelete {
    constructor(client) {
        this.client = client;
        this.name = 'guildDelete';
    }

    async run(guild) {
        console.log(`Removido do servidor: ${guild.name} (ID: ${guild.id})`);
        try {
            await query(
                'UPDATE ServerSettings SET active = 0 WHERE server_id = ?',
                [guild.id]
            );
            console.log(`O servidor ${guild.name} (ID: ${guild.id}) foi marcado como inativo no banco de dados.`);
        } catch (error) {
            console.error('Erro ao atualizar o status do servidor no banco de dados:', error);
        }
    }
};
