const Event = require('../../structures/Event')

module.exports = class extends Event {
    constructor(client) {
        super(client, {
            name: 'reconnecting'
        })
    }

    run = async () => {
        console.log("Queda de conexão..Reconectando!");

        
    }
}