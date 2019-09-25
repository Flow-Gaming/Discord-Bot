var Discord = require('discord.js');
var bot = new Discord.Client();
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var passwords = require('./passwords.json');
var packageInfo = require('./package.json');
const prefix = '.f';

//==================== Server Setup ====================
//Docker Port 4650 - 4659
var server = app.listen(4650, function () {
   console.log("Discord Bot Server listening on port "+ server.address().port)

   bot.login(passwords.discordToken);

   bot.on('ready', () => {
   	console.log('Flow Bot Online');
   	bot.user.setActivity(prefix + 'help');
   });
})

app.set('view engine', 'pug');
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log("Request from " + sanitizeString(req.cookies.id));
  res.send("This is the Flow Gaming Discord Bot Server.");
});


bot.on('message', message => {
	if (message.author === bot.user)
		return;

	if (message.content.startsWith(prefix + 'website')) {
		console.log(message.author.username + ' : website : ' + message.createdAt);
		message.channel.send('https://www.flowgaming.org');
	} else if (message.content.startsWith(prefix + 'invite')) {
		console.log(message.author.username + ' : invite : ' + message.createdAt);
		message.channel.send('https://discord.gg/DV8J9tC');
	} else if (message.content.startsWith(prefix + 'help')) {
		console.log(message.author.username + ' : help : ' + message.createdAt);
		message.channel.send(
			'```\n' +
			'invite: Gives and invite to the server\n' +
		  'ping: pong\n' +
			'website: Gives a link to the website\n' +
			'```');
	}
});


//=========================== Functions =============================
function sanitizeString(unsanitaryString) {
  if (unsanitaryString == null)
    return '';

  return unsanitaryString.replace(/[^\w\s_.:!@#-]/, "");
}
