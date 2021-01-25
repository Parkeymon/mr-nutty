const config = require('./config.json');
const { Client, MessageEmbed } = require('discord.js');
const client = new Client({ partials: ['MESSAGE', 'REACTION']});
client.login(config.BotToken)

client.on('ready', () => {
    console.log('Bot online...')
});

client.on('messageReactionAdd', async (reaction, user) => {
    const handleStarboard = async () => {
        const starboard = client.channels.cache.get(config.starboardID);
        const msgs = await starboard.messages.fetch({ limit: 100 });
        console.log('Fetched messages in starboard channel.');
        const existingMsg = msgs.find(msg =>{
            if(msg.embeds.length === 1) {
                return msg.embeds[0].footer.text.startsWith(reaction.message.id) ? true : false;
            } return false;
        });
        if(existingMsg) {
            existingMsg.edit(`${reaction.count} - ⭐`);
        } else {
            const embed1 = new MessageEmbed()
            .setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL())
            .setTitle('Jump')
            .setURL(reaction.message.url)
            .setDescription(reaction.message.content)
            .setFooter(reaction.message.id + ' - ' + new Date(reaction.message.createdTimestamp));
            

        if(starboard) {
            starboard.send(embed1)
          }
        }
    }
    if(reaction.emoji.name === '⭐') {
        if(reaction.message.channel === client.channels.cache.get(config.starboardID)) return;

        if(reaction.message.partial) {
            await reaction.fetch();
            await reaction.message.fetch();
             handleStarboard();

        } else {
            console.log('bonk')
            handleStarboard();
        } 
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    const handleStarboard = async() => {
        const starboard = client.channels.cache.get(config.starboardID);
        const msgs = await starboard.messages.fetch({ limit: 100 });
        const existingMsg = msgs.find(msg =>{
            if(msg.embeds.length === 1) {
                return msg.embeds[0].footer.text.startsWith(reaction.message.id) ? true : false;
            } return false;
        });
        if(existingMsg) {
            if(reaction.count === 0){
                existingMsg.delete({ timeout: 2500 });
            } else existingMsg.edit(`${reaction.count} - ⭐`);
        };
    }
    if(reaction.emoji.name === '⭐') {
        if(reaction.message.channel === client.channels.cache.get(config.starboardID)) return;
        if(reaction.message.partial) {
            await reaction.fetch()
            await reaction.message.fetch();
             handleStarboard();

        } else {
            console.log('bonk')
            handleStarboard();
        } 
    }
  });