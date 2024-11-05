import main, {normalizeAngle} from "./main.js"


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
		
		this.wallHitX = 0
		this.wallHitY = 0
		
		//these 4 zero values are all collisions 
		
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
		
        this.wallHitX = this.x + 100
        this.wallHitY = this.y * this.angle * 2

		// if(this.angle > Math.PI/2 && this.angle < 3 * Math.PI / 2){
        //     this.rotateCameraLeft = true
        // }
		  	
	}
	
	draw(){

		this.cast()

		this.ctx.save()
        this.ctx.beginPath()
        this.ctx.moveTo(this.x, this.y)               // player location btw
        this.ctx.lineTo(this.wallHitX, this.wallHitY) // cast a ray!
        this.ctx.strokeStyle = "lightgreen"
        this.ctx.stroke()
        this.ctx.restore()
		
	}
}