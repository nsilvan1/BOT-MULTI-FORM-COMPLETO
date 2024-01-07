class Command {
    constructor(client, options) {
        this.client = client
        this.name = options.name
        this.description = options.description
        this.options = options.options
        // console.log(this.name , `\x1b[32mcarregado\x1b[0m`);    
    }
}

module.exports = Command