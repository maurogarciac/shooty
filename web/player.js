import main, {radianConvert, normalizeAngle} from "./main.js"
import {Ray} from "./rays.js"

console.groupCollapsed("Player")

export class Player {
	
	constructor(context, scenario, x, y){
		
		this.ctx = context
		this.scenario = scenario

		this.crosshair = {x: 0, y: 0}
  
		this.x = x
		this.y = y
		
		this.move = 0 	                            // -1 = behind, 1 = forward
		this.rotate = 0 		                    // -1 = rotateCameraLeft, 1 = rotateCameraRight
		
		this.rotationAngle = 0
		
		this.rotationSpeed = radianConvert(3) 		// 3 degrees in radians
		this.movementSpeed = 3
		
		
		// first person renderer
		this.numRays = 60         				    // amount of rays casted
		this.rays = []    		                    // array of rays

		// calculating the rays' angles	
		var angleIncrement	 = radianConvert(main.FOV / this.numRays)
		var initialAngle 	 = radianConvert(this.rotationAngle - (main.FOV / 2))
		
		var rayAngle = initialAngle
		
		// creating rays
		for(let i=0; i < this.numRays; i++){
			
			this.rays[i] = new Ray(this.ctx, this.scenario, this.x, this.y, this.rotationAngle, rayAngle, i)
            
			rayAngle += angleIncrement
		}
	}

	

	moveForward(){
		console.log("move up")
		this.move.y = 1
	}
	
	moveBackwards(){
		console.log("move down")
		this.move.y = -1
	}

	moveLeft(){
		console.log("move up")
		this.move.x = -1
	}
	
	moveRight(){
		console.log("move down")
		this.move.x = 1
	}


	aim(ch){
		this.crosshair.x = ch.x 
		this.crosshair.y = ch.y
	}
	
	stopMoving(){
		this.move = 0
	}
	
	stopTurning(){
		this.rotate = 0
	}

	collision(x,y){
		
		var crash = false

		// get coordinates of player's current square
		var tilePosX = parseInt(x / this.scenario.tileWidth)
		var tilePosY = parseInt(y / this.scenario.tileHeight)        

        // console.log("player:collisionTilePosX: " + tilePosX)
        // console.log("player:collisionTilePosY: " + tilePosY)
		
		if(this.scenario.collision(tilePosX, tilePosY)){
            crash = true    
        }

		return crash
	}
	
	update(){

		// movement logic
        var newX = this.x + this.move * Math.cos(this.rotationAngle) * this.movementSpeed
		var newY = this.y + this.move * Math.sin(this.rotationAngle) * this.movementSpeed
		
		if(!this.collision(newX, newY)){
            // console.log("newX: " + newX)
            // console.log("newY: " + newY)
			this.x = newX
			this.y = newY
		}
		

		
		// update rays
		for(let i=0; i<this.numRays; i++){
			this.rays[i].x = this.x
			this.rays[i].y = this.y
			this.rays[i].setAngle(this.rotationAngle)
		}	
	}
	
	draw(){
        
		//update before drawing
		this.update()
		
		// draw rays
		for(let i=0; i<this.numRays; i++){
			this.rays[i].draw()
		}

		// draw crosshair idk
		this.ctx.save()
		this.ctx.beginPath()
		this.ctx.arc(this.crosshair.x, this.crosshair.y, 7, 0, 2 * Math.PI)
		this.ctx.strokeStyle = "yellow"
		this.ctx.lineWidth = 1
		this.ctx.stroke()
		this.ctx.restore()

        //this.ctx.fillRect(this.crosshair.x - 2, this.crosshair.y - 2, 4, 4)
		this.ctx.save()
		this.ctx.fillStyle = "yellow" 
		this.ctx.fillRect(this.crosshair.x - 7, this.crosshair.y - 1, 14, 2)
		this.ctx.fillRect(this.crosshair.x - 1, this.crosshair.y - 7, 2, 14)
		this.ctx.restore()

        // white player circle
		this.ctx.save()
        this.ctx.fillStyle = "white" 
        this.ctx.fillRect(this.x - 3, this.y - 3, 6, 6)  // 6x6 rectangle centered on player 0 axis
        
        
        // line parallel to player camera

		let angle = Math.atan2(this.crosshair.y - this.y, this.crosshair.x - this.x);
		let len = 40 
		
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