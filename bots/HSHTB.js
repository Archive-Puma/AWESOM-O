// Modules
var Discord, dotenv, request;

const do_request = (API) => new Promise((resolve, reject) => {
    request(API, (error, response, body) => {
        if(error || response.statusCode !== 200) { reject(error); }
        else { resolve(JSON.parse(body)); }
    });
});

const API = (url) => `https://www.hackthebox.eu/api${url}?api_token=${process.env.HACKTHEBOXTOKEN}`;

const htb = (channel,id) => do_request(API('/machines/get/all'))
    .then((machines) => {
        let response = undefined;
        if(id == 0) show(channel,machines,false);
        else {
            for(m of machines)
                if(m.id == id)
                    show(channel,m,true);
        }
    }).catch((e) => {
        console.log(e);
        channel.send('```La API de HackTheBox no está actualmente disponible```')
    });

const show = (channel,machine,one) => {
    if(machine.length == 0)
        channel.send('```La API de HackTheBox no ha devuelto correctamente la información requerida```');
    else if(one) {
        // Calculate dates in Spanish format
        let release_split = machine.release.split('-');
        let release = `${release_split[2]}/${release_split[1]}/${release_split[0]}`;
        // Make the card
        const card = new Discord.RichEmbed()
            .setColor('#' + Math.floor(Math.random()*16777215).toString(16))
            .setTitle(machine.name)
            .setThumbnail(machine.avatar_thumb)
            .addField('OS', machine.os,true)
            .addField('IP', machine.ip, true)
            .addField('Estado actual', machine.retired ? 'Retirada' : 'Activa', true)
            .addField('Fecha de salida', release, true)
        if(machine.retired_date) {
            let retired_split = machine.retired_date.split('-');
            let retired = `${retired_split[2]}/${retired_split[1]}/${retired_split[0]}`;
            card.addField('Fecha de retirada', retired, true);
        }
        channel.send(card);
    } else {
        // Make a list of active machines
        let active = '```Máquinas activas:\n\n';
        for(m of machine)
            if(!m.retired)
                active += `[${m.id}] ${m.name}\n`;
        active += `\nEscribe ${process.env.PREFIX}htb <id> para obtener información sobre una máquina en concreto.`;
        active += '```';
        // Send the list of active machines
        channel.send(active);
    }
};

const help = (channel) => {
    // Helper text
    let helper = '```\n';
    helper += '>htb                Muestra todas las máquinas activas en HTB\n';
    helper += '>htb <id>           Muestra información sobre una máquina en HTB\n';
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
        // Get all th machines
        if(command[0].startsWith(`${process.env.PREFIX}htb`))
            htb(message.channel, command[1] === undefined || command[1].length === 0 ? 0 : command[1]);
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
    try { client.login(process.env.DISCORDTOKEN_HTB); }
    catch(_) { throw Error('Cannot log in Discord'); }
};

const check_dependencies = () => {
    // Check for dependencies to be installed
    try {
        Discord = require('discord.js');
        dotenv = require('dotenv');
        request = require('request');
    } catch(_) { throw Error('Dependencies are not installed'); }
};

const entrypoint = () => {
    // Catch all the exceptions
    try { main(); }
    catch(error) { console.error(`[!] ${error}`); }
}; entrypoint();

/* Some good stuff:
    - Heavely inspired by:
        https://github.com/kulinacs/htb/blob/master/htb/__init__.py
*/