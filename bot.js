var Discord = require('discord.js');
var bot = new Discord.Client();
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var passwords = require('./passwords.json');
var packageInfo = require('./package.json');
var request = require('request').defaults({jar: true});
const prefix = 'f.';
var serverCookie = request.jar();

//==================== Server Setup ====================
//Docker Port 4650 - 4659
var server = app.listen(4650, function () {
   console.log("Discord Bot Server listening on port "+ server.address().port);

   bot.login(passwords.discordToken);

   bot.on('ready', () => {
   	bot.user.setActivity(prefix + 'help');

    bot.guilds.forEach((guild) => {
      if (guild.name == "Flow Gaming") {
        serverCookie.setCookie('id=' + passwords.serverIdToken, 'https://api2.flowgaming.org/graphql');
        guild.channels.find(channel => channel.id == '580837355359961124').send('Flow Bot Online');
        console.log('Flow Bot Online');
      }
    });
   });
})

app.set('view engine', 'pug');
app.use(cookieParser());

app.get('/', (req, res) => {
  console.log("Request from " + sanitizeString(req.cookies.id));
  res.send("This is the Flow Gaming Discord Bot Server on build " + packageInfo.version);
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
    } else if (message.content.startsWith(prefix + 'setrank')) {
      if (message.mentions.members.array().length < 1) {
        message.channel.send('You must mention 1 person to set their rank');
        return;
      }
      else if (message.mentions.members.array().length > 1) {
        message.channel.send('You can only mention 1 person at a time');
        return;
      }

      if (message.mentions.roles.array().length < 1) {
        message.channel.send('You must mention 1 role to set their rank to');
        return;
      }
      else if (message.mentions.roles.array().length > 1) {
        message.channel.send('A person can only have 1 rank at a time');
        return;
      }

      if (message.mentions.members.array()[0] == null || message.mentions.members.array()[0].id == null) {
        message.channel.send('Invalid Member');
        return;
      }

      if (message.mentions.roles.array()[0] == null || message.mentions.roles.array()[0].id == null) {
        message.channel.send('Invalid Role');
        return;
      }
      changeWebsiteRank(
        message.author.id,
        message.mentions.members.array()[0].id,
        convertRankIDtoNum(message.mentions.roles.array()[0].id)
      ).then((websiteStatus) => {
        if (websiteStatus) {
          changeDiscordRank(
            message.guild,
            message.mentions.members.array()[0],
            message.mentions.roles.array()[0].id
          ).then((discordStatus) => {
            if (discordStatus) {
              message.channel.send('<@' + message.author.id + '> updated the rank of <@' + message.mentions.members.array()[0].id + '> to <@' + message.mentions.roles.array()[0].id + '>');
            } else {
              message.channel.send('Failed via discord');
            }
          });
        } else {
          message.channel.send('Failed via website');
        }
      });
    }
});


//=========================== Functions =============================

function changeWebsiteRank(requestID, editID, newRank) {
  return new Promise((resolve, reject) => {
    request.post({
      url: 'https://api2.flowgaming.org/graphql',
      form: {
        query: `
        {
          request: getUser(search:discordId, id:"`+requestID+`") {
            username
            uniqueid
          },
          edit: getUser(search:discordId, id:"`+editID+`") {
            username
            uniqueid
          }
        }`
      },
      jar: serverCookie
    }, function(error, response, body) {
      responseObject = JSON.parse(body);
      if (responseObject.error) {
        console.log(responseObject.error);
        reject(false);
      } else {
        var personalCookie = request.jar();
        personalCookie.setCookie('id=' + responseObject.data.request.uniqueid, 'https://api2.flowgaming.org/graphql');
        request.post({
          url: 'https://api2.flowgaming.org/graphql',
          form: {
            query: `
            mutation {
               editUser(uniqueid:"`+responseObject.data.edit.uniqueid+`", field:rank, data:"`+newRank+`")
            }`
          },
          jar: personalCookie
        }, function(error, response, body) {
          responseObject = JSON.parse(body);
          if (responseObject.error) {
            console.log(responseObject.error);
            resolve(false);
          } else {
            if (responseObject.data == null) {
              console.log('data = null');
              reject(false);
            } else {
              if (responseObject.data.editUser == null) {
                console.log('editUser = null');
                reject(false);
              } else {
                if (responseObject.data.editUser == true) {
                  resolve(true);
                } else {
                  console.log('editUser failed but didn\'t report the error');
                  resolve(false);
                }
              }
            }
          }
        });
      }
    });
  });
}

function changeDiscordRank(guild, editUser, newRank) {
  return new Promise((resolve, reject) => {
    console.log(guild.name);
    guild.fetchMember(editUser).then((guildMember) => {
      guildMember.removeRoles([
        guild.roles.find(role => role.id == RankID.Newbie),
        guild.roles.find(role => role.id == RankID.Regular),
        guild.roles.find(role => role.id == RankID.Veteran),
        guild.roles.find(role => role.id == RankID.Moderator),
        guild.roles.find(role => role.id == RankID.Developer),
        guild.roles.find(role => role.id == RankID.Admin)
      ]).then((guildMember) => {
        guildMember.addRole(guild.roles.find(role => role.id == newRank));
        resolve (true);
      });
    });
  });
}

function sanitizeString(unsanitaryString) {
  if (unsanitaryString == null)
    return '';

  return unsanitaryString.replace(/[^\w\s_.:!@#-]/, "");
}

function convertRankIDtoNum(rankID) {
  switch (rankID) {
    case RankID.Newbie:
      return 1;
    case RankID.Regular:
      return 2;
    case RankID.Veteran:
      return 3;
    case RankID.Moderator:
      return 4;
    case RankID.Developer:
      return 5;
    case RankID.Admin:
      return 6;
    default:
      return 0;
  }
}

const RankID = {
  Newbie: '618284984305975306',
  Regular: '352602895776088064',
  Veteran: '352602848128663553',
  Moderator: '352602806336749590',
  Developer: '615062673775919116',
  Admin: '352602773537161219'
}
