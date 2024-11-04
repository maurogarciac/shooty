import main, {radianConvert, normalizeAngle} from "./main.js"
import {Ray} from "./rays.js"

console.groupCollapsed("Player")

export class Player {
	
	constructor(context, scenario, x, y){
		
		this.ctx = context
		this.scenario = scenario
  
		this.x = x
		this.y = y
		
		this.move = 0 	                            // -1 = behind, 1 = forward
		this.rotate = 0 		                    // -1 = rotateCameraLeft, 1 = rotateCameraRight
		
		this.rotationAngle = 0
		
		this.rotationSpeed = radianConvert(3) 		// 3 degrees in radians
		this.movementSpeed = 3
		
		
		// first person renderer
		this.numRays = main.canvasWidth	            // amount of rays casted (same as canvas width)
		this.rays = []    		                    // array of rays

		console.log(main.canvasWidth)
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
		this.move = 1
	}
	
	moveBackwards(){
		console.log("move down")
		this.move = -1
	}
	
	rotateCameraRight(){
		console.log("move right")
		this.rotate = 1
	}
	
	rotateCameraLeft(){
		console.log("move left")
		this.rotate = -1
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

        // rotate
		this.rotationAngle += this.rotate * this.rotationSpeed
        // console.log("rotationAngle: " + this.rotationAngle)
		this.rotationAngle = normalizeAngle(this.rotationAngle)
        // console.log("rotationAngle: " + this.rotationAngle)
        


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

        // white player circle
        this.ctx.fillStyle = "#FFFFFF" 
        this.ctx.fillRect(this.x - 3, this.y - 3, 6, 6)  // 6x6 rectangle centered on player 0 axis
        
        
        // line parallel to player camera
        var xDestination = this.x + Math.cos(this.rotationAngle) * 40
        var yDestination = this.y + Math.sin(this.rotationAngle) * 40
        
        this.ctx.beginPath()
        this.ctx.moveTo(this.x, this.y)
        this.ctx.lineTo(xDestination, yDestination)
        this.ctx.strokeStyle = "#FFFFFF"
        this.ctx.stroke()

	}
}
