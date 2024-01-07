const Discord = require('discord.js');
const Event = require("../../structures/Event");
const query = require('../../utils/database'); // Ajuste o caminho conforme necessário

async function verificarNomesDosServidores(client) {
    client.guilds.cache.forEach(async guild => {
        try {
            const resultado = await query('SELECT server_name FROM ServerSettings WHERE server_id = ?', [guild.id]);
            if (resultado.length > 0 && resultado[0].server_name !== guild.name) {
                await query('UPDATE ServerSettings SET server_name = ? WHERE server_id = ?', [guild.name, guild.id]);
                console.log(`Nome do servidor atualizado para '${guild.name}' no servidor com ID: ${guild.id}`);
            }
        } catch (error) {
            console.error(`Erro ao verificar/alterar o nome do servidor: ${guild.name} (ID: ${guild.id}):`, error);
        }
    });
}

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: "ready",
        });
    }

    run = async () => {
        console.log("\x1b[36m[BOT]\x1b[0m Iniciando...."); // Ciano
        this.client.registryCommands();

        // Exibindo informações adicionais
        console.log("\x1b[36m[BOT]\x1b[0m Nome do Bot:", this.client.user.tag); // Ciano
        console.log("\x1b[36m[BOT]\x1b[0m Versão do Discord.js:", Discord.version); // Ciano

        // Exibindo informações sobre cada servidor
        console.log("\x1b[36m[BOT]\x1b[0m O bot está em", this.client.guilds.cache.size, "servidores:");
        this.client.guilds.cache.forEach((guild) => {
            console.log("\x1b[36m[BOT]\x1b[0m🌐 Servidor:", guild.name, "| Membros:", guild.memberCount);
        });

        // Exibindo o total de usuários, canais e servidores que o bot pode ver
        console.log("\x1b[36m[BOT]\x1b[0m Total de Usuários:", this.client.users.cache.size); // Ciano
        console.log("\x1b[36m[BOT]\x1b[0m Total de Canais:", this.client.channels.cache.size); // Ciano
        console.log("\x1b[36m[BOT]\x1b[0m Total de Servidores:", this.client.guilds.cache.size); // Ciano

        let i = 0;
        setInterval(() => {
            let totalMembers = this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            
            let activities = [
                { name: `⚙️ FD STORE`, type: 'PLAYING' },
                { name: `📝 Verificando formularios`, type: 'LISTENING' },
                { name: `${totalMembers} pessoas 👀`, type: 'WATCHING' },
                { name: `REC-PCERJ`, type: 'LISTENING' }
            ];

            const { name, type } = activities[i++ % activities.length];
            this.client.user.setActivity(name, { type });
        }, 15000);

        this.client.user.setStatus("online");
        console.log("\x1b[34m[BOT]\x1b[0m Iniciado com sucesso!"); // Azul
        console.log("\x1b[34m[BOT]\x1b[0m 🔥 Estou online!"); // Azul

        // Configurar a verificação periódica (por exemplo, a cada hora)
        setInterval(() => verificarNomesDosServidores(this.client), 3600000); // 3600000 ms = 1 hora
    };
};
