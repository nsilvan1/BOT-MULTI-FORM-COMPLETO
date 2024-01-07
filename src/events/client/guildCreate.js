// src/events/client/guildCreate.js
const query = require('../../utils/database'); // Importação direta da função, sem desestruturação

module.exports = class GuildCreate {
    constructor(client) {
        this.client = client;
        this.name = 'guildCreate';
    }

    async run(guild) {
        console.log(`Adicionado ao servidor: ${guild.name} (ID: ${guild.id})`);
        try {
            // A consulta já insere a data atual e define o servidor como ativo por padrão
            await query(
                'INSERT INTO ServerSettings (server_id, server_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE server_name = ?, active = 1',
                [guild.id, guild.name, guild.name]
            );
            console.log(`Servidor ${guild.name} (ID: ${guild.id}) adicionado ou atualizado no banco de dados com a data e status ativo.`);
        } catch (error) {
            console.error(`Erro ao adicionar/atualizar o servidor no banco de dados:`, error);
        }
    }
};