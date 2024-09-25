// CIRCINI Bot
// created by @neartsua on Discord.

require('dotenv').config();
const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path')

const client = new Client({
    intents: [
    ]
})

// system file
const pathToSystem = path.join(__dirname, 'system.json')

// vars
var memberLimit = 41;
var cooldown = false;

// utility commands list
utilities = ['resetsys', 'register', 'list', 'add', 'delete', 'proxy', 'color', 'avatar', 'help']

// Functions

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

// REGISTER COMMANDS FUNCTION - BE CAREFUL HERE!!!
function register(interaction_message) {
    const commands = [
        {
            name: `resetsys`,
            description: `Clears the system and re-initializes it. (WARNING: THIS WILL DELETE ALL EXISTING INFO)`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: 'name',
                    description: '(WARNING: THIS WILL DELETE ALL EXISTING INFO) Name your new system.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: `delete`,
            description: `Deletes a system member.`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: 'name',
                    description: 'Who to remove?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: `register`,
            description: `Registers all proxies as commands.`,
            integration_types: [0, 1],
            contexts: [1, 2],
        },
        {
            name: `list`,
            description: `Shows all system members and proxies.`,
            integration_types: [0, 1],
            contexts: [1, 2],
        },
        {
            name: `help`,
            description: `Shows help and setup info.`,
            integration_types: [0, 1],
            contexts: [1, 2],
        },
        {
            name: `proxy`,
            description: `Change someone's proxy.`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: 'name',
                    description: 'Who to edit?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'proxy',
                    description: 'What is their new proxy? (MUST BE LOWER CASE)',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: `color`,
            description: `Change someone's color.`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: 'name',
                    description: 'Who to edit?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'color',
                    description: `What is their new color? (MUST BE HEX CODE - #XXXXXX)`,
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: `avatar`,
            description: `Change someone's avatar`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: 'name',
                    description: 'Who to edit?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'avatar',
                    description: 'Avatar URL or emoji?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: `add`,
            description: `Add someone to the system file.`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: 'name',
                    description: 'Who to add?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'avatar',
                    description: 'Avatar URL or emoji?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'proxy',
                    description: 'What is their proxy? (MUST BE LOWER CASE)',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'color',
                    description: `Enter a hex color (optional)`,
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        }
    ];

    let string = fs.readFileSync(pathToSystem, 'utf-8');
    let system = JSON.parse(string);
    let members = system.members;

    for (const property in members) {
        let member = members[property]
        let command = {
            name: `${member.proxy}`,
            description: `Send a message as ${member.name}`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: 'input',
                    description: 'message',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        }
        commands.push(command);
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            console.log('Registering commands...')
            await interaction_message.deferReply();
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            )
            console.log('Commands registered!')
            interaction_message.editReply({ content: `Commands registered!`, ephemeral: true })
        } catch (error) {
            console.log(error);
            await interaction.deferReply();
            interaction_message.editReply({ content: `There was a problem. Do you have any duplicate proxies? (Check with /list.)`, ephemeral: true })
        }
    })();

    cooldown = true

    setTimeout(() => {
        cooldown = false
    }, 5000)
}

// on functions

client.on('ready', (c) => {
    console.log(`${c.user.tag} is ready!`)
});

// ---------- Slash commands

