var Discord, dotenv, request;
const NOLOGO = "https://pbs.twimg.com/profile_images/2189766987/ctftime-logo-avatar_400x400.png";

const ctftime = (start) => {
    const API = `https://ctftime.org/api/v1/events/?limit=5&start=${start}`;
    return new Promise((resolve, reject) => {
        request(API, (error, response, body) => {
            if(error || response.statusCode !== 200) { reject(error); }
            else { resolve(JSON.parse(body)); }
        });
    });
};

const show = (channel,ctfs,current) => {
    let oneAtLeast = false;
    for(ctf of ctfs) {
        if(ctf.location == '') {
            if(current && (new Date(ctf.start) > Date.now() || new Date(ctf.finish) < Date.now()))
                continue;
            
            let duracion = `${ctf.duration.days} dia`;
            if(ctf.duration.days > 1) duracion += 's';
            if(ctf.duration.hours > 1) duracion += ` y ${ctf.duration.hours} horas`;

            const card = new Discord.RichEmbed()
                .setColor('#' + Math.floor(Math.random()*16777215).toString(16))
                .setTitle(ctf.title)
                .setURL(ctf.url)
                .setThumbnail(ctf.logo === '' ? NOLOGO : ctf.logo)
                .setDescription(ctf.description)
                .addField('Tipo', ctf.format, true)
                .addField('Duración', duracion, true);

            oneAtLeast = true;
            channel.send(card); 
        }
    }

    if(!oneAtLeast) { channel.send("No existen CTFs Online en este momento..."); }
};

const get_ctfs = async (channel,current) => await ctftime(Date.now())
        .then((ctfs) => show(channel,ctfs,current))
        .catch((_) => { throw Error("Error in requests") });

const help = (channel) => {
    let helper = '```\n';
    helper += '>ctfs               Muestra los CTFs más próximos al día de hoy\n';
    helper += '>ctfs actuales      Muestra las competiciones activas en este momento';
    helper += '\n```';
    channel.send(helper);
}

const config_bot = () => {
    const client = new Discord.Client();
    // Ready event
    client.on('ready', () => console.log(`[?] Logging in as ${client.user.tag}!`));
    // Commands
    client.on('message', (message) => {
        // Prevents non command messages and bot bouncing
        if(!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;
        // Upper and lowercase commands
        let command = message.content.toLowerCase().split(' ');
        // Current CTFs
        if(command[0].startsWith(`${process.env.PREFIX}ctf`)) {
            let currents = command.length > 1 && command[1].startsWith(`actual`);
            get_ctfs(message.channel,currents);
        }
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
    try {
        Discord = require('discord.js');
        dotenv = require('dotenv');
        request = require('request');
    } catch(_) { throw Error("Dependencies are not installed"); }
};

const entrypoint = () => {
    try { main(); }
    catch(error) { console.error(`[!] ${error}`); }
}; entrypoint();