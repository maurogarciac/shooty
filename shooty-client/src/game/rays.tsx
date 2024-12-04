import { Level } from "./level.tsx"
import { normalizeAngle } from "../App.tsx"


export class Ray {
	

    rayMaxLength: number                                        // max length of the ray
    rayStep: number                                          // step resolution of the ray (used to calculate collisions)
    ctx: CanvasRenderingContext2D
    scenario: Level
    map: number[][]
    tileSize: number
    x: number
    y: number
    angleIncrement: number
    playerAngle: number
    angle: number

    rayX: number
    rayY: number


	constructor(context: CanvasRenderingContext2D, scenario: Level, x: number, y: number, playerAngle: number, angleIncrement: number){

        this.rayMaxLength = 200
        this.rayStep = 1
		
		this.ctx = context
		this.scenario = scenario
        this.map = this.scenario.matrix

        this.tileSize = this.scenario.tileSize

		this.x = x
		this.y = y

        this.rayX = this.x
        this.rayY = this.y
		
		this.angleIncrement = angleIncrement
		this.playerAngle = playerAngle
		this.angle = playerAngle + angleIncrement
	}
	
	
	
	setAngle(angle: number){
		this.playerAngle = angle
		this.angle = normalizeAngle(angle + this.angleIncrement)  // angle has to be normalized to prevent negative values
	} 
	
	cast(){
	
        // get the ray's direction
        const dirX = Math.cos(this.angle)
        const dirY = Math.sin(this.angle)

        this.rayX = this.x
        this.rayY = this.y
    
        // cast the ray (step by step)
        for (let i = 0; i <= this.rayMaxLength; i += this.rayStep) {

            // move the ray one step in the direction of (dirX, dirY)
            this.rayX += this.rayStep * dirX
            this.rayY += this.rayStep * dirY  

            // convert ray position to map grid coordinates
            const gridX = Math.floor(this.rayX / this.tileSize)
            const gridY = Math.floor(this.rayY / this.tileSize)

            if (gridX < 0 || gridX >= this.scenario.mapWidth || gridY < 0 || gridY >= this.scenario.mapHeight) {
                //console.log("ray out of bounds")
                break                                             // ray is out of bounds, stop casting
            }

            // check for a wall collision
            if (this.map[gridY][gridX] === 1) {
                //console.log("ray collision")
                return                                            // draw the ray up to this collision
            }
        }
        
        // If no wall hit, draw the full ray length
        //console.log("full size ray")
        this.rayX = this.x + dirX * this.rayMaxLength
        this.rayY = this.y + dirY * this.rayMaxLength
	}
	
	draw(){

		this.cast()

		this.ctx.save()
        this.ctx.beginPath()
        this.ctx.moveTo(this.x, this.y)                         // start ray at player location
        this.ctx.lineTo(this.rayX, this.rayY)                   // cast the ray!
        this.ctx.strokeStyle = "lightgreen"
        this.ctx.stroke()
        this.ctx.restore()
	}
}