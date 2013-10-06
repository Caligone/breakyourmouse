$(document).ready(function() {
	var team = 0;

	$("#bluealert").hide();
	$("#redalert").hide();

	var socket = io.connect("http://"+window.location.hostname+":3000");
	socket.emit('connection');

	socket.on('autobalancing', function(data) {
		team = data.team;
		if (data.team == 1) {
			$("#team1").attr('disabled', false);
			$("#team1").html('<span class="glyphicon glyphicon-plus-sign"></span> Team 1');
			$("#team2").attr('disabled', false);
			$("#team2").html('<span class="glyphicon glyphicon-minus-sign"></span> Team 2');
			$("#lead").html("You are BLUE !");
		} else {
			$("#team1").attr('disabled', false);
			$("#team1").html('<span class="glyphicon glyphicon-minus-sign"></span> Team 1');
			$("#team2").attr('disabled', false);
			$("#team2").html('<span class="glyphicon glyphicon-plus-sign"></span> Team 2');
			$("#lead").html("You are RED !");
		}
	});

	socket.on('refreshscore', function(data) {
		$("#score1").css('width', data.score1 + "%");
		$("#score2").css('width', data.score2 + "%");
	});

	socket.on('refreshteam', function(data) {
		$("#nbTeam1").html(data.team1+" players");
		$("#nbTeam2").html(data.team2+" players");

	});

	socket.on('end', function(data) {
		if(data.win == 1)
		{
			$("#bluealert").show();
			setTimeout(function() {
			$("#bluealert").hide();
			}, 3000);
		}
		else
		{
			$("#redalert").show();
			setTimeout(function() {
			$("#redalert").hide();
			}, 3000);
		}
	});

	$("#team1").click(function(event) {
		if(team == 1)
			socket.emit("inc1");
		else
			socket.emit("dec1");
	});

	$("#team2").click(function(event) {
		if(team == 2)
			socket.emit("inc2");
		else
			socket.emit("dec2");
	});
});