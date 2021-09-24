const Discord = require("discord.js")
const client = new Discord.Client()
const whitelist = require("./whitelist.json")

client.login("token") //input your token here


client.on("guildMemberAdd", member => {
    if(member.user.bot) {
        const res = whitelist.whitelist.find(member.user.id)[0]
        if(res === "") {
            member.ban().catch(err => {
                member.guild.owner.send("You did not set me up properly, please give my role the permissions 'ADMINISTRATOR'")
            })
        }
    }
})

client.on("guildMemberRemove", async member => {
    if(member.user.bot) return //This will make sure it wont ban itself
    const Logging = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_BAN_ADD'
    });

    const banlog = Logging.entries.first()
    if(!banlog) return
    const { executor, target } = banlog
    if(executor.id === member.guild.owner.id) return
    const embed = new Discord.MessageEmbed()
    .setAuthor("Salpine bot logs")
    .setDescription(`<@${executor.id}> has banned ${target.tag}.`)
    .setThumbnail(target.displayAvatarURL)
    member.guild.channels.cache.get("bot-logs").send(embed)
}) 
client.on("guildCreate", guild => {
    guild.channels.create("bot-logs", {
        "permissionOverwrites": [
            {
                id: guild.roles.everyone,
                deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
            }
        ]
    })
});

client.on("message", message => {
    if(message.mentions.users.length > 4) {
        message.delete()
        message.reply("Don't mass mention people!")
        const embed = new Discord.MessageEmbed()
        .setAuthor("Salpine bot logs")
        .setDescription(message.author.tag + " tried to mass mention. ```" + message.content + "```")
        .setThumbnail(message.member.user.displayAvatarURL())
        message.guild.channels.cache.get("bot-logs").send(embed)
    }
    if(message.content.length > 10) {
        if(message.author.bot) return
        if(message.content === message.content.toUpperCase()) {
            message.delete()
            message.reply("Please do not use that much caps!")
            const embed = new Discord.MessageEmbed()
            .setAuthor("Salpine bot logs")
            .setDescription(message.author.tag + " sent a message in all caps." + "```" + message.content + "```")
            .setThumbnail(message.author.displayAvatarURL())
        }
    }
    if(message.content.includes("https://") || message.content.includes("http://")) {
        if(message.author.bot) return
        if(message.channel.name.includes("media")) return
        message.delete()
        message.reply("Please don't send any links.")
        const embed = new Discord.MessageEmbed()
        .setAuthor("Salpine bot logs")
        .setDescription(message.author.tag + " tried to send a link in <#" + message.channel.id + "> ```" + message.content + "```")
    }
})

