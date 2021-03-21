const { FoxDispatcher, FoxError, FoxCommand } = require('../index')

const fd = new FoxDispatcher()

const messageObject = {}

test('add new command', async () => {
    fd.add({
        base: 'test',
        execute: (msg, args) => {
            console.log('Test command is used!')
        }
    })
});

test('add simple command', async () => {
    fd.addSimple('simple', 'simple description', (msg, args) => {
        console.log('there is a simple command!')
    })
});

test('run "test" command', async () => {
    fd.parseuse(messageObject, 'test')
});

test('run simple command', async () => {
    fd.parseuse(messageObject, 'simple')
});

test('run unknown command', async () => {
    let unknownCommand = 'hello'

    fd.parseuse(messageObject, unknownCommand)
    .catch(err => {
        if (err.name === 'FoxError') {
            expect(err.message.command).toBe(unknownCommand)
            expect(err.message.code).toBe('404')
        }
    })
});

test('run turned off command', async () => {
    let offCommand = 'test'

    fd.turn(offCommand)
    
    fd.parseuse(messageObject, offCommand)
    .catch(err => {
        if (err.name === 'FoxError') {
            expect(err.message.command).toBe(offCommand)
            expect(err.message.code).toBe('off')
        }
    })
});