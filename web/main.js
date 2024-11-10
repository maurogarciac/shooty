// import {io} from "https://cdn.socket.io/4.8.0/socket.io.esm.min.js";
import {Level} from "./level.js"
import {Player} from "./player.js"

var canvas, 
	ctx, 
	scenario, 
	player,
	crosshair    = {x: 0, y: 0}

const socket     = io(
	"ws://localhost:4269/", {
	protocol: "echo-protocol",	 
	transports: ["websocket"], 
	reconnection: false,
    //reconnectionAttempts: 5,
    //reconnectionDelay: 1000 
	}),
	FPS          = 50,
	canvasHeight = 600, 
	canvasWidth  = 900

// Match keyboard events

document.addEventListener('mousemove', (event) => {

	const rect = canvas.getBoundingClientRect();
    crosshair.x = event.clientX - rect.left;
    crosshair.y = event.clientY - rect.top;

	player.aim(crosshair)
	
});

document.addEventListener('keydown', (event) => {

  	switch(event.key){
		
		case "w":
			socket.emit("action", "hiii")
			console.log("moveup")
			player.moveUp()
		break

		case "a":
			player.moveLeft()
		break
				
		case "s":
			player.moveDown()
		break
		
		case "d":
			player.moveRight()
		break
	}
})

document.addEventListener('keyup', (event) => {

	switch(event.key){
		
		case "w":
			player.stopMovingUp()
		break

		case "s":
			player.stopMovingDown()
		break

		case "a":
			player.stopMovingLeft()
		break

		case "d":
			player.stopMovingRight()
		break
	}
})

export function normalizeAngle(angle){
	angle = angle % (2 * Math.PI)
	if(angle < 0){
		angle = (2 * Math.PI) + angle	// if it's negative, turn around
	}
	return angle
}

export function radianConvert(angle){
	angle = angle * (Math.PI / 180)
	return angle
}

export function lineSegment(x1,y1,x2,y2){
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2-y1)*(y2-y1))
} 

export function init(){

	console.log("init started")
	socket.on("tick", (data) => {
		console.log(data)
	})

	socket.on("connect", () => {
		console.log("connected");
	})


	socket.on("gameinfo", (data) => {
		console.log(data)
	})

	socket.on("disconnect", (reason, details) => {
		console.log(reason);

		// the low-level reason of the disconnection, for example "xhr post error"
		console.log(details.message);
	  
		// some additional description, for example the status code of the HTTP response
		console.log(details.description);
	  
		// some additional context, for example the XMLHttpRequest object
		console.log(details.context);
	})
  
	//console.log("game started")
	canvas        = document.getElementById('game')
	ctx           = canvas.getContext('2d')

	// set canvas size (based on values hardcoded in css)
	canvas.width  = canvas.clientWidth
	canvas.height = canvas.clientHeight

	scenario      = new Level(canvas, ctx)
	player        = new Player(ctx, scenario)

	setInterval(function(){gameLoop()},1000/FPS)  // start the game loop

}

function clearCanvas(){
	canvas.width  = canvas.width
	canvas.height = canvas.height
}

function gameLoop(){
	clearCanvas()

	scenario.draw()
	player.draw()
}

export default {
	canvasWidth,
	canvasHeight,
}
