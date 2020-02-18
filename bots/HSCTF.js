// Modules
var Discord, dotenv, request;
// Default image
const NOLOGO = "https://pbs.twimg.com/profile_images/2189766987/ctftime-logo-avatar_400x400.png";

const ctftime = () => {
    // CTFTime.org API
    const API = `https://ctftime.org/api/v1/events/?limit=4`;
    // Promise the result
    return new Promise((resolve, reject) => {
        request(API, (error, response, body) => {
            if(error || response.statusCode !== 200) { reject(error); }
            else { resolve(JSON.parse(body)); }
        });
    });
};

const show = (channel,ctfs,current) => {
    let oneAtLeast = false;
    // Iterate over CTFs
    for(ctf of ctfs) {
        // Only check online CTFs
        if(ctf.location == '') {
            // Check if is a valid CTF
            if(current && (new Date(ctf.start) > Date.now() || new Date(ctf.finish) < Date.now()))
                continue;
            // Format the start date
            let start_raw = ctf.start.split('T')[0].split('-');
            let starttime = `${start_raw[2]}/${start_raw[1]}/${start_raw[0]}`;
            // Build the duration string
            let duracion = ctf.duration.days > 0 ? `${ctf.duration.days} dia` : '';
            if(ctf.duration.days > 1) duracion += 's';
            if(ctf.duration.hours > 1)
                duracion += duracion.length > 0 ? 
                    ` y ${ctf.duration.hours} horas` : `${ctf.duration.hours} horas`;
            // Make the card
            const card = new Discord.RichEmbed()
                .setColor('#' + Math.floor(Math.random()*16777215).toString(16))
                .setTitle(ctf.title)
                .setURL(ctf.url)
                .setThumbnail(ctf.logo === '' ? NOLOGO : ctf.logo)
                .setDescription(ctf.description)
                .addField('Tipo', ctf.format, true)
                .addField('Empieza', starttime)
                .addField('Duración', duracion, true);
            // Send the CTFs
            oneAtLeast = true;
            channel.send(card); 
        }
    }
    // No CTFs message
    if(!oneAtLeast) { channel.send("```No existen CTFs Online en este momento...```"); }
};

// Get CTFs async to sync wrapper
const get_ctfs = async (channel,current) => await ctftime()
        .then((ctfs) => show(channel,ctfs,current))
        .catch((_) => { throw Error("Error in requests") });

const help = (channel) => {
    // Helper text
    let helper = '```\n';
    helper += '>ctfs               Muestra los CTFs más próximos al día de hoy\n';
    helper += '>ctfs actuales      Muestra las competiciones activas en este momento';
    helper += '\n```';
    channel.send(helper);
}

const config_bot = () => {
    // Create a new Discord client
    const client = new Discord.Client();
    // Ready event
    client.on('ready', () => console.log(`[?] Logging in as ${client.user.tag}!`));
    // Commands
    client.on('message', (message) => {
        // Prevents non command messages and bot bouncing
        if(!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;
        // Upper and lowercase commands
        let command = message.content.toLowerCase().split(' ');
        // Get the CTFs
        if(command[0].startsWith(`${process.env.PREFIX}ctf`)) {
            let currents = command.length > 1 && command[1].startsWith(`actual`);
            get_ctfs(message.channel,currents);
        }
        // Help command
        else if(command[0].startsWith(`${process.env.PREFIX}help`) || command[0].startsWith(`${process.env.PREFIX}ayuda`))
            help(message.channel);
    });
    return client;
};

const main = () => {
    // Configuration
    check_dependencies();
    dotenv.config();
    // Start the client
    const client = config_bot();
    try { client.login(process.env.DISCORDTOKEN_CTF); }
    catch(_) { throw Error("Cannot log in Discord"); }
};

const check_dependencies = () => {
    // Check for dependencies to be installed
    try {
        Discord = require('discord.js');
        dotenv = require('dotenv');
        request = require('request');
    } catch(_) { throw Error("Dependencies are not installed"); }
};

const entrypoint = () => {
    // Catch all the exceptions
    try { main(); }
    catch(error) { console.error(`[!] ${error}`); }
}; entrypoint();

/* Some good stuff:
    - Heavely inspired by:
        https://github.com/NullPxl/NullCTF
    - Maybe I should implement a "remove command" method based on this:
        https://medium.com/discordbot/create-a-clear-command-for-your-discord-js-bot-4cc4547ca3b
*/