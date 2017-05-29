var socket = io.connect(); 
//var socket = io.connect();
var db = new PouchDB('my_chats', {auto_compaction: true});
var name = '', id = ''; // User name

// Get the session / socket id
socket.on('connect', function () {
    id = socket.io.engine.id;
});

// Get Online Users List
socket.on('onlineUsers', function(users){
	console.log(users);
	var list = '<h4>Online Users</h4><ul class="list-group">';
	$.each(users, function(i, d){
		if(d.id == id){
			return true;
		}
		list += '<a href="javascript:void(0);" class="user" id="'+d.id+'" ><li class="list-group-item">'+d.name+'</li></a>';
	});
	list += '</ul>';
	$(".users-list").html(list);
});

// Get all connected users
/* socket.on('allUsers', function(users){
	console.log(users);
}); */

function submitfunction(){
  var from = $('#user').val();
  var to = $('#recipient').val();
  var message = $('#m').val();
  if(to == ''){
	swal({
		title: "No Recipient!",
		text: "Please select a Recipient..!",
		showCancelButton: false,
		closeOnConfirm: true,
		animation: "slide-from-top",
	  },
	  function(inputValue){
		return false;
	  }
    ); 
  }
  if(message != '' && to != '') {
	socket.emit('chatMessage', from, to, message);
	$('#m').val('').focus();
  }

  return false;
}
 
function notifyTyping() { 
  var user = $('#user').val();
  socket.emit('notifyUser', user);
}
 
function myFunction(){
	/* window.location = 'http://10.100.9.44:3001/' */
}

(function($){
  $.extend({
    playSound: function(){
      return $(
        '<audio autoplay="autoplay" style="display:none;">'
          + '<source src="' + arguments[0] + '.mp3" />'
          + '<source src="' + arguments[0] + '.ogg" />'
          + '<embed src="' + arguments[0] + '.mp3" hidden="true" autostart="true" loop="false" class="playSound" />'
        + '</audio>'
      ).appendTo('body');
    }
  });
})(jQuery);
 
socket.on('chatMessage', function(from, msg){
  var name = '';
  var doc = {
			  "from": from,
			  "message": msg,
			  "sent_at": new Date()
			};
  db.post(doc).then(function (response){
	// handle response
  }).catch(function (err){
	console.log(err);
  });;

  var me = $('#user').val();
  var color = (from == me) ? 'green' : '#009afd';
  var from = (from == me) ? 'Me' : from;
  if(from != me && from != 'Me' && from != 'System'){
	var options = {
      title: 'New Message',
      options: {
        body: 'New message from '+from,
        icon: 'fav1.png',
        lang: 'en-US',
        onClick: myFunction
      }
    };
	$.playSound("media/3724");
    $("#easyNotify").easyNotify(options);
  }
  $('#messages').append('<li><b style="color:' + color + '; text-transform: capitalize;">' + from + '</b>: ' + msg + '</li>');
  $(document).scrollTop($(document).height());
});
 
socket.on('notifyUser', function(user){
  var me = $('#user').val();
  if(user != me) {
    $('#notifyUser').text(user + ' is typing ...');
  }
  setTimeout(function(){ $('#notifyUser').text(''); }, 10000);;
});
 
$(document).ready(function(){	

  // PouchDB.debug.enable('*'); // Enables debug logs to disable it "PouchDB.debug.disable();"
 //Get all the documents (rows) from the database  
  /* db.allDocs({include_docs: true}).then(function(doc){
	console.log(doc.rows);
  }); */
  
  db.get('username').then(function(response){
	  name = response['name'];
	  socket.emit('newUser',name,id);
	  $('#user').val(name);
  }).catch(function(err){
	  console.log(err);
	  makeid();
  });
  
  // Info about the database
   /* db.info().then(function (info) {
     console.log(info);
   }); */
   
   $('body').on('click', '.user', function(){
	   var recp = $(this).attr('id');
	   $(this).closest("ul").find("li").removeClass("active");
	   $(this).find("li").addClass("active");
	   $('#recipient').val(recp);
   });
  
});
 
function makeid() {
  swal({
		title: "Your name?",
		text: "Name yourself..",
		type: "input",
		showCancelButton: false,
		closeOnConfirm: false,
		animation: "slide-from-top",
		inputPlaceholder: "Write something"
	  },
	  function(inputValue){
		  if (inputValue === false) return false;
		  
		if (inputValue === "") {
			swal.showInputError("You need to write something!");
			return false
		}
		db.put({
			"_id": "username",
			"name": inputValue,
			"created_at": new Date()
		}).then(function(response){}).catch(function(err){
			console.log(err);
		});
		name = inputValue;
		swal.close();
		socket.emit('newUser',name,id);
		$('#user').val(name);
		socket.emit('chatMessage', 'System', '<b>' + name + '</b> has joined the discussion');
		return false;
	  }
    ); 
	
  //var text = "";
  //text = name;
  /* var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; */
 
  /* for( var i=0; i < 5; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  } */
  //return text;
}