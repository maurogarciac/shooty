import './App.css'

import { io, Socket } from "socket.io-client"
import { Level } from "./level.tsx"
import { Player } from "./player.tsx"


export type Coordinates = {[key: string]: number}

var canvas: HTMLCanvasElement, 
	ctx: CanvasRenderingContext2D, 
	scenario: Level, 
	player: Player,
	crosshair: Coordinates = {x: 0, y: 0}

const socket     = io(
	"ws://localhost:4269/", {
	// protocol: "echo-protocol",	 
	transports: ["websocket"], 
	// reconnection: true,
	// upgrade: false,
    // reconnectionAttempts: 5,a
    // reconnectionDelay: 1000 
	}),
	FPS          = 60

	export const canvasHeight = 600,
	  canvasWidth  = 900

// Match keyboard events

document.addEventListener('keydown', (event) => {

  	switch(event.key){
		
		case "w":
			socket.emit("action", "moveup")
			console.log("moveup")
			player.moveUp()
		break

		case "a":
			socket.emit("action", "moveleft")
			console.log("moveleft")
			player.moveLeft()
		break
				
		case "s":
			socket.emit("action", "movedown")
			console.log("movedown")
			player.moveDown()
		break
		
		case "d":
			socket.emit("action", "moveright")
			console.log("moveright")
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

export function normalizeAngle(angle: number) : number {
	angle = angle % (2 * Math.PI)
	if(angle < 0){
		angle = (2 * Math.PI) + angle	// if it's negative, turn around
	}
	return angle
}

export function radianConvert(angle: number): number{
	angle = angle * (Math.PI / 180)
	return angle
}

export function lineSegment(x1: number,y1: number,x2: number,y2: number): number{
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2-y1)*(y2-y1))
} 

function init(){

	console.log("init started")
	socket.on("tick", (data) => {
		console.log(data)
	})

	socket.on("connect", () => {
		console.log("connected");
	})

	
	socket.on("received", (data) => {
		console.log('received' + data)
	})


	socket.on("gameinfo", (data) => {
		console.log(data)
	})

	socket.on("disconnect", (reason: Socket.DisconnectReason, details) => {
		console.log(reason);

    if (details === undefined) {
      console.log("disconnect details are undefined")
    } else {
      console.log(details);
    }
	})
  
	//console.log("game started")
  let getCanvas = document.getElementById('game')
  if(getCanvas !== null && getCanvas instanceof HTMLCanvasElement) {
    canvas = getCanvas
    let getContext = canvas.getContext('2d')
    if(getContext !== null && getContext instanceof CanvasRenderingContext2D) {
    ctx = getContext
    }
  }

	// set canvas size (based on values hardcoded in css)
	canvas.width  = canvas.clientWidth
	canvas.height = canvas.clientHeight

	scenario      = new Level(canvas, ctx)
	player        = new Player(ctx, scenario)

	document.addEventListener('mousemove', (event) => {

		const rect = canvas.getBoundingClientRect();
		crosshair.x = event.clientX - rect.left;
		crosshair.y = event.clientY - rect.top;
	
		player.aim(crosshair)
		
	});

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


function App() {

	setTimeout(() => {
		init()
	}) 
		
  return (
    <>
      <main>
          <div id="game-wrapper">
              <canvas id="game"></canvas>
          </div>
  
          <div id="title">
              <h1>Videogmangn</h1>
          </div>
      </main>
    </>
  )
}

export default App
