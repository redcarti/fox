const { Collection } = require('discord.js')
const { FoxError, FoxDispatcher } = require('./Fox')

class ParserError extends Error {
    constructor(value, index, type) {
        super()
        this.name = 'ParserError'
        this.value = value
        this.index = index 
        this.type = type
    }
}

class FoxParser {
    constructor() {
        this.types = new Collection()
        this.addStd()
    }

    addStd() {
        this.types.set('string', (val) => { return typeof val === 'string' || val instanceof String })
        this.types.set('number', (val) => { return !isNan(val) || typeof val === 'number' || val instanceof Number })
    }

    find(type) {
        return this.types.find((_v, key) => {
            return type === key
        })
    }

    use(typeName, val) {
        let type = this.find(typeName)
        return type(val)
    }

    parse(args, usage) {
        let parsed = []
        if(Array.isArray(usage)) {
            usage.forEach((val, i) => {
                let argVal = args[i]
                val.type.forEach((type, ti) => {
                    let res = this.use(type, argVal)
                    if (!res) { 
                        throw new ParserError(argVal, i, type)
                    }
                })
            })
        }
    }
}

class FoxBetaDispatcher extends FoxDispatcher {
    constructor() {
        super()
        this.parser = new FoxParser()
    }

    async use (msg, command, args) {
        if (command === '') return
        const cmd = await this.find(command)
        
        if (cmd) if (!cmd.off) { 
            try {
                let parsed = await this.parser.parse(args, cmd.usage)
                await cmd.execute(msg, args)
            } catch (e) {
                if (e.name === 'ParserError') await cmd.parse(msg, args, e.index)
                else throw e
            }
            await this.emit('use', msg, command, args) 
        } else await this.emit('cmd/off', msg, command)
        else await this.emit('cmd/404', msg, command)
    }

    async parse (commandToParse) {
        const args = commandToParse.split(/ +/)
        args.forEach((val, i) => {
            if (Number(val)) args[i] = Number(val)
            else return
        })
        const command = args.shift().toLowerCase()
        return [command, args]
    }
}

module.exports = {
    FoxBetaDispatcher
}