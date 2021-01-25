module.exports = {
    name: 'ping',
    execute(message){
        let date1 = Date.now();
        message.channel.send(`Pong! \`${Date.now() - date1}ms\``)
    }
}