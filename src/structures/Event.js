class Event {
    constructor(client, options) {
        this.client = client
        this.name = options.name
        // console.log(this.name)
    }
}

module.exports = Event