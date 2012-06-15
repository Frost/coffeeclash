// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Players = new Meteor.Collection("players");

if (Meteor.is_client) {

  var numberOfCupsToday = function(cups) {
    if (cups) {
      var cupsToday = cups.map(function(cup) {
        var now = new Date();
        var date = new Date(cup.consumedAt);
        if ( date.getFullYear() === now.getFullYear() && 
             date.getMonth() === now.getMonth() &&
             date.getDate() === now.getDate()) {
          return 1;
        } else {
          return 0;
        }
      });

      return cupsToday.reduce(function(a,b) {return a + b;}, 0);
    } else { 
      return 0;
    }
  };

  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events = {
    'click input.inc': function () {
      var cup = {consumedAt: new Date()};
      var player = Players.findOne(Session.get("selected_player"));
      Players.update(player._id, {$push: {cups: cup}, $set: {score: numberOfCupsToday(player.cups)}});
    }
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };

  Template.playerform.events = {
    'submit': function () {
      var name = $("input[name=player_name]");
      var player = Players.insert({name: name.val(), score: 0, cups: []});
      Session.set("selected_player", player);
    }
  }

  Handlebars.registerHelper("numberOfCupsToday", numberOfCupsToday);
}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
  Meteor.startup(function () {});
}
