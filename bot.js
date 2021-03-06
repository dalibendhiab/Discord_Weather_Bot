const Discord = require('discord.js');
const client = new Discord.Client();
const fetch = require("node-fetch");
require('dotenv').config();

//To put the bot in 'idle' state when we interrupt the signal with a SIGINT

process.on('SIGINT', function() {
    console.log("\nCaught interrupt signal.");
    client.user.setStatus('idle');
    client.destroy();
});

//To check if the bot is connected and, if it is, what server he uses

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
    console.log("Servers:");
    client.guilds.forEach((guild) => {
        console.log(" - " + guild.name);
        guild.channels.forEach((channel) => {
            console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
        })
    });
});

//To check if a message is send

client.on('message', (receivedMessage) => {
    if (receivedMessage.author === client.user) {
        return;
    }
    if (receivedMessage.content.startsWith("!") || receivedMessage.content.startsWith("?")) {
        processCommand(receivedMessage);
    }
});

//To call the API and return the data (response) in JSON format

async function getWeather(url)
{
    let response = await fetch(url);
    return await response.json();
}

//To parse the response and display weather information thanks to the data retrieved with the API

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1); // Remove the leading exclamation mark
    let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1); // All other words are arguments/parameters/options for the command
    let windSpeed;

    if (primaryCommand.toLowerCase() ===  'help') {
        receivedMessage.channel.send("To use the Weather bot, you just have to enter : !weather [City].\n\n" +
            "(Example : !weather Lille)");
    }
    if (primaryCommand.toLowerCase() ===  'weather') {
        if (!arguments[0]) {
            receivedMessage.channel.send("Too few arguments.\n\nUsage : !weather [City]\n\n(Example : !weather Lille)");
        }
        else if (arguments[1]) {
            receivedMessage.channel.send("Too many arguments.\n\nUsage : !weather [City]\n\n(Example : !weather Lille)");
        }
        else {
            getWeather(`http://api.openweathermap.org/data/2.5/weather?q=${arguments[0]},fr&APPID=${process.env.SECRET_OWM_API_KEY}&units=metric`)
                .then(data => {
                    windSpeed = data.wind.speed * 3.6;
                    receivedMessage.channel.send(
                        `The temperature at ${arguments[0]} is actually at : ${data.main.temp} °C.\n\n ` +
                             `The higher temperature will be at : ${data.main.temp_max} °C.\n\n ` +
                             `The lower temperature will be at : ${data.main.temp_min} °C.\n\n ` +
                             `There is a ${data.weather[0].description}.\n\n` +
                             `The humidity percentage is at : ${data.main.humidity} %.\n\n ` +
                             `The wind blows at : ${windSpeed} km/h.`
                    )
                })
                .catch(error => {
                    receivedMessage.channel.send(`An error occurred, please verify the name of the city.`);
                });
        }
    }
}

client.login(process.env.SECRET_TOKEN);