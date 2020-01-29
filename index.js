var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = __dirname + "//images//1.png";
var fs = require('fs'),
    out = fs.createWriteStream(path, {
            flags: 'w+'
        });
	out.on('error', function(e) { console.error(e); });
const { createCanvas } = require('canvas')
var canvas = createCanvas(2000, 2000);

/*fabric.Canvas('c', {
    isDrawingMode: true, 
	width: 999, 
	height: 333 });*/
var context = canvas.getContext('2d');
var userCounter=0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  userCounter++;
  socket.on('disconnect', function(){
    console.log('user disconnected');
	userCounter--;
  });
  // Start listening for mouse move events
	socket.on('canvasdraw', function (data) {
		console.log('someone drawing ');
		let path=data.path;
		for(let i=0;i<path.length-1;i++){
			//console.log(data[i]);
			drawLine(context, data.fillColor, data.borderColor,path[i],path[i+1],data.width);
		}
	});
	socket.on('getImage', function () {
		console.log('someone pulled out image')
		socket.emit('draw',canvas.toDataURL());
	});	
	socket.on('uncaughtException', function (exception) {
  // handle or ignore error
	console.log(exception);
	});
});

http.listen(80, function () {
  console.log('Example app listening on port 80!');
});
update();
//save();
function update(){
		//console.log('canvas is updating');
		setTimeout(function(){
		//console.log(canvas.toDataURL());
		io.emit('draw',canvas.toDataURL());
		update();
	},100);
};

function drawLine(context, fcolor, bcolor, begin, end, width) {
	context.strokeStyle = bcolor;
	context.fillStyle = fcolor;
	context.beginPath();       // Начинает новый путь
	context.moveTo(begin.x, begin.y);    // Рередвигает перо в точку (30, 50)
	context.lineTo(end.x, end.y);
	context.lineWidth = width;
	context.stroke();  
}
	

function save(){
setTimeout(function(){
		console.log('canvas is saved to file');
		var stream = canvas.createPNGStream();
		stream.on('data', function(chunk) {
		  out.write(chunk);
		});
		save();
	}, 60000);
};