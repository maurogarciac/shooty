import main, {lineSegment, normalizeAngle} from "./main.js"


// ray distance


export class Ray {
	
	constructor(context, scenario, x, y, playerAngle, angleIncrement, column){

        this.rayDistanceHorizontal = 100		
        this.rayDistanceVertical   = 100
		
		this.ctx = context
		this.scenario = scenario

        this.tileSize = this.scenario.tileSize

		this.x = x
		this.y = y
		
		this.angleIncrement = angleIncrement
		this.playerAngle = playerAngle
		this.angle = playerAngle + angleIncrement
		
		this.wallHitX =0
		this.wallHitY = 0
		
		//these 4 zero values are all collisions 
		this.wallHitXHorizontal = 0
		this.wallHitYHorizontal = 0
		
		this.wallHitXVertical = 0
		this.wallHitYVertical = 0
		
		this.column = column
		this.distance = 0
		
		this.pixelTexture = 0
		this.textureId = 0
		
		this.proyectionPlaneDistance = (main.canvasWidth / 2) / Math.tan(main.FOV / 2)
	}
	
	
	// angle has to be normalized to prevent negative values
	setAngle(angle){
		this.playerAngle = angle
		this.angle = normalizeAngle(angle + this.angleIncrement)
	}
	
	cast(){
		
		this.xIntercept = 0
		this.yIntercept = 0
		
		this.xStep = 0
		this.yStep = 0
		
		this.moveBackwards = false
		this.rotateCameraLeft = false
		
		if(this.angle < Math.PI)
		  this.moveBackwards = true

		if(this.angle > Math.PI/2 && this.angle < 3 * Math.PI / 2)
		  this.rotateCameraLeft = true
							
		var horizontalCollision = false	// detect if there's a wall
		
		this.yIntercept = Math.floor(this.y / this.tileSize) * this.tileSize
		
		if(this.moveBackwards)
			this.yIntercept += this.tileSize
		
		var base = (this.yIntercept - this.y) / Math.tan(this.angle)
		this.xIntercept = this.x + base

		// calculate distance of every step
		this.yStep = this.tileSize
		this.xStep = this.yStep / Math.tan(this.angle)
		
		if(!this.moveBackwards)
			this.yStep = -this.yStep
		
		if((this.rotateCameraLeft && this.xStep > 0) || (!this.rotateCameraLeft && this.xStep < 0)){
			this.xStep *= -1
		}

		var nextHorizontalX = this.xIntercept
		var nextHorizontalY = this.yIntercept
		
		if(!this.moveBackwards)
			nextHorizontalY--

		while(!horizontalCollision){
			
			var tilePosX = parseInt(nextHorizontalX / this.tileSize)		
			var tilePosY = parseInt(nextHorizontalY / this.tileSize)		
			
			if(this.scenario.collision(tilePosX,tilePosY)){
                // console.log("rays:collision:X :" + tilePosX)
                // console.log("rays:collision:Y :" + tilePosY)
                
				horizontalCollision = true
				this.wallHitXHorizontal = nextHorizontalX
				this.wallHitYHorizontal = nextHorizontalY
			}
			
			else{
				nextHorizontalX += this.xStep
				nextHorizontalY += this.yStep
			}
		}
									
		var verticalCollision = false
		
		this.xIntercept = Math.floor(this.x / this.tileSize) * this.tileSize

		if(!this.rotateCameraLeft){
			this.xIntercept += this.tileSize
		}

		var opposite = (this.xIntercept - this.x) * Math.tan(this.angle) 
		this.yIntercept = this.y + opposite

		// calculate each step's distance
		this.xStep = this.tileSize
		
		// if rotateCameraLeft, invert direction
		if(this.rotateCameraLeft){
			this.xStep *= -1
		}

		this.yStep = this.tileSize * Math.tan(this.angle)
		
		// control increment of Y if it's not inverted
		if((!this.moveBackwards && this.yStep > 0) || (this.moveBackwards && this.yStep < 0)){
			this.yStep *= -1
		}
		
		//add or remove extra pixel for intersection of squares
		
		var nextVerticalX = this.xIntercept
		var nextVerticalY = this.yIntercept
		
		
		// if aiming toward rotateCameraLeft, add extra pixel
		if(this.rotateCameraLeft)
			nextVerticalX--


		// look for collision point
		while(!verticalCollision && (
            nextVerticalX >= 0 && nextVerticalY >= 0 && nextVerticalX < main.canvasWidth && nextVerticalY < main.canvasHeight) ) {
			
			// get current square (round by moveBackwards)
			var tilePosX = parseInt( nextVerticalX / this.tileSize )		
			var tilePosY = parseInt( nextVerticalY / this.tileSize )		
			
			
			if(this.scenario.collision(tilePosX,tilePosY)){
				verticalCollision = true
				this.wallHitXVertical = nextVerticalX
				this.wallHitYVertical = nextVerticalY
			}
			else{
				nextVerticalX += this.xStep
				nextVerticalY += this.yStep
			}
		}		
		
		if(horizontalCollision){
			this.rayDistanceHorizontal = lineSegment(this.x, this.y, this.wallHitXHorizontal, this.wallHitYHorizontal)
		} else if (verticalCollision){
			this.rayDistanceVertical   = lineSegment(this.x, this.y, this.wallHitXVertical, this.wallHitYVertical)
		}
		
		if( this.rayDistanceHorizontal < this.rayDistanceVertical ){

			this.wallHitX     = this.wallHitXHorizontal
			this.wallHitY     = this.wallHitYHorizontal
			this.distance     = this.rayDistanceHorizontal
			
			var square        = parseInt(this.wallHitX / this.tileSize)
			this.pixelTexture = this.wallHitX - (square * this.tileSize)
			
			this.textureId    = this.scenario.tile(this.wallHitX, this.wallHitY)
		}
		else{

			this.wallHitX     = this.wallHitXVertical
			this.wallHitY     = this.wallHitYVertical
			this.distance     = this.rayDistanceVertical  
			
			var square        = parseInt(this.wallHitY / this.tileSize) * this.tileSize
			this.pixelTexture = this.wallHitY - square
			
			this.textureId    = this.scenario.tile(this.wallHitX, this.wallHitY)
		}		
	} 

	color(){
		// https://www.w3schools.com/colors/colors_shades.asp
		
		// 36 possible matrixes
		var step = 526344		// multiple of #080808 = 526344(decimal)
		
		var block = parseInt(main.canvasHeight / 36)
		var hue = parseInt(this.distance / block)
		var gray = hue * step

		var colorHex = "#" + gray.toString(16)		// convert to base 16 hex value
		
		return(colorHex)
	}	
	
	draw(){

		this.cast()
		
		
        // direction line
        var xDestination = this.wallHitX   
        var yDestination = this.wallHitY
        
        this.ctx.beginPath()
        this.ctx.moveTo(this.x, this.y)
        this.ctx.lineTo(xDestination, yDestination)
        this.ctx.strokeStyle = "red"
        this.ctx.stroke()
		
	}
}