client.on('interactionCreate', async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    // utility commands

    // if the command is a utility command, execute; else, filter through proxies
    const include = utilities.includes(interaction.commandName)
    if (include === true) {
        if (interaction.commandName === 'help') {
            let help = new EmbedBuilder()
                .setTitle('Help')
                .setDescription(`Hello!\n
                This is a bot that allows proxied messages to be sent in DMs through embeds, custom emojis, and slash commands.\n
                It has to be self-hosted, meaning YOU have to host it yourself, and assume the responsibility for doing so.\n
                For more information, see the Github: https://github.com/northperseids/circini.\n
                The current member limit is ${memberLimit}. **The ABSOLUTE MAX as the code is written is 41 members.** (This is a discord limitation. Click 'limitations' to learn more.)\n
                Click the buttons below for more information.\n
                *This won't be a regularly-updated project, but if you have any issues, you can contact me through Discord at @neartsua.*\n
                Thank you, and have fun!`)
                .setColor('#FFFFFF')

            let setup = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle('Setup')
                .setDescription(`Hello!\n
            **Initialize system:** First things first, run '/resetsys' to reset and initialize your system profile.
            **Add members:** Run '/add' to add your first member. (See below for details.)
            **Register commands:** Use the /register command to actually set up the commands after adding members. (You may need to refresh the page.)
            **Use proxies:** You should now be able to run your proxy commands by typing "/[proxy]" and inputting your message!\n
            **Formats:**
            Circini has two formats - embeds or condensed messages. Giving an avatar URL will result in the embed format, while giving a custom emoji will result in the condensed format.
            The bot *HAS* to be in the server the emojis are from, and the emoji *HAS* to be in the format <:EMOJI_NAME:EMOJI_ID> in order to work, *including* the "<>" characters. (If you don't know the full emoji ID, go to the server that has the emoji and type in "\:EMOJI_NAME:" - Discord will automatically send you the properly-formatted name and ID).

            **Member management:**
            /add - adds a member
            /delete - deletes a member
            /proxy - changes a member's proxy
            /color - changes a member's color
            /avatar - changes a member's avatar
            /list - lists all members along with avatars, proxies, and colors\n`)

            let limitations = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle('Limitations')
                .setDescription(`Hello!\n
            **Member limit:** This is a HARD MAX of 41 members (unless you change code). The reason for this is because Discord only allows 50 global commands, and 9 of those are taken up by utility functions like '/add' or '/color'.\n
            If you know enough Javascript, you can probably change this in the code by stripping out utility functions, but then you'll have to manually edit the system.json file in order to edit your system depending on what commands you've removed.`)

            let buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('help')
                        .setLabel('Help')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('setup')
                        .setLabel('Setup')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('limitations')
                        .setLabel('Limitations')
                        .setStyle(ButtonStyle.Primary)
                )

            let response = await interaction.reply({
                embeds: [help],
                components: [buttons],
                ephemeral: true
            })

            const collector1 = response.createMessageComponentCollector({ time: 300000 })
            collector1.on('collect', async listen1 => {
                if (listen1.customId === 'help') {
                    await listen1.deferUpdate();
                    await listen1.editReply({ embeds: [help], components: [buttons], ephemeral: true })
                }
                if (listen1.customId === 'setup') {
                    await listen1.deferUpdate();
                    await listen1.editReply({ embeds: [setup], components: [buttons], ephemeral: true })
                }
                if (listen1.customId === 'limitations') {
                    await listen1.deferUpdate();
                    await listen1.editReply({ embeds: [limitations], components: [buttons], ephemeral: true })
                }
            })
        }

        if (interaction.commandName === 'avatar') {
            let name = interaction.options.get('name').value;
            let url = interaction.options.get('avatar').value;

            let file = fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, "");
            let system = JSON.parse(file);
            let members = system.members;

            for (const property in members) {
                let member = members[property]
                if (member.name === name) {
                    let newObj = {};
                    newObj.name = name;
                    newObj.avatar = url;
                    newObj.proxy = member.proxy;
                    newObj.color = member.color;
                    let oldString = JSON.stringify(member)
                    let objString = JSON.stringify(newObj)
                    let newString = file.replace(oldString, objString)
                    fs.writeFileSync(pathToSystem, newString, 'utf-8')
                    interaction.reply({ content: `${name}'s avatar has been changed!`, ephemeral: true })
                }
            }

        }

        if (interaction.commandName === 'resetsys') {
            let name = interaction.options.get('name').value;
            let obj = {};
            obj.name = name;
            obj.members = {};
            fs.writeFileSync(pathToSystem, JSON.stringify(obj));
            interaction.reply({ content: `System reset and ${name} created!`, ephemeral: true })
        }

        if (interaction.commandName === 'register') {
            // cooldown has a 5-second timer requiring at least 5 seconds between registering commands
            if (cooldown === false) {
                register(interaction);
            } else {
                interaction.reply({ content: `Error! Please wait a few seconds between registering commands. Try again in a moment.`, ephemeral: true })
            }
        }

        if (interaction.commandName === 'list') {
            let system = JSON.parse(fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, ''))
            let sysname = system.name;
            let members = system.members;
            let arr = [];
            for (const property in members) {
                let name = members[property].name;
                let proxy = members[property].proxy;
                let avatar = members[property].avatar;
                let color = members[property].color;
                arr.push(`Name: ${name}\nProxy: /${proxy}\nAvatar: ${avatar}\nColor: ${color}`)
            }
            if (arr.length > 0) {
                let embed = new EmbedBuilder()
                    .setTitle(sysname)
                    .setDescription(arr.join('\n\n'))
                    .setColor('#FFFFFF')

                interaction.reply({ embeds: [embed], ephemeral: true })
            } else {
                let embed = new EmbedBuilder()
                    .setTitle(sysname)
                    .setDescription(`No system members. Add some with /add.`)
                    .setColor('#FFFFFF')

                interaction.reply({ embeds: [embed], ephemeral: true })
            }


        }

        if (interaction.commandName === 'add') {
            let name = interaction.options.get('name').value;
            let url = interaction.options.get('avatar').value;
            let proxyString = interaction.options.get('proxy').value;
            let proxy = proxyString.toLowerCase();
            var color;
            try {
                color = interaction.options.get('color').value;
            } catch {
                color = '#FFFFFF';
            }

            let uid = Date.now().toString(36) + Math.random().toString(36).substring(2);

            let system = JSON.parse(fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, ""))

            let length = Object.keys(system['members']).length;

            if (length >= memberLimit) {
                interaction.reply({ content: `Your system is currently at ${length} members. The limit is ${memberLimit}. (You can delete a member with '/delete'.)`, ephemeral: true })
            } else {
                let newMember = {};
                newMember.name = name;
                newMember.avatar = url;
                newMember.proxy = proxy;
                newMember.color = color;

                system['members'][`${uid}`] = newMember;

                let newString = JSON.stringify(system)
                fs.writeFileSync(pathToSystem, newString)
                interaction.reply({ content: `${name} added to system ${system.name}! (Be sure to register your proxy commands with the /register command! You may have to refresh the page after registering as well.)`, ephemeral: true })

            }
        }

        if (interaction.commandName === 'delete') {
            let name = interaction.options.get('name').value;

            let file = fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, "");
            let system = JSON.parse(file);
            let members = system.members;

            for (const property in members) {
                let selected = members[property].name
                if (selected === name) {
                    let toBeDeleted = getKeyByValue(members, members[property])
                    delete members[toBeDeleted];
                    let newString = JSON.stringify(system)
                    fs.writeFileSync(pathToSystem, newString)
                    interaction.reply({ content: `${selected} deleted. Remember to remove their proxy command with the /register command. You may have to refresh the page after registering as well.`, ephemeral: true })
                }
            }
        }

        if (interaction.commandName === 'proxy') {
            let name = interaction.options.get('name').value;
            let newProxy = interaction.options.get('proxy').value;
            let system = fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, "");
            let sysObj = JSON.parse(system)
            let members = sysObj.members;
            for (const property in members) {
                let member = members[property]
                if (member.name === name) {
                    let newObj = {};
                    newObj.name = name;
                    newObj.avatar = member.avatar;
                    newObj.proxy = newProxy;
                    newObj.color = member.color;
                    let oldString = JSON.stringify(member)
                    let objString = JSON.stringify(newObj)
                    let newString = system.replace(oldString, objString)
                    fs.writeFileSync(pathToSystem, newString, 'utf-8')
                    interaction.reply({ content: `${name}'s proxy has been changed! Be sure to register the new proxy with the /register command! You may have to refresh the page after registering as well.`, ephemeral: true })
                }
            }
        }

        if (interaction.commandName === 'color') {
            let name = interaction.options.get('name').value;
            let newColor = interaction.options.get('color').value;
            let system = fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, "");
            let sysObj = JSON.parse(system)
            let members = sysObj.members;
            for (const property in members) {
                let member = members[property]
                if (member.name === name) {
                    let newObj = {};
                    newObj.name = name;
                    newObj.avatar = member.avatar;
                    newObj.proxy = member.proxy;
                    newObj.color = newColor;
                    let oldString = JSON.stringify(member)
                    let objString = JSON.stringify(newObj)
                    let newString = system.replace(oldString, objString)
                    fs.writeFileSync(pathToSystem, newString, 'utf-8')
                    interaction.reply({ content: `${name}'s color has been changed!`, ephemeral: true })
                }
            }

        }
    } else {
        // individual proxy command handling
        let system = JSON.parse(fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, ""))
        let members = system.members;

        for (const property in members) {
            let member = members[property]
            let name = member.name;
            let avatar = member.avatar;
            let proxy = member.proxy;
            let color = member.color;

            // if command matches any proxy
            if (interaction.commandName === proxy) {
                // annoying defer thingy because bot keeps timing out
                await interaction.deferReply();
                // get user message
                let echo = interaction.options.get('input').value;

                if (avatar.startsWith('<')) { // if avatar is a custom emoji, send condensed format
                    let testmessage = `${avatar}  **${name}**\n         ` + echo;
                    await interaction.editReply(testmessage)

                } else { // if avatar is *not* custom emoji, send embed format
                    let embed = new EmbedBuilder()
                        .setColor(color)
                        .setDescription(echo)
                        .setAuthor({ name: name, iconURL: avatar })
                    await interaction.editReply({ embeds: [embed] })
                }
            }
        }
    }
})

client.login(process.env.TOKEN);
