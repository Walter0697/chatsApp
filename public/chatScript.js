var currentUser;
var chattingUser = null;

window.onload = function(){
	if (!currentUser) getCurrentUser();
	document.getElementById("chatSection").readOnly = true;

	//connect to the server
	var socket = io();
	socket.on('connect', function(){
		socket.emit('intro', currentUser);
	});

	//show the user to the user list
	socket.on("user", function(data){
		var users = data;
		console.log(users);
		$userList = $("<ul></ul>");
		users.forEach(function(user){
			console.log(user.nickname);
			if (currentUser.username != user.username)
			{
				var $userObj = $("<li>" + user.nickname + "</li>");
				//append the event listener to the user
				$userObj.click(function(){
					console.log("switch to " + user.nickname);
					chattingUser = user;
					//changing the headline
					$('#headLine').empty();
					$('#headLine').html(currentUser.nickname + " Talking with " + chattingUser.nickname);
					getText();
				});
				$userList.append($userObj);
			}
		});
		$userList.prepend("<p>Users:</p>");
		$('#userDiv').html($userList);
	});

	//get the message from the other user
	socket.on("message", function(data){
		var information = JSON.parse(data);
		if (chattingUser.username === information.sender)
		{
			pushText(information.message, chattingUser);
			$('#chatSection')[0].scrollTop = $('#chatSection')[0].scrollHeight;
		}
	});

	//send the text when clicking enter
	$('#inputSection').keypress(function(event){
		if (event.which===13){
			sendText();
			event.preventDefault();
		}
	});

	//send the text to the server and the other socket
	function sendText(){
		if (chattingUser !== null && $('#inputSection').val() !== null)
		{
			var textInformation = {sender:currentUser.username,
								   senderNick:currentUser.nickname,
								   reciever:chattingUser.username,
								   text:$('#inputSection').val()
								  };
			console.log(textInformation);
			socket.emit("message", JSON.stringify(textInformation));
			//put it inside the chatLog
			//$('#chatSection').append((new Date()).toLocaleTimeString()+ ", " + currentUser.nickname + " : "+ $('#inputSection').val() + "\n");
			pushText({time:(new Date()).toLocaleTimeString(), text:$('#inputSection').val()}, currentUser);
			$('#chatSection')[0].scrollTop = $('#chatSection')[0].scrollHeight;

			$('#inputSection').val("");
		}
	}
}

//get the current user information from the server
function getCurrentUser(){
	$.ajax({method: "GET",
			url: "/currentUser",
			async : false,
			success: function(data){
				if (data)
					currentUser = data;
			}
	});
}

//get the text information from the server
function getText(){
	var messageOne;
	var messageTwo;
	//getting messages from current to chatting
	$.ajax({method:"GET",
			url: "/historyText/"+currentUser.username+"/"+chattingUser.username,
			async : false,
			success: function(data){
				messageOne = data;
			}
	});
	//getting messages from chatting to current
	$.ajax({method:"GET", 
			url: "/historyText/"+chattingUser.username+"/"+currentUser.username,
			async : false,
			success : function(data){
				messageTwo = data;
			}
	});

	console.log(messageOne);
	//clear the chatLog first
	$('#chatSection').empty();
	//compare the messages time and pop them out one by one
	while (messageOne.length !== 0 && messageTwo.length !== 0)
	{
		if (messageOne[0].time < messageTwo[0].time)
		{
			pushText(messageOne.shift(), currentUser);
		}
		else
		{
			pushText(messageTwo.shift(), chattingUser);
		}
	}
	//if messageOne has nothing, pop everything inside messageTwo
	if (messageOne.length === 0)
	{
		while (messageTwo.length !== 0)
		{
			pushText(messageTwo.shift(), chattingUser);
		}
	}
	//else, pop everything inside messageOne
	else
	{
		while (messageOne.length !== 0)
		{
			pushText(messageOne.shift(), currentUser);
		}
	}

	//scroll to the bottom
	$('#chatSection')[0].scrollTop = $('#chatSection')[0].scrollHeight;
}

function pushText(textMessage, sender)
{ 
	$('#chatSection').append(textMessage.time + ", " + sender.nickname + " : " + textMessage.text + "\n");	
}