import {Level} from "./level.js"
import {Player} from "./player.js"

var canvas, 
	ctx, 
	scenario, 
	player

const FPS = 50,
	FOV = 60,
	canvasHeight = 600, 
	canvasWidth = 900

// Match keyboard events

document.addEventListener('keydown', (event) => {

  	switch(event.key){
		
		case "w":
			player.moveForward()
		break

		case "a":
			player.rotateCameraLeft()
		break
				
		case "s":
			player.moveBackwards()
		break
		
		case "d":
			player.rotateCameraRight()
		break
	}
})

document.addEventListener('keyup', (event) => {

	switch(event.key){
		
		case "w":
			player.stopMoving()
		break

		case "s":
			player.stopMoving()
		break

		case "a":
			player.stopTurning()
		break

		case "d":
			player.stopTurning()
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
	canvas = document.getElementById('game')
	ctx = canvas.getContext('2d')

	// // get canvas coordinate offset from dom
	// const bodyRect = document.body.getBoundingClientRect(),
	// elemRect = canvas.getBoundingClientRect(),
	// offset_top   = elemRect.top - bodyRect.top,
	// offset_left  = elemRect.left - bodyRect.left

	// set canvas size (based on values hardcoded in css)
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight

	scenario = new Level(canvas, ctx)
	player = new Player(ctx, scenario, 100 ,100)

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
