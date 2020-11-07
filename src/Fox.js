const { Collection, Message } = require('discord.js')
const { EventEmitter } = require('events')

class FoxError extends Error {
  constructor (message) {
    super(message)
    this.name = 'FoxError'
    this.message = message
  }
}

class FoxDispatcher extends EventEmitter {
  /**
   * FoxDispatcher is commands dispatcher
   * @extends EventEmitter
   * @class
   * @constructor
   * @public
   * @version 0.1.2-beta.1
   * @since modularium/0.1.15.2
   */
  constructor () {
    super()
    this._commands = new Collection()
  }

  /**
   * Add a command to dispatcher
   * @param {FoxCommand} cmd Command object
   * @public
   */
  async add (cmd) {
    const command = new FoxCommand(cmd)
    if (FoxCommand.isOld(cmd)) throw new FoxError(command.base.xb16 + ' is old-typed command. Please, rename [name, description, args] -> [base, info, usage]\nOr, you could use FoxCommand.rebase()')
    await this._commands.set(command.base, command)
  }

  /**
   * Remove a command using it's base
   * @param {string} command Command base
   * @public
   */
  async remove (command) {
    const cmd = await this.find(command)

    await this._commands.delete(cmd)
  }

  /**
   * Find a command using it's base
   * @param {string} command Command base
   * @returns {FoxCommand} Command
   * @public
   */
  async find (command) {
    const cmd = await this._commands.find(cmd => {
      if (cmd.aliases) return cmd.base === command || cmd.aliases.find(o => o === command) || cmd.aliases.includes(command)
      return cmd.base === command
    })

    return cmd
  }

  /**
   * Use a command
   * @param {Message} msg Message
   * @param {string} command Command base
   * @param {Array} args Command's arguments
   * @public
   */
  async use (msg, command, args) {
    if (command === '') return
    const cmd = await this.find(command)
    if (cmd) if (!cmd.off) { await cmd.execute(msg, args); await this.emit('use', msg, command, args) } else await this.emit('cmd/off', msg, command)
    else await this.emit('cmd/404', msg, command)
  }

  /**
   * Parse & use a command
   * @param {Message} msg Message
   * @param {string} commandToParse Command to parse
   * @public
   */
  async parseuse (msg, commandToParse) {
    const parsed = await this.parse(commandToParse)
    await this.use(msg, ...parsed)
  }

  /**
   * Parse a command
   * @param {string} commandToParse Command to parse
   * @returns {[command, args]} Command base, it's arguments
   * @public
   */
  async parse (commandToParse) {
    const args = commandToParse.split(/ +/)
    const command = args.shift().toLowerCase()
    return [command, args]
  }

  /**
   * Turn on/off a command, using it's base
   * @param {string} command Command base
   * @param {boolean} [userBool On/Off?
   * @public
   */
  async turn (command, userBool) {
    const cmd = await this.find(command)

    cmd.off = !cmd.off || userBool
  }
}

class FoxCommand {
  constructor ({ base, info, emoji, usage, off, execute, parse }) {
    if (!base || !execute) throw new FoxError('No base or execute()')

    this.base = base
    this.info = info
    this.emoji = emoji
    this.usage = usage
    this.off = off
    this.execute = execute
    this.parse = parse
  }

  static isOld (cmd) {
    if (cmd.name || cmd.description || cmd.args) return true
    else return false
  }

  /**
   * Rebase old type command to new type
   * @param {{ name:string, description:string, args:Array<string> }} cmd Command object
   * @returns {{ base:string, info:string, usage:Array<string> }} rebasedCmd
   */
  static rebase (cmd) {
    const rebasedCmd = {}

    Object.entries(cmd).forEach(([key, val]) => {
      if (key === 'name') rebasedCmd.base = val
      else if (key === 'description') rebasedCmd.info = val
      else if (key === 'args') rebasedCmd.usage = val
      else rebasedCmd[key] = val
    })

    return rebasedCmd
  }
}

module.exports = {
  FoxDispatcher,
  FoxCommand,
  FoxError
}
