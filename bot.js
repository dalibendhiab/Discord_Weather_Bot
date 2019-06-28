const Discord = require('discord.js');
const fetch = require("node-fetch");
require('dotenv').config();

class Bot {

    constructor() {
        this._client = new Discord.Client();
        this._user = this._client.user;
        this._guilds = this._client.guilds;

        this._client.login(process.env.SECRET_TOKEN);
        //To check if the bot is connected and, if it is, what server he uses
        this._client.on('ready', () => {
            console.log("Connected as " + this._user.tag);
            console.log("Servers:");
            this._guilds.forEach((guild) => {
                console.log(" - " + guild.name);
                guild.channels.forEach((channel) => {
                    console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`)
                })
            });
        });

        //To check if a message is send
        this._client.on('message', (receivedMessage) => {
            if (receivedMessage.author === this._user) {
                return;
            }
            if (receivedMessage.content.startsWith("!") || receivedMessage.content.startsWith("?")) {
                this._processCommand(receivedMessage);
            }
        });
    }

    stop() {
        this._client.user.setStatus('idle');
        this._client.destroy();
    }

    //To call the API and return the data (response) in JSON format
    async _getWeather(city) {
        let response = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city},fr&APPID=${process.env.SECRET_OWM_API_KEY}&units=metric`);
        return await response.json();
    }

    //To parse the response and display weather information thanks to the data retrieved with the API
    _processCommand(receivedMessage) {
        let fullCommand = receivedMessage.content.substr(1); // Remove the leading exclamation mark
        let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
        let primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
        let args = splitCommand.slice(1); // All other words are args/parameters/options for the command
        let windSpeed;

        if (primaryCommand.toLowerCase() ===  'help') {
            receivedMessage.channel.send("To use the Weather bot, you just have to enter : !weather [City].\n\n" +
              "(Example : !weather Lille)");
        }
        if (primaryCommand.toLowerCase() ===  'weather') {
            if (!args[0]) {
                receivedMessage.channel.send("Too few args.\n\nUsage : !weather [City]\n\n(Example : !weather Lille)");
            }
            else if (args[1]) {
                receivedMessage.channel.send("Too many args.\n\nUsage : !weather [City]\n\n(Example : !weather Lille)");
            }
            else {
                this._getWeather(args[0])
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

}

const bot = new Bot();

//To put the bot in 'idle' state when we interrupt the signal with a SIGINT
process.on('SIGINT', function() {
    console.log("\nCaught interrupt signal.");
    bot.stop();
});
