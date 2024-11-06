import {Level} from "./level.js"
import {Player} from "./player.js"

var canvas, 
	ctx, 
	scenario, 
	player,
	crosshair = {x: 0, y: 0}

const FPS = 50,
	FOV = 80,
	canvasHeight = 600, 
	canvasWidth = 900

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
  
	//console.log("game started")
	canvas = document.getElementById('game')
	ctx = canvas.getContext('2d')

	// set canvas size (based on values hardcoded in css)
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight

	scenario = new Level(canvas, ctx)
	player = new Player(ctx, scenario)

	setInterval(function(){gameLoop()},1000/FPS)  // start the game loop

}

function clearCanvas(){
	canvas.width = canvas.width
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
	FOV
}
