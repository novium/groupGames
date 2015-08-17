var express     = require('express');
var request     = require('request');
var qs          = require('querystring');
var fs          = require('fs');
var libxmljs    = require("libxmljs");
var generate    = require('csv-generate');
var ProgressBar = require('progressbar').ProgressBar;
var chalk       = require('chalk');
var Datastore   = require('nedb'), db = new Datastore({ filename: 'database.db', autoload: true });

// Settings
var groupid     = "ResurrectDeadMPGames" ;// 64bit id or name
var key         = "FB3CE9611421C284088DBE1F07356786";

// Variables
var idList, gamesList;
gamesList = [];


db.remove({ }, {}, function (err, numRemoved) {
  // numRemoved = 1
});

console.log("Initializing...");
var progress = new ProgressBar();
progress.step('getting members...');
request('http://steamcommunity.com/groups/' + groupid + '/memberslistxml/?xml=1', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var xml;
    xml = libxmljs.parseXml(body, { noblanks: true });
    idList = xml.get('//memberList/members').text().match(/.{1,17}/g);
    //console.log(idList.text().split('\n'));
    progress.step('collecting game count...');
    progress.setTotal(idList.length);
    for (var i = 0; i < idList.length; i++) {
      request('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + key + '&steamid=' + idList[i] + '&format=json', function (error, response, body) {
        if(!error && response.statusCode == 200) {
          progress.addTick();
          games = JSON.parse(body).response.games;
          try {
            for (var i = 0; i < games.length; i++) {
              db.update({ _id: games[i].appid }, { $inc: { count: 1 } }, { upsert: true }, function (err, numReplaced, upsert) {

              });
            }
          } catch (e) { } finally { }
        }
      });
      if(idList.length == i)
        progress.end();
    }
  }
});

/*setTimeout(function() {
  fs.writeFile("games.json", JSON.stringify(gamesList));
  console.log("saved");
}, 2000);
*/
