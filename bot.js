var Discord = require('discord.js');
var bot = new Discord.Client();
var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
var passwords = require('./passwords.json');
var packageInfo = require('./package.json');
var request = require('request').defaults({jar: true});
var serverCookie = request.jar();
const prefix = 'f.';
const apiUrl = 'https://api2.flowgaming.org/graphql';
const breakroom = {
  id: '633511635763593236'
}


const RankID = {
  Guest: '352601559458250762',
  Newbie: '618284984305975306',
  Regular: '352602895776088064',
  Veteran: '352602848128663553',
  Moderator: '352602806336749590',
  Developer: '615062673775919116',
  Admin: '352602773537161219',
  Owner: '352601920545882112'
}

const ErrorStrings = {
  INVALID_FIELD: "INVALID_FIELD",
  INVALID_ID: "INVALID_ID",
  INVALID_RANK: "INVALID_RANK",
  INVALID_SEARCH: "INVALID_SEARCH",
  INVALID_USER: "INVALID_USER",
  UNAUTHORIZED: "UNAUTHORIZED",
  UNKNOWN: "UNKNOWN"
}

const Convert = {
  Rank: {
    toId: function (num) {
      switch (String(num)) {
        case '0':
          return RankID.Guest;
        case '1':
          return RankID.Newbie;
        case '2':
          return RankID.Regular;
        case '3':
          return RankID.Veteran;
        case '4':
          return RankID.Moderator;
        case '5':
          return RankID.Developer;
        case '6':
          return RankID.Admin;
        case '7':
          return RankID.Owner;
        case RankID.Guest:
          return RankID.Guest;
        case RankID.Newbie:
          return RankID.Newbie;
        case RankID.Regular:
          return RankID.Regular;
        case RankID.Veteran:
          return RankID.Veteran;
        case RankID.Moderator:
          return RankID.Moderator;
        case RankID.Developer:
          return RankID.Developer;
        case RankID.Admin:
          return RankID.Admin;
        case RankID.Owner:
          return RankID.Owner;
        default:
          return 0;
      }
    },

    toNum: function (rank) {
      switch (String(rank)) {
        case '0':
          return 0;
        case '1':
          return 1;
        case '2':
          return 2;
        case '3':
          return 3;
        case '4':
          return 4;
        case '5':
          return 5;
        case '6':
          return 6;
        case '7':
          return 7;
        case RankID.Guest:
          return 0;
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
        case RankID.Owner:
          return 7;
        default:
          return 0;
      }
    }
  }
}

