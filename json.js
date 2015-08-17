var Datastore   = require('nedb'), db = new Datastore({ filename: 'database.db', autoload: true });
var fs          = require('fs');

db.find({}, function (err, docs) {
  fs.writeFile("games.json", JSON.stringify(docs));
});
