// CIRCINI Bot
// created by @neartsua on Discord.

require('dotenv').config();
const { Client, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommandOptionType, REST, Routes, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path')

const client = new Client({
    intents: [
    ]
})

// system file
const pathToSystem = path.join(__dirname, 'system.json')

// values
const quickproxyLimit = 43;
const memberLimit = 2000;
const pagination = 20;
const utilities = ['help', 'setup', 'list', 'add', 'edit', 'proxy', 'register']
var cooldown = false;

// REGISTER COMMANDS FUNCTION - BE CAREFUL HERE!!!
function register(interaction_message) {
    const commands = [
        {
            name: `setup`,
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
            name: `list`,
            description: `Shows all system members and proxies.`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: `system`,
                    description: `List all members in a system. (Paginated in chunks of 20.)`,
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: `member`,
                    description: `List properties for a specific member.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: `name`,
                            description: `Who to view?`,
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                }
            ]
        },
        {
            name: `help`,
            description: `Shows help and setup info.`,
            integration_types: [0, 1],
            contexts: [1, 2],
        },
        {
            name: `proxy`,
            description: `Send a proxied message.`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: 'proxy',
                    description: 'Member proxy?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'message',
                    description: 'Message?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'edit',
            description: `Edit or delete a member.`,
            integration_types: [0, 1],
            contexts: [1, 2],
            options: [
                {
                    name: `name`,
                    description: `Change a member's name.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Member to edit?',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'newname',
                            description: 'New name?',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: `color`,
                    description: `Change a member's color.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Member to edit?',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'color',
                            description: 'New color?',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: `proxy`,
                    description: `Change a member's proxy.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Member to edit?',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'proxy',
                            description: 'New proxy? (Case insensitive - "A" and "a" are treated the same)',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: `avatar`,
                    description: `Change a member's avatar.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Member to edit?',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        },
                        {
                            name: 'avatar',
                            description: 'New avatar? (URL or Emoji ID)',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: `quickproxy`,
                    description: `Enable or disable quick-proxy for a member.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Member to enable/disable quickproxying?',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
                },
                {
                    name: `delete`,
                    description: `Remove a member's listing.`,
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            description: 'Member to remove?',
                            type: ApplicationCommandOptionType.String,
                            required: true
                        }
                    ]
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
                    description: 'Avatar URL or emoji ID?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'proxy',
                    description: 'What is their proxy? (Case insensitive - "A" and "a" are treated the same)',
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
        },
        {
            name: `register`,
            description: `Register quick-proxy commands.`,
            integration_types: [0, 1],
            contexts: [1, 2]
        }
    ];

    let string = fs.readFileSync(pathToSystem, 'utf-8');
    let system = JSON.parse(string);
    let members = system.members;

    var counter = 0;

    for (const property in members) {
        let member = members[property]
        let qp = member.quickproxy;

        if (qp === true) {
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
            counter += 1;
            if (counter > quickproxyLimit) {
                break;
            }
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    (async () => {
        try {
            await interaction_message.deferReply();
            console.log('Registering commands...')
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands }
            )
            console.log('Commands registered!')
            if (counter <= quickproxyLimit) {
                interaction_message.editReply(`Commands registered! (${counter}/${quickproxyLimit} quick-proxy slots used.)`)
            } else {
                interaction_message.editReply(`Commands registered, but unable to register all quick-proxy commands. Please disable at least ${counter - quickproxyLimit} quick-proxy member(s).`)
            }
        } catch (error) {
            await interaction_message.deferReply();
            console.log(error);
            interaction_message.editReply('Error! (Do you have any duplicate quick-proxy-enabled commands? Check with "/list".)')
        }
    })();

    cooldown = true

    setTimeout(() => {
        cooldown = false
    }, 5000)
}

client.on('ready', (c) => {
    console.log(`${c.user.tag} is ready!`)
});