//==================== Server Setup ====================
//Docker Port 4650 - 4659
var server = app.listen(4650, function () {
  console.log("Discord Bot Server listening on port "+ server.address().port);

  bot.login(passwords.discordToken);

  bot.on('ready', () => {
    bot.user.setActivity(prefix + 'help');

    bot.guilds.forEach((guild) => {
      if (guild.name == "Flow Gaming") {
        serverCookie.setCookie('id=' + passwords.serverIdToken, apiUrl);
        guild.channels.get('615062943121408000').send('Flow Bot Online');
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

app.get('/users/:discordId/:field/:data', (req, res) => {

  var requestData = {
    cookie: sanitizeString(req.cookies.id),
    discordId: sanitizeString(req.params.discordId),
    field: sanitizeString(req.params.field),
    data: sanitizeString(req.params.data)
  }

  //Flow Gaming
  var fgGuild = bot.guilds.get('352601559458250762');

  //Data field to edit
  switch (requestData.field) {
    case 'rank':
      if (Convert.Rank.toNum(requestData.data) >= 0 && Convert.Rank.toNum(requestData.data) < 7) {
        if (requestData.cookie == passwords.serverIdToken) {
          changeDiscordRank(requestData.discordId, Convert.Rank.toId(requestData.data)).then(() => {
            fgGuild.channels.get(breakroom.id).send('Changed ' + fgGuild.members.get(requestData.discordId).displayName + '\'s rank to ' + fgGuild.roles.get(Convert.Rank.toId(requestData.data)).name);
          });
        } else {
          console.log('Error: ' + ErrorStrings.UNAUTHORIZED + ' from ' + requestData.cookie);
          res.send(ErrorStrings.UNAUTHORIZED);
          return;
        }
      } else {
        console.log('Error: ' + ErrorStrings.INVALID_RANK + ' from ' + requestData.cookie);
        res.send(ErrorStrings.INVALID_RANK);
        return;
      }
      break;
    case 'name':
      if (requestData.cookie == passwords.serverIdToken) {
        changeDiscordName(requestData.discordId, sanitizeString(requestData.data)).then(() => {
          fgGuild.channels.get(breakroom.id).send('Changed ' + fgGuild.members.get(requestData.discordId).displayName + '\'s name to ' + sanitizeString(requestData.data));
        });
      } else {
        console.log('Error: ' + ErrorStrings.UNAUTHORIZED + ' from ' + requestData.cookie);
        res.send(ErrorStrings.UNAUTHORIZED);
        return;
      }
      break;
    default:
      console.log('Error: ' + ErrorStrings.INVALID_FIELD + ' from ' + requestData.cookie);
      res.send(ErrorStrings.INVALID_FIELD);
      return;
}

  res.send('Hello');
});

bot.on('message', message => {
	if (message.author === bot.user)
		return;

	if (message.content.startsWith(prefix + 'website')) {
		console.log(message.author.username + ' : website : ' + message.createdAt);
		message.channel.send('https://www.flowgaming.org');
	} else if (message.content.startsWith(prefix + 'invite')) {
		console.log(message.author.username + ' : invite : ' + message.createdAt);
		message.channel.send('https://discord.gg/NC3E6ZN');
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
        Convert.Rank.toId(message.author.id),
        Convert.Rank.toId(message.mentions.members.array()[0].id),
        Convert.Rank.toId(message.mentions.roles.array()[0].id)
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
      url: apiUrl,
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
        personalCookie.setCookie('id=' + responseObject.data.request.uniqueid, apiUrl);
        request.post({
          url: apiUrl,
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

function changeDiscordRank(editUser, newRank) {
  return new Promise((resolve, reject) => {

    //Get Flow Gaming Member
    bot.guilds.get('352601559458250762').fetchMember(editUser).then((guildMember) => {
      removeAllRoles(editUser).then((guildMember) => {
        if (Convert.Rank.toNum(newRank) != 0) {
          guildMember.addRole(bot.guilds.get('352601559458250762').roles.get(Convert.Rank.toId(newRank)));
        }
        resolve (true);
      });
    });
  });
}

function changeDiscordName(editUser, newName) {
  return new Promise((resolve, reject) => {

    //Get Flow Gaming Member
    bot.guilds.get('352601559458250762').fetchMember(editUser).then((guildMember) => {
        guildMember.setNickname(sanitizeString(newName)).then(resolve (true)).catch(console.error);
    });
  });
}

function removeAllRoles(editID) {
  return new Promise((resolve, reject) => {
    var guild = bot.guilds.get('352601559458250762');

    guild.fetchMember(editID).then((guildMember) => {
      guildMember.removeRoles([
        guild.roles.get(RankID.Newbie),
        guild.roles.get(RankID.Regular),
        guild.roles.get(RankID.Veteran),
        guild.roles.get(RankID.Moderator),
        guild.roles.get(RankID.Developer),
        guild.roles.get(RankID.Admin),
        guild.roles.get(RankID.Owner)
      ]).then((guildMember) => {
        console.log('Removed all roles from ' + editID);
        resolve(guildMember);
      });
    });
  });
}

function sanitizeString(unsanitaryString) {
  if (unsanitaryString == null)
    return '';

  return unsanitaryString.replace(/[^\w\s_.:!@#-]/, "");
}
