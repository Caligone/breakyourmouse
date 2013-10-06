/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);


/**
 * Engine
 */
var scoreTeam1 = 0;
var scoreTeam2 = 0;
var playersTeam1 = 0;
var playersTeam2 = 0;
var winsTeam1 = 0;
var winsTeam2 = 0;
var defeatsTeam1 = 0;
var defeatsTeam2 = 0;
var pause = false;
var players = [];
io.sockets.on('connection', function(socket) {
	if (playersTeam1 > playersTeam2) {
		playersTeam2++;
		players[socket.id] = 2;
		console.log("Balancing player " + socket.id + " in team " + players[socket.id]);
		socket.emit('autobalancing', {
			team: 2
		});
		socket.emit('refreshscore', {
			score1: scoreTeam1,
			score2: scoreTeam2
		});
	} else {
		playersTeam1++;
		players[socket.id] = 1;
		console.log("Balancing player " + socket.id + " in team " + players[socket.id]);
		socket.emit('autobalancing', {
			team: 1
		});
		socket.emit('refreshscore', {
			score1: scoreTeam1,
			score2: scoreTeam2
		});
	}

	io.sockets.emit('refreshteam', {
		team1: playersTeam1,
		team2: playersTeam2
	});

	io.sockets.emit('refreshtotalscore', {
		winsTeam1: winsTeam1,
		winsTeam2: winsTeam2,
		defeatsTeam1: defeatsTeam1,
		defeatsTeam2: defeatsTeam2
	});

	socket.on('inc1', function(socket) {
		if (pause)
			return;
		scoreTeam1++;
		io.sockets.emit('refreshscore', {
			score1: scoreTeam1,
			score2: scoreTeam2
		});
		if (100 <= scoreTeam1) {
			pause = true;
			io.sockets.emit('end', {
				win: 1
			});
			winsTeam1++;
			defeatsTeam2++;
			setTimeout(function() {
				scoreTeam1 = 0;
				scoreTeam2 = 0;

				io.sockets.emit('refreshscore', {
					score1: scoreTeam1,
					score2: scoreTeam2
				});
				pause = false;
			}, 3000);
			io.sockets.emit('refreshtotalscore', {
				winsTeam1: winsTeam1,
				winsTeam2: winsTeam2,
				defeatsTeam1: defeatsTeam1,
				defeatsTeam2: defeatsTeam2
			});
		}
	});

	socket.on('inc2', function(socket) {
		if (pause)
			return;
		scoreTeam2++;
		io.sockets.emit('refreshscore', {
			score1: scoreTeam1,
			score2: scoreTeam2
		});
		if (100 <= scoreTeam2) {
			pause = true;
			io.sockets.emit('end', {
				win: 2
			});
			winsTeam2++;
			defeatsTeam1++;
			setTimeout(function() {
				scoreTeam1 = 0;
				scoreTeam2 = 0;

				io.sockets.emit('refreshscore', {
					score1: scoreTeam1,
					score2: scoreTeam2
				});
				pause = false;
			}, 3000);
			io.sockets.emit('refreshtotalscore', {
				winsTeam1: winsTeam1,
				winsTeam2: winsTeam2,
				defeatsTeam1: defeatsTeam1,
				defeatsTeam2: defeatsTeam2
			});
		}
	});

	socket.on('dec1', function(socket) {
		if (pause)
			return;
		if (0 < scoreTeam1)
			scoreTeam1--;
		io.sockets.emit('refreshscore', {
			score1: scoreTeam1,
			score2: scoreTeam2
		});
	});

	socket.on('dec2', function(socket) {
		if (pause)
			return;
		if (0 < scoreTeam2)
			scoreTeam2--;
		io.sockets.emit('refreshscore', {
			score1: scoreTeam1,
			score2: scoreTeam2
		});
	});

	socket.on('disconnect', function() {
		if (players[socket.id] == 1) {
			playersTeam1--;
		} else {
			playersTeam2--;
		}
		delete players[socket.id];

		io.sockets.emit('refreshteam', {
			team1: playersTeam1,
			team2: playersTeam2
		});
	});
});