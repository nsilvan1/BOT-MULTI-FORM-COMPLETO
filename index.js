const Client = require('./src/structures/Client')
const config = require('./config.json')
const process = require('process');

const client = new Client({ intents: 14335, partials: [ 'CHANNEL', 'USER', 'MESSAGE' ] });


process.on('unhandledRejection', reason => {
    console.log('\n');
    console.log(reason);
});

process.on('uncaughtException', (err, origin) => {
    console.log('Erro: ');
    console.log(err);
    console.log('Origem do erro: ');
    console.log(origin);
});

client.login(config.TOKEN)

module.exports = client 