import main, {normalizeAngle} from "./main.js"


// ray distance


export class Ray {
	
	constructor(context, scenario, x, y, playerAngle, angleIncrement, column){

        this.rayLength = 400             // max length of the ray
        this.rayStep = 5                 // step resolution of the ray (used to calculate collisions)
		
		this.ctx = context
		this.scenario = scenario

        this.tileSize = this.scenario.tileSize

		this.x = x
		this.y = y
		
		this.angleIncrement = angleIncrement
		this.playerAngle = playerAngle
		this.angle = playerAngle + angleIncrement
	}
	
	
	// angle has to be normalized to prevent negative values
	setAngle(angle){
		this.playerAngle = angle
		this.angle = normalizeAngle(angle + this.angleIncrement)
	}
	
	cast(){
		
        this.rayX = this.x + Math.cos(this.angle) * this.rayLength
        this.rayY = this.y + Math.sin(this.angle) * this.rayLength

        // I guess just take the angle value, and like uhhh
	}
	
	draw(){

		this.cast()

		this.ctx.save()
        this.ctx.beginPath()
        this.ctx.moveTo(this.x, this.y)               // start ray at player location
        this.ctx.lineTo(this.rayX, this.rayY)         // cast the ray!
        this.ctx.strokeStyle = "lightgreen"
        this.ctx.stroke()
        this.ctx.restore()
		
	}
}