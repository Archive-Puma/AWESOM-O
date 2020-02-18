config_bot = () => {
    Discord = require("discord.js");
    const client = new Discord.Client();
    // Events
    client.on('ready', () => console.log(`[?] Logging in as ${client.user.tag}!`));

    return client;
}

main = () => {
    // Configuration
    check_dependencies();
    require("../dotenv").config();
    // Start the client
    const client = config_bot();
    try { client.login(process.env.DISCORD_TOKEN); }
    catch(_) { throw Error("Cannot log in Discord"); }
}

check_dependencies = () => {
    try { require('../discord.js'); require('../dotenv'); }
    catch(_) { throw Error("Dependencies are not installed"); }
}

entrypoint = () => {
    try { main(); }
    catch(error) { console.error(`[!] ${error}`); }
}; entrypoint();
