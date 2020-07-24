const { FoxBetaDispatcher } = require('../src/Beta')

const fd = new FoxBetaDispatcher()

test('add beta cmd', async () => {
    fd.add({
        base: 'test',                                       // cmd base
        usage: [{                                           // usage
            key: '<string>',                                // key
            type: ['string'],                               // it's type
        }],
        parse(msg, args, i) {                               // executed when usage throwed error
            console.log('usage: test <string>')            // main usage
            console.log('@: ' + i + ', val: ' + args[i])    // at which arg position is caused
        },
        execute(msg, args) {                                // executed when parsed
            console.log(args)
        }
    })
})
test('type !== string', async () => {
    fd.parseuse('', 'test 123')
})
test('type === string', async () => {
    fd.parseuse('', 'test hello')
})
test('add multiple types cmd', async () => {
    fd.add({
        base: 'testMultiple',                                       
        usage: [{                                           
            key: '<string|number>',                                
            type: ['string', 'number'],                               
        }],
        parse(msg, args, i) {                               
            console.log('usage: test <string|number>')            
            console.log('@: ' + i + ', val: ' + args[i])    
        },
        execute(msg, args) {                                
            console.log(args)
        }
    })
})
test('type !== string', async () => {
    fd.parseuse('', 'testMultiple 123')
})
test('type === string', async () => {
    fd.parseuse('', 'testMultiple hello')
})