client.on('interactionCreate', async (interaction) => {

    if (!interaction.isChatInputCommand()) return;

    const include = utilities.includes(interaction.commandName)
    if (include === true) {
        if (interaction.commandName === 'help') {
            let help = new EmbedBuilder()
                .setTitle('About Circini')
                .setDescription(`Circini is a bot that allows "proxied" messages to be sent in DMs through embeds, custom emojis, and slash commands.\n
                There is a ${memberLimit}-member limit. (Large member lists may be a performance issue.)\n
                ***Commands List:***
                /help - help and setup information
                /setup - set up or reset a system profile
                /list - view System or Member listings
                /add - add a system member to the system profile
                /edit - edit a member's properties
                /register - register quick-proxies
                /proxy - send a message as a system member\n
                Click the "setup" button to get started.\n
                *This won't be a regularly-updated project, but if you have any issues, you can contact me through Discord at @neartsua.*
                *For more information, see the Github: https://github.com/northperseids/circini*`)
                .setColor('#FFFFFF')

            let setup = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle('Setup')
                .setDescription(`**Initialize system:** First things first, run '/setup' to create your system profile.\n
            **Add members:** Run '/add' to add your first member. Follow the on-screen prompts.\n
            **Use proxies:** You should now be able to run your proxy command by typing "/proxy", entering the member's proxy, and entering your message!

            *Advanced Setup*
            Circini has a few other features, like "condensed" versus "embed" formats, and a "quick-proxy" setting. See "Advanced" below for more details.`)

            let advsetup = new EmbedBuilder()
                .setColor('#FFFFFF')
                .setTitle('Advanced Setup')
                .setDescription(`**Condensed or Embed Formats**
            Circini can use emojis as member icons. Circini automatically defaults to Embed formats when a *URL* is given in the Avatar field, or Condensed when an *EMOJI ID* is given.
            To use the Condensed format, you'll need to go to the https://discord.com/developers/applications page, click on your bot, find the "Emojis" tab, and upload your emoji.
            Once uploaded, you can change the name if you want. Then, hover your mouse over it and click the copy icon to the far right, which will copy the emoji ID to your clipboard.
            Paste the emoji directly into the "Avatar" field when adding or editing a member.
            
            **Quick-Proxy**
            Circini has a "quick-proxy" setting. ***This can only be enabled for ${quickproxyLimit} members at a time.*** This is a Discord limitation of how slash commands work.
            Quick-Proxy will create a unique slash command for EACH MEMBER with quick-proxy enabled.
            To enable, run "/quickproxy" and enter a member's name.
            After enabling, run "/register". ***You have to register commands before you can use the quick-proxy option!***
            You should now be able to type "/[member-proxy]" to quickly proxy as that system member. (If you do not see the quick-proxy command, try refreshing the page or restarting Discord.)`)

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
                        .setCustomId('advanced')
                        .setLabel('Advanced')
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
                if (listen1.customId === 'advanced') {
                    await listen1.deferUpdate();
                    await listen1.editReply({ embeds: [advsetup], components: [buttons], ephemeral: true })
                }
            })
        }

        if (interaction.commandName === 'setup') {
            let name = interaction.options.get('name').value;
            let obj = {};
            obj.name = name;
            obj.members = {};
            fs.writeFileSync(pathToSystem, JSON.stringify(obj));
            interaction.reply({ content: `System reset and ${name} created!`, ephemeral: true })
        }

        if (interaction.commandName === 'list') {

            await interaction.deferReply();

            if (interaction.options.getSubcommand() === 'system') {
                let system = JSON.parse(fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, ''))
                let sysname = system.name;
                let members = system.members;

                if (Object.entries(members).length > 0) {

                    let parentArr = [];
                    var counter = 0;

                    let array = Object.entries(members)
                    let chunkSize = pagination;
                    let pages = Math.ceil(array.length / chunkSize);

                    for (i = 0; i < Math.min(array.length, memberLimit); i += chunkSize) {
                        let chunk = array.slice(i, i + chunkSize);
                        let arr = [];
                        chunk.forEach((e) => { e.shift() })
                        for (j = 0; j < chunk.length; j++) {
                            let entry = chunk[j][0]
                            let subString = `**${entry.name}** (proxy "${entry.proxy}")\n`
                            arr.push(subString)
                        }
                        parentArr.push(arr)
                    }

                    let embedArr = [];
                    let select = new StringSelectMenuBuilder().setCustomId('pagination').setPlaceholder(`Select Page`)
                    var currentPage = 0;

                    for (i = 0; i < parentArr.length; i++) {
                        let embed = new EmbedBuilder()
                            .setTitle(sysname)
                            .setDescription(parentArr[i].join(''))
                            .setColor('#FFFFFF')
                            .setFooter({ text: `Page 1/${pages}` })
                        embedArr.push(embed)
                    }

                    for (i = 0; i < parentArr.length; i++) {
                        select.addOptions(
                            new StringSelectMenuOptionBuilder().setLabel(`Page ${i + 1}`).setValue(`${i + 1}`)
                        )
                    }

                    let firstbuttons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev')
                                .setLabel('<<')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('>>')
                                .setStyle(ButtonStyle.Primary)
                        )
                    let dropdown = new ActionRowBuilder().addComponents(select);

                    let middlebuttons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev')
                                .setLabel('<<')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('>>')
                                .setStyle(ButtonStyle.Primary)
                        )

                    let lastbuttons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('prev')
                                .setLabel('<<')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('>>')
                                .setStyle(ButtonStyle.Secondary)
                                .setDisabled(true)
                        )

                    var response;

                    if (pages > 1) {
                        response = await interaction.editReply({
                            embeds: [embedArr[0]],
                            components: [firstbuttons, dropdown],
                            ephemeral: true
                        })
                    } else {
                        response = await interaction.editReply({
                            embeds: [embedArr[0]],
                            ephemeral: true
                        })
                    }

                    const collector1 = response.createMessageComponentCollector({ time: 300000 })
                    collector1.on('collect', async listen1 => {

                        if (listen1.customId === 'prev') {
                            await listen1.deferUpdate();
                            currentPage -= 1;
                            let embed = embedArr[currentPage];
                            embed.setFooter({ text: `Page ${currentPage + 1}/${pages}` })
                            let buttons;
                            if (currentPage === 0) {
                                buttons = firstbuttons;
                            } else {
                                buttons = middlebuttons;
                            }
                            await listen1.editReply({ embeds: [embed], components: [buttons, dropdown], ephemeral: true })
                        }

                        if (listen1.customId === 'next') {
                            await listen1.deferUpdate();
                            currentPage += 1;
                            let embed = embedArr[currentPage];
                            embed.setFooter({ text: `Page ${currentPage + 1}/${pages}` })
                            let buttons;
                            if (currentPage === pages - 1) {
                                buttons = lastbuttons;
                            } else {
                                buttons = middlebuttons;
                            }
                            await listen1.editReply({ embeds: [embed], components: [buttons, dropdown], ephemeral: true })
                        }

                        if (listen1.customId === 'pagination') {
                            await listen1.deferUpdate();
                            currentPage = listen1.values[0] - 1;
                            let embed = embedArr[currentPage];
                            embed.setFooter({ text: `Page ${currentPage + 1}/${pages}` })
                            let buttons;
                            if (currentPage === pages - 1) {
                                buttons = lastbuttons;
                            } else if (currentPage === 0) {
                                buttons = firstbuttons;
                            } else {
                                buttons = middlebuttons;
                            }
                            await listen1.editReply({ embeds: [embed], components: [buttons, dropdown], ephemeral: true })
                        }
                    })

                } else {
                    let embed = new EmbedBuilder()
                        .setTitle(sysname)
                        .setDescription(`No system members. Add some with /add.`)
                        .setColor('#FFFFFF')

                    interaction.editReply({ embeds: [embed], ephemeral: true })
                }
            }
            if (interaction.options.getSubcommand() === 'member') {

                let name = interaction.options.get('name').value
                let system = fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, "");
                let sysObj = JSON.parse(system)
                let members = sysObj.members;

                var sent = false;

                for (const property in members) {
                    let member = members[property]
                    if (member.name === name) {
                        let qp;
                        if (member.quickproxy === true) {
                            qp = `Enabled`
                        } else {
                            qp = `Disabled`
                        }
                        let embed = new EmbedBuilder()
                            .setTitle(`Member *${name}* of system *${sysObj.name}*`)
                            .setDescription(` `)
                            .addFields(
                                { name: 'Avatar', value: `${member.avatar}` },
                                { name: 'Proxy', value: `${member.proxy}` },
                                { name: 'Color', value: `${member.color}` },
                                { name: 'Quick-proxy', value: `${qp}` },
                            )
                            .setColor('White')
                        interaction.editReply({ embeds: [embed], ephemeral: true })
                        sent = true;
                        return;
                    }
                }

                if (sent === false) {
                    interaction.editReply({ content: `There is no member with name "${name}" listed.`, ephemeral: true })
                }
            }

        }

        if (interaction.commandName === 'add') {
            await interaction.deferReply()

            let name = interaction.options.get('name').value;
            let proxyString = interaction.options.get('proxy').value;
            let proxy = proxyString.toLowerCase();

            let system = fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, "");
            let sysObj = JSON.parse(system)
            let members = sysObj.members;

            for (const property in members) {
                let member = members[property]
                if (member.name === name) {
                    interaction.editReply({ content: `Cannot add member: There is already a member with name "${name}".`, ephemeral: true })
                    return;
                }
                if (member.proxy === proxy) {
                    interaction.editReply({ content: `Cannot add member: There is already a member (${member.name}) with proxy "${proxy}".`, ephemeral: true })
                    return;
                }
            }

            let av = interaction.options.get('avatar').value;
            var avatar;
            if (av.startsWith('<')) {
                avatar = av;
            } else {
                try {
                    avatar = new URL(`${av}`)
                } catch {
                    interaction.editReply({ content: `Cannot add member: Invalid URL entered.`, ephemeral: true })
                    return;
                }
            }

            var color;
            try {
                color = interaction.options.get('color').value;
            } catch {
                color = '#FFFFFF';
            }

            let uid = Date.now().toString(36) + Math.random().toString(36).substring(2);

            let newMember = {};
            newMember.name = name;
            newMember.avatar = av;
            newMember.proxy = proxy;
            newMember.quickproxy = false;
            newMember.color = color;

            sysObj['members'][`${uid}`] = newMember;

            let newString = JSON.stringify(sysObj)
            fs.writeFileSync(pathToSystem, newString)
            interaction.editReply({ content: `${name} added to system ${sysObj.name}!`, ephemeral: true })
        }

        if (interaction.commandName === 'edit') {

            await interaction.deferReply();

            let system = fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, "");
            let sysObj = JSON.parse(system)
            let members = sysObj.members;

            if (Object.entries(members).length > 0) {
                if (interaction.options.getSubcommand() === 'color') {
                    let name = interaction.options.get('name').value;
                    let newColor = interaction.options.get('color').value;
                    for (const property in members) {
                        let member = members[property]
                        if (member.name === name) {
                            let newObj = {};
                            newObj.name = name;
                            newObj.avatar = member.avatar;
                            newObj.proxy = member.proxy;
                            newObj.color = newColor;
                            newObj.quickproxy = member.quickproxy;
                            let oldString = JSON.stringify(member)
                            let objString = JSON.stringify(newObj)
                            let newString = system.replace(oldString, objString)
                            fs.writeFileSync(pathToSystem, newString, 'utf-8')
                            interaction.editReply({ content: `${name}'s color has been changed!`, ephemeral: true })
                        }
                    }
                } else if (interaction.options.getSubcommand() === 'name') {

                    let name = interaction.options.get('name').value;
                    let newName = interaction.options.get('newname').value;

                    for (const property in members) {
                        let member = members[property]
                        if (member.name === newName) {
                            interaction.editReply({ content: `There is already a member with name "${newName}".`, ephemeral: true })
                            return;
                        }
                    }

                    for (const property in members) {
                        let member = members[property]
                        if (member.name === name) {
                            let newObj = {};
                            newObj.name = newName;
                            newObj.avatar = member.avatar;
                            newObj.proxy = member.proxy;
                            newObj.color = member.color;
                            newObj.quickproxy = member.quickproxy;
                            let oldString = JSON.stringify(member)
                            let objString = JSON.stringify(newObj)
                            let newString = system.replace(oldString, objString)
                            fs.writeFileSync(pathToSystem, newString, 'utf-8')
                            interaction.editReply({ content: `${name}'s name has been changed to ${newName}!`, ephemeral: true })
                        }
                    }
                } else if (interaction.options.getSubcommand() === 'proxy') {

                    let name = interaction.options.get('name').value;
                    let newProxy = interaction.options.get('proxy').value;

                    for (const property in members) {
                        let member = members[property]
                        if (member.proxy === newProxy) {
                            interaction.editReply({ content: `There is already a member (${member.name}) with proxy "${newProxy}".`, ephemeral: true })
                            return;
                        }
                    }

                    for (const property in members) {
                        let member = members[property]
                        if (member.name === name) {
                            let newObj = {};
                            newObj.name = name;
                            newObj.avatar = member.avatar;
                            newObj.proxy = newProxy;
                            newObj.color = member.color;
                            newObj.quickproxy = member.quickproxy;
                            let oldString = JSON.stringify(member)
                            let objString = JSON.stringify(newObj)
                            let newString = system.replace(oldString, objString)
                            fs.writeFileSync(pathToSystem, newString, 'utf-8')
                            interaction.editReply({ content: `${name}'s proxy has been changed to ${newProxy}!`, ephemeral: true })
                        }
                    }
                } else if (interaction.options.getSubcommand() === 'avatar') {
                    let name = interaction.options.get('name').value;
                    let av = interaction.options.get('avatar').value;

                    for (const property in members) {
                        let member = members[property]
                        if (member.name === name) {
                            let newObj = {};
                            newObj.name = name;
                            newObj.avatar = av;
                            newObj.proxy = member.proxy;
                            newObj.color = member.color;
                            newObj.quickproxy = member.quickproxy;
                            let oldString = JSON.stringify(member)
                            let objString = JSON.stringify(newObj)
                            let newString = system.replace(oldString, objString)
                            fs.writeFileSync(pathToSystem, newString, 'utf-8')
                            interaction.editReply({ content: `${name}'s avatar has been changed!`, ephemeral: true })
                        }
                    }
                } else if (interaction.options.getSubcommand() === 'quickproxy') {
                    let name = interaction.options.get('name').value;

                    var counter = 0;

                    for (const property in members) {
                        let member = members[property]
                        let qps = member.quickproxy;
                        if (qps === true) {
                            counter += 1;
                            if (counter > quickproxyLimit) {
                                overLimit = true;
                                break;
                            }
                        }
                    }

                    for (const property in members) {
                        let member = members[property]
                        if (member.name === name) {
                            let qp = member.quickproxy;
                            let newObj = {};
                            newObj.name = name;
                            newObj.avatar = member.avatar;
                            newObj.proxy = member.proxy;
                            newObj.color = member.color;
                            newObj.quickproxy = !qp;
                            let oldString = JSON.stringify(member)
                            let objString = JSON.stringify(newObj)
                            let newString = system.replace(oldString, objString)
                            fs.writeFileSync(pathToSystem, newString, 'utf-8')
                            if (newObj.quickproxy === true) {
                                interaction.editReply({ content: `Quickproxy has been enabled for ${name}! You have ${quickproxyLimit - counter - 1} quick-proxy slots left.`, ephemeral: true })
                            } else {
                                interaction.editReply({ content: `Quickproxy has been disabled for ${name}! You have ${quickproxyLimit - counter + 1} quick-proxy slots left.`, ephemeral: true })
                            }
                        }
                    }

                } else if (interaction.options.getSubcommand() === 'delete') {

                    let name = interaction.options.get('name').value;

                    for (const property in members) {
                        let selected = members[property].name
                        if (selected === name) {
                            let toBeDeleted = Object.keys(members).find(key => members[key] === members[property]);
                            console.log(toBeDeleted)
                            delete members[toBeDeleted];
                            let newString = JSON.stringify(sysObj)
                            fs.writeFileSync(pathToSystem, newString)
                            interaction.editReply({ content: `${selected} deleted.`, ephemeral: true })
                            return;
                        }
                    }

                }
            } else {
                interaction.editReply({ content: `No system members found. Add some with /add.`, ephemeral: true })
            }
        }

        if (interaction.commandName === 'proxy') {

            await interaction.deferReply();

            let system = fs.readFileSync(pathToSystem, 'utf-8').replace(/\s*/g, "");
            let sysObj = JSON.parse(system)
            let members = sysObj.members;

            if (Object.entries(members).length > 0) {
                let proxy = interaction.options.get('proxy').value.toLowerCase();

                for (const property in members) {
                    let member = members[property]

                    let name = member.name;
                    let avatar = member.avatar;
                    let mproxy = member.proxy;
                    let color = member.color;

                    if (proxy === mproxy) {
                        let echo = interaction.options.get('message').value;

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
            } else {
                interaction.editReply({ content: `No system members found. Add some with /add.`, ephemeral: true })
            }

        }

        if (interaction.commandName === 'register') {
            if (cooldown === false) {
                register(interaction);
            } else {
                interaction.reply({ content: `Error! Please wait a few seconds between registering commands. Try again in a moment.`, ephemeral: true })
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
