import { radianConvert, Coordinates } from "../App.tsx"
import { Ray } from "./rays.tsx"
import { Level } from "./level.tsx"

console.groupCollapsed("Player")

export class Player {

    ctx: CanvasRenderingContext2D
    scenario: Level
    x: number
    y: number
    FOV: number
    crosshair: Coordinates
    move: {[key: string]: boolean}
    rotationAngle: number				        			  // should be aiming angle later (in radians)
    movementSpeed: number

    // fog of war renderer hell yeah
    maxRays: number               				   			  // amount of rays casted
    rays: Ray[]



		constructor(context: CanvasRenderingContext2D, scenario: Level){
		
		this.ctx           = context
		this.scenario      = scenario

		this.FOV           = 120,

		this.crosshair     = {x: 0, y: 0}
  
		this.x             = scenario.spawn.x
		this.y             = scenario.spawn.y
		this.move          = {xpos:false, ypos:false, xneg:false, yneg:false}
		
		this.rotationAngle = 0					        			// should be aiming angle later (in radians)
		this.movementSpeed = 3
		
		// fog of war renderer hell yeah
		this.maxRays       = 60         				   			// amount of rays casted
		this.rays          = []    			                		// array of rays
		var angleIncrement = radianConvert(this.FOV / this.maxRays) // fraction of the full fov 
		var initialAngle   = radianConvert(this.rotationAngle - (this.FOV / 2))
		var rayAngle       = initialAngle
		
		for(let i=0; i < this.maxRays; i++){               			// creating each one of the rays
			this.rays[i] = new Ray(this.ctx, this.scenario, this.x, this.y, this.rotationAngle, rayAngle)
			rayAngle += angleIncrement 								// current ray slope + fractional increment until full FOV is covered
		}
	}

	moveUp(){
		//console.log("move up")
		this.move.ypos = true
	}
	
	moveDown(){
		//console.log("move down")
		this.move.yneg = true
	}

	moveLeft(){
		//console.log("move left")
		this.move.xneg = true
	}
	
	moveRight(){
		//console.log("move right")
		this.move.xpos = true
	}

	stopMovingUp(){
		this.move.ypos = false
 	}

	stopMovingDown(){
		this.move.yneg = false
 	}

	stopMovingLeft(){
		this.move.xneg = false
 	}

	stopMovingRight(){
		this.move.xpos = false
 	}

	aim(ch: Coordinates){
		this.crosshair.x = ch.x 
		this.crosshair.y = ch.y
	}

	shoot() {

		let bullet: Ray = new Ray(this.ctx, this.scenario, this.x, this.y, this.rotationAngle, 0)

		bullet.draw()
		// this.ctx.beginPath()
        // this.ctx.moveTo(this.x, this.y)
        // this.ctx.lineTo(this.crosshair.x, this.crosshair.y)
        // this.ctx.strokeStyle = "red"

        // this.ctx.stroke()
		// this.ctx.restore()
	}

	collision(x: number,y: number){
		
		var crash = false

		// get coordinates of player's current square
		var tilePosX = Math.round(x) / this.scenario.tileWidth
		var tilePosY = Math.round(y) / this.scenario.tileHeight        

        // console.log("player:collisionTilePosX: " + tilePosX)
        // console.log("player:collisionTilePosY: " + tilePosY)
		
		if(this.scenario.collision(tilePosX, tilePosY)){
            crash = true    
        }

		return crash
	}
	
	update(){

		// movement logic
		var coords = {x: 0, y: 0}
		
		if (this.move.ypos) coords.y -= this.movementSpeed
		if (this.move.yneg) coords.y += this.movementSpeed
		if (this.move.xneg) coords.x -= this.movementSpeed
		if (this.move.xpos) coords.x += this.movementSpeed
		
		if (coords.x !== 0 && coords.y !== 0) {								    // if coords are not zero, get the length of movement
			const length = Math.sqrt(coords.x * coords.x + coords.y * coords.y) // by doing the square root of the sum of square roots
			coords.x /= length												    // then normalize value
			coords.y /= length
			coords.x *= this.movementSpeed										// and scale to speed
			coords.y *= this.movementSpeed
		}
		
		var newX = this.x + coords.x
		var newY = this.y + coords.y

		// console.log("newX: " + newX)
		// console.log("newY: " + newY)
		// console.log(this.move)

		if(!this.collision(newX, newY)){
			this.x = newX
			this.y = newY
		}
		
		// update rays
		for(let i=0; i < this.maxRays; i++){
			this.rays[i].x = this.x
			this.rays[i].y = this.y
			this.rays[i].setAngle(this.rotationAngle)
		}	
	}
	
	draw(){
        
		//update before drawing
		this.update()
		
		// draw rays
		for(let i=0; i < this.maxRays; i++){
			this.rays[i].draw()
		}

		// draw crosshair idk
		this.ctx.save()
		this.ctx.beginPath()
		this.ctx.arc(this.crosshair.x, this.crosshair.y, 7, 0, 2 * Math.PI) // cool circle
		this.ctx.strokeStyle = "yellow"
		this.ctx.lineWidth = 2
		this.ctx.stroke()
		this.ctx.restore()
		
		this.ctx.save()
		this.ctx.fillStyle = "yellow" 
		this.ctx.fillRect(this.crosshair.x - 7, this.crosshair.y - 1, 14, 1) // vertical line
		this.ctx.fillRect(this.crosshair.x - 1, this.crosshair.y - 7, 1, 14) // horizontal line
		this.ctx.restore()

        // white player circle
		this.ctx.save()
        this.ctx.fillStyle = "white" 
        this.ctx.fillRect(this.x - 3, this.y - 3, 6, 6)  					// 6x6 rectangle centered on player 0 axis
        
        
        // line parallel to player camera (crosshair)
		let angle = Math.atan2(this.crosshair.y - this.y, this.crosshair.x - this.x)

		// this angle can also be used to be the center of ray-casts!
		this.rotationAngle = angle

		let len = 20 
		var xPointer = this.x + Math.cos(angle) * len
        var yPointer = this.y + Math.sin(angle) * len
        

        this.ctx.beginPath()
        this.ctx.moveTo(this.x, this.y)
        this.ctx.lineTo(xPointer, yPointer)
        this.ctx.strokeStyle = "white"
        this.ctx.stroke()
		this.ctx.restore()

	}
}