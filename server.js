//load nescessary modules
var randomID = require('random-id');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongo = require('mongodb').MongoClient;

//set up the server
var server = app.listen(5000, function() {console.log("localhost 5000 is listening");});
var io = require('socket.io').listen(server);

//set up the view engine for pug
app.set('view engine', 'pug');
app.set('views', './public');
app.use(express.static('public'));

//create a temp user
var currentUser = null;
//create a list of current user
clients = [];

var db;
//connect to the mongoDB database
mongo.connect("mongodb://localhost:27017/chatDB", function(err, database){
	if (err) throw err;
	db = database;
});

app.use(function(req, res, next){
	console.log(req.method + " request for " + req.url);
	next();
});

//set up the index.pug
app.get('/', function(req, res){
	res.render('index');
});

//set up the login.pug
app.get('/login', function(req, res){
	res.render('login');
});

//set up the register.png
app.get('/register', function(req, res){
	res.render('register');
});

//set up the chat.pug
app.get('/chat', function(req, res){
	if (currentUser)
	{
		res.render('chat', {user: currentUser.nickname});
	}
	else
	{
		res.redirect('/');
	}
});

//login and register page
app.use(['/login', '/register'], bodyParser.urlencoded({extended:false}));

//post request for register
app.post('/register', function(req, res){
	db.collection("users").findOne({username:req.body.username}, function(err, user){
		if (err){
			console.log("Error : ", err);
			res.sendStatus(500);
		} else if (user){
			res.render('register', {warning:"Username already exists!"});
		} else {
			var user = new User(req.body.username, req.body.password, req.body.nickname);
			
			var randid = randomID(8, "0");
			user.id = randid;

			db.collection("users").insert(user, function(err, results){
				if (err){
					console.log("Error : ", err);
					res.sendStatus(500);
				} else {
					currentUser = user;
					res.redirect('/chat');
				}
			});
		}
	})
});

//post request for login
app.post('/login', function(req, res){
	db.collection("users").findOne({username:req.body.username}, function(err, user){
		if (err){
			console.log("Error : ", err);
			res.sendStatus(500);
		} else if (!user){
			res.render('login', {warning:"User Not Found!"});
		} else if (user.password!==req.body.password){
			res.render('login', {warning:"Incorrect Password!"});
		} else {
			currentUser = user;
			res.redirect('/chat');
		}
	});
});

//get request for the current user information
app.get("/currentUser", function(req, res, next){
	var tempUser = currentUser;
	res.send(tempUser);
	currentUser = null;
});

//get request for the message between two users
app.get("/historyText/:sender/:reciever", function(req, res, next){
	//collection of the sender messages
	var senderColl = db.collection("message."+req.params.sender);
	//information of the message to the receiver
	senderColl.findOne({reciever:req.params.reciever}, function(err, recieverMess){
		if (recieverMess)
		{
			res.send(recieverMess.messages);
		}
		else
		{
			res.send(null);
		}
	});
});

//get request for the status of the selected user
app.get("/active/:name", function(req, res, next){
	if (req.params.name in activeUser())
	{
		res.send(true);
	}
	else
	{
		res.send(false);
	}
});

//io.emit -> everyone
//socket.broadcast.emit -> everyone but not me
//socket.emit -> that one
io.on("connection", function(socket){
	//add the socket to the clients list
	socket.on("intro", function(data){
		socket.username = data.username;
		socket.nickname = data.nickname;

		clients.push(socket);
		sendUserList();
	});

	//remove the socket if it is not active
	socket.on("disconnect", function(){
		clients = clients.filter(function(ele){
			return ele!==socket;
		});
	});

	//get the message from the client side
	//data->sender, reciever, text
	socket.on("message", function(data){
		var information = JSON.parse(data);
		//collection for the sender message
		var senderColl = db.collection("message." + information.sender);
		//information for the messages to the reciever
		senderColl.findOne({reciever:information.reciever}, function(err, recieverMess){
			if (!recieverMess)
			{
				var newMessage = [];
				newMessage.push({time:currentTime(), text:information.text});
				var newConversation = {reciever:information.reciever};
				newConversation.messages = newMessage;
				senderColl.insert(newConversation, function(err, results){
					if (err){
						console.log("Error : ", err);
						res.sendStatus(500);
					} else {
						//send to the user if they are active
						var sendSocket = findUser(information.reciever);
						if (sendSocket !== null)
						{
							var output = {sender : information.sender,
										  message:{time:currentTime(), text:information.text}};
							sendSocket.emit("message", JSON.stringify(output));
						}
					}
				});
			}
			else
			{
				var conversation = recieverMess;
				conversation.messages.push({time:currentTime(), text:information.text});
				senderColl.update({reciever:information.reciever}, conversation, function(err, results){
					if (err){
						console.log("Error : ", err);
						res.sendStatus(500);
					} else {
						//send to the user if they are active
						var sendSocket = findUser(information.reciever);
						if (sendSocket !== null)
						{
							var output = {sender : information.sender, 
										  message:{time:currentTime(), text:information.text}};
							sendSocket.emit("message", JSON.stringify(output));
						}
					}
				});
			}
		});
	});
});

//get the local time
function currentTime(){
	return new Date().toLocaleTimeString();
}

//send the information of all user to the socket
function sendUserList(){
	var outputlist = [];
	var allUsers = db.collection("users");
	allUsers.find().each(function(err, document){
		if (document != null)
		{
			outputlist.push(document);
		}
		else
		{
			console.log("Sending user list:");
			console.log(outputlist);
			io.emit("user", outputlist);
		}
	});
}

//get the username of all actives user
function activeUser(){
	outputList = [];
	for (var i = 0; i < clients.length; i++){
		outputList.push(clients.username);
	}
	return outputList;
}

//find the user from the active users list
function findUser(selectedUser){
	for (var i = 0; i < clients.length; i++){
		if (clients[i].username === selectedUser)
			return clients[i];
	}
	return null;
}

//constructor for users
function User(username, password, nickname){
	this.username = username;
	this.password = password;
	this.nickname = nickname;
}