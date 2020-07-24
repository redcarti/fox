const { FoxDispatcher, FoxError, FoxCommand } = require('../index')

const fd = new FoxDispatcher()

test('add new command', async () => {
    fd.add({
        base: 'test',
        execute: (msg, args) => {
            console.log('Test command is used!')
        }
    })
});
test('run "test" command', async () => {
    fd.parseuse('', 'test')
});
test('run unknown command', async () => {
    fd.parseuse('', 'hello')
    fd.on('cmd/404', (msg, cmd) => {
        expect(cmd).toBe('hello')
    })
});
test('run turned off command', async () => {
    fd.turn('test')
    fd.parseuse('', 'test')
    fd.on('cmd/off', (msg, cmd) => {
        expect(cmd).toBe('test')
    })
});