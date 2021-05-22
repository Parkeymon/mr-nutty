const config = require('./config.json');
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION']});
const fs = require('fs');
const prefix = config.BotPrefix;
client.commands = new Discord.Collection();
client.login(config.BotToken)

client.on('ready', () => {
    console.log('Bot online...')
});

//Grab commands
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

//Command handler.
client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().trim().toLowerCase();

    try{
    const handler = client.commands.get(command);
    if(handler) handler.execute(message, args, Discord, client, prefix);
    }
    catch(error){
        console.error(error);
        message.channel.send('An error occurred.')
    }
});

//Star Board
client.on('messageReactionAdd', async (reaction, user) => {

    const handleStarboard = async () => {
        const starboard = client.channels.cache.get(config.starboardID);
        const msgs = await starboard.messages.fetch({ limit: 100 });
        console.log('Fetched messages in starboard channel.');
        const existingMsg = msgs.find(msg =>{
            if(msg.embeds.length === 1 && msg.embeds[0].footer) {
                return msg.embeds[0].footer.text.startsWith(reaction.message.id);
            } return false;
        });
        if(existingMsg) {
            const messageAttachment = reaction.message.attachments.size > 0 ? reaction.message.attachments.array()[0].url : null

            const embed1 = new MessageEmbed()
            .setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL())
            .setDescription(`<#${reaction.message.channel.id}> — [Jump](${reaction.message.url})`)
            .setFooter(reaction.message.id + ' • ' + new Date(reaction.message.createdTimestamp).toLocaleDateString() + ' • ' + `⭐ ${reaction.count} Stars` );
            if(reaction.message.embeds.MessageEmbedVideo){
                embed1.addFields({name: '__Message__', value: `${reaction.message.attachments.url}`})
            } else {
                embed1.addFields({name: '__Message__', value: `${reaction.message.content}`})
            }
            if (messageAttachment) embed1.setImage(messageAttachment)


                existingMsg.edit(embed1);
        } else {
            const messageAttachment = reaction.message.attachments.size > 0 ? reaction.message.attachments.array()[0].url : null

            const embed1 = new MessageEmbed()
            .setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL())
            .setDescription(`<#${reaction.message.channel.id}> — [Jump](${reaction.message.url})`)
            .setFooter(reaction.message.id + ' • ' + new Date(reaction.message.createdTimestamp).toLocaleDateString() + ' • ' + `⭐ ${reaction.count} Stars`);
            //Pretty sure the video checker doesnt work.
            if(reaction.message.embeds.MessageEmbedVideo){
                console.log('Sent embed with video attached.')
                embed1.addFields({name: '__Message__', value: `${reaction.message.attachments.url}`})
            } else {
                embed1.addFields({name: '__Message__', value: `${reaction.message.content}`})
            }
            if(messageAttachment) embed1.setImage(messageAttachment)
            console.log('embedded');

        if(starboard) {
            if(reaction.count >= config.starsNeeded){
                starboard.send(embed1);
            }
          }
        }
    }
    if(reaction.emoji.name === '⭐') {
        if(reaction.message.channel === client.channels.cache.get(config.starboardID)) return;

        if(reaction.message.partial) {
            console.log('Message is a partial, fetching...');
            await reaction.fetch();
            await reaction.message.fetch();
            await handleStarboard();

        } else {
            await handleStarboard();
        } 
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    const handleStarboard = async() => {
        const starboard = client.channels.cache.get(config.starboardID);
        const msgs = await starboard.messages.fetch({ limit: 100 });
        const existingMsg = msgs.find(msg =>{
            if(msg.embeds.length === 1 && msg.embeds[0].footer) {
                return msg.embeds[0].footer.text.startsWith(reaction.message.id);
            } return false;
        });
        if(existingMsg) {
            if(reaction.count < config.starsNeeded){
                existingMsg.delete({ timeout: 2500 });
            } else {
                const embed1 = new MessageEmbed()
                .setAuthor(reaction.message.author.tag, reaction.message.author.displayAvatarURL())
                .setDescription(`<#${reaction.message.channel.id}> — [Jump](${reaction.message.url})`)
                .addFields({name: '__Message__', value: `${reaction.message.content}`})
                .setFooter(reaction.message.id + ' • ' + new Date(reaction.message.createdTimestamp).toLocaleDateString() + ' • ' + `⭐ ${reaction.count} Stars` );

                existingMsg.edit(embed1);
            }
            
        }
    }
    if(reaction.emoji.name === '⭐') {
        if(reaction.message.channel === client.channels.cache.get(config.starboardID)) return;
        if(reaction.message.partial) {
            await reaction.fetch()
            await reaction.message.fetch();
             await handleStarboard();

        } else {
            console.log('bonk')
            await handleStarboard();
        } 
    }
  });