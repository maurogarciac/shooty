var canvas, 
	ctx, 
	scenario, 
	player, 
	canvasHeight, 
	canvasWidth,
	viewMode = 0, // Ray-casted = 0, Top-down map = 1
	map = [
		[1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,1,1,1],
		[1,0,0,0,0,0,0,1,1,1],
		[1,0,0,1,0,0,0,0,0,1],
		[1,0,1,1,1,0,0,0,0,1],
		[1,0,0,0,1,0,0,0,0,1],
		[1,0,0,0,1,0,0,1,1,1],
		[1,0,0,1,1,0,0,1,1,1],
		[1,0,0,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1,1,1]
	],
	ray, 
	tiles, 
	sprites = [],
	zBuffer = []	// z-buffer is an array with distance of each ray to every wall 

const tileSize = 50,
	FPS = 50,
	FOV = 60,
	FovInRadians = radianConvert(FOV)

// Match keyboard events

document.addEventListener('keydown', (event) => {

	console.log("captured keydown event " + event.key)

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

	console.log("captured keyup event " + event.key)
		
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

		case 32:
			changeViewMode()
		break
	}
})

function changeViewMode(){
	if(viewMode == 0)
		viewMode = 1
	else
		viewMode = 0
}

class Level {
	
	constructor(canvas ,context, map){
		this.canvas = canvas
		this.ctx = context
		this.matrix = map
		
    	// Map dimensions
		this.mapHeight  = this.matrix.length
		this.mapWidth = this.matrix[0].length
		
		// Canvas dimentions
		this.canvasHeight = this.canvas.height
		this.canvasWidth = this.canvas.width
		
		// Tile size
		this.tileHeight = tileSize
		this.tileWidth = tileSize
		
	}
	
	
	collision(x, y){
		var crash = false
		if(this.matrix[y][x]!=0)
			crash = true
		return crash	
	}
	
	
	tile(x, y){
		var tilePosX = parseInt(x/this.tileWidth)		
		var tilePosY = parseInt(y/this.tileHeight)	
		return(this.matrix[tilePosY][tilePosX])
	}
	
	draw(){
		
		var color

		for(var y=0; y<this.mapHeight; y++){
			for(var x=0; x<this.mapWidth; x++){
				
				if(this.matrix[y][x]!=0)
					color = '#000000'
				else
					color = '#666666'
				
				this.ctx.fillStyle = color
				this.ctx.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight)
			}
		}
	}
}

// normalize angle to prevent it from growing uncontrollably

function normalizeAngle(angle){
	angle = angle % (2 * Math.PI)
	
	if(angle < 0){
		angle = (2 * Math.PI) + angle	// if it's negative, turn around
	}
	
	return angle
}

function radianConvert(angle){
	angle = angle * (Math.PI / 180)
	return angle
}

function lineSegment(x1,y1,x2,y2){
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2-y1)*(y2-y1))
}

class Ray {
	
	constructor(context, scenario, x, y, playerAngle, angleIncrement, column){
		
		this.ctx = context
		this.scenario = scenario
  
		
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
		
		this.proyectionPlaneDistance = (canvasWidth/2) / Math.tan(FOV / 2)
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
							
		var horizontalCrash = false	// detect if there's a wall
		
		this.yIntercept = Math.floor(this.y / tileSize) * tileSize
		
		if(this.moveBackwards)
			this.yIntercept += tileSize
		
		var base = (this.yIntercept - this.y) / Math.tan(this.angle)
		this.xIntercept = this.x + base

		// calculate distance of every step
		this.yStep = tileSize
		this.xStep = this.yStep / Math.tan(this.angle)
		
		if(!this.moveBackwards)
			this.yStep = -this.yStep
		
		if((this.rotateCameraLeft && this.xStep > 0) || (!this.rotateCameraLeft && this.xStep < 0)){
			this.xStep *= -1
		}

		var siguienteXHorizontal = this.xIntercept
		var siguienteYHorizontal = this.yIntercept
		
		if(!this.moveBackwards)
			siguienteYHorizontal--

		while(!horizontalCrash){
			
			var tilePosX = parseInt(siguienteXHorizontal/tileSize)		
			var tilePosY = parseInt(siguienteYHorizontal/tileSize)		
			
			if(this.scenario.collision(tilePosX,tilePosY)){
				horizontalCrash = true
				this.wallHitXHorizontal = siguienteXHorizontal
				this.wallHitYHorizontal = siguienteYHorizontal
			}
			
			else{
				siguienteXHorizontal += this.xStep
				siguienteYHorizontal += this.yStep
			}
		}
									
		var choqueVertical = false
		
		this.xIntercept = Math.floor(this.x / tileSize) * tileSize

		if(!this.rotateCameraLeft){
			this.xIntercept += tileSize
		}

		var opuesto = (this.xIntercept - this.x) * Math.tan(this.angle) 
		this.yIntercept = this.y + opuesto

		// calculate each step's distance
		this.xStep = tileSize
		
		// if rotateCameraLeft, invert direction
		if(this.rotateCameraLeft){
			this.xStep *= -1
		}

		this.yStep = tileSize * Math.tan(this.angle)
		
		// control increment of Y if it's not inverted
		if((!this.moveBackwards && this.yStep > 0) || (this.moveBackwards && this.yStep < 0)){
			this.yStep *= -1
		}
		
		//add or remove extra pixel for intersection of squares
		
		var siguienteXVertical = this.xIntercept
		var siguienteYVertical = this.yIntercept
		
		
		// if aiming toward rotateCameraLeft, add extra pixel
		if(this.rotateCameraLeft)
			siguienteXVertical--


		// look for collision point
		while(!choqueVertical && (siguienteXVertical>=0 && siguienteYVertical>=0 && siguienteXVertical <canvasWidth && siguienteYVertical <canvasHeight)){
			
			// get current square (round by moveBackwards)
			var tilePosX = parseInt(siguienteXVertical/tileSize)		
			var tilePosY = parseInt(siguienteYVertical/tileSize)		
			
			
			if(this.scenario.collision(tilePosX,tilePosY)){
				choqueVertical = true
				this.wallHitXVertical = siguienteXVertical
				this.wallHitYVertical = siguienteYVertical
			}
			else{
				siguienteXVertical += this.xStep
				siguienteYVertical += this.yStep
			}
		}		
		
		// ray distance
		var distanceHorizontal = 100		
		var distanceVertical = 100
		
		if(horizontalCrash){
			distanceHorizontal = lineSegment(this.x, this.y, this.wallHitXHorizontal, this.wallHitYHorizontal)
		}
		
		if(choqueVertical){
			distanceVertical = lineSegment(this.x, this.y, this.wallHitXVertical, this.wallHitYVertical)
		}
		
		if(distanceHorizontal < distanceVertical){
			this.wallHitX = this.wallHitXHorizontal
			this.wallHitY = this.wallHitYHorizontal
			this.distance = distanceHorizontal
			
			var casilla = parseInt(this.wallHitX / tileSize)
			this.pixelTexture = this.wallHitX - (casilla * tileSize)
			
			this.textureId = this.scenario.tile(this.wallHitX, this.wallHitY)
		}
		else{
			this.wallHitX = this.wallHitXVertical
			this.wallHitY = this.wallHitYVertical
			this.distance = distanceVertical
			
			var casilla = parseInt(this.wallHitY / tileSize) * tileSize
			this.pixelTexture = this.wallHitY - casilla
			
			this.textureId = this.scenario.tile(this.wallHitX, this.wallHitY)
		}
		
		
		// correct fish-eye effect
		this.distance = this.distance * (Math.cos(this.playerAngle - this.angle))
		
		
		// save info in z-buffer
		zBuffer[this.column] = this.distance
		
		
	}

	color(){
		// https://www.w3schools.com/colors/colors_shades.asp
		
		// 36 possible matrixes
		var paso = 526344		// multiple of #080808 = 526344(decimal)
		
		var bloque = parseInt(canvasHeight/36)
		var matiz = parseInt(this.distance / bloque)
		var gris = matiz * paso

		var colorHex = "#" + gris.toString(16)		// convert to base 16 hex value
		
		return(colorHex)
	}	
	
	renderWall(){
		
		var tileHeight = 500 // wall render height

		var alturaMuro = (tileHeight / this.distance) * this.proyectionPlaneDistance
		
		// calculate start and end of line, then draw it
		var y0 = parseInt(canvasHeight/2) - parseInt(alturaMuro/2)
		var y1 = y0 + alturaMuro
		var x = this.column
		
		// vary with camera height
		
		var velocidad = 0.2
		var amplitud = 20
		
		var altura = 0
		
		var texturePixelHeight = 64 // draw textures
		
		var textureHeight = y0 - y1
		ctx.imageSmoothingEnabled = false
		ctx.drawImage(tiles,this.pixelTexture,((this.textureId -1 )*texturePixelHeight),this.pixelTexture,63,x,y1 + altura,1,textureHeight)	
		
	}
	
	draw(){

		this.cast()
		
		if(viewMode==0){
			this.renderWall()
		}
		
		if(viewMode == 1){
			// direction line
			var xDestino = this.wallHitX    
			var yDestino = this.wallHitY	
			
			this.ctx.beginPath()
			this.ctx.moveTo(this.x, this.y)
			this.ctx.lineTo(xDestino, yDestino)
			this.ctx.strokeStyle = "red"
			this.ctx.stroke()
		}
	}
}
 
class Player{
	
	constructor(con,scenario,x,y){
		
		this.ctx = con
		this.scenario = scenario
  
		this.x = x
		this.y = y
		
		this.move = 0 	                          // -1 = behind, 1 = forward
		this.rotate = 0 		                      // -1 = rotateCameraLeft, 1 = rotateCameraRight
		
		this.rotationAngle = 0
		
		this.rotationSpeed = radianConvert(3) 		// 3 degrees in radians
		this.movementSpeed = 3
		
		
		// first person renderer
		this.numRays = 500		                    // amount of rays casted (same as canvas width)
		this.Rays = []    		                    // array of rays
		
		
		// calculating the rays' angles	
		var angleIncrement	 = radianConvert(FOV / this.numRays)
		var initialAngle 	 = radianConvert(this.rotationAngle - FOV/2)
		
		var rayAngle = initialAngle
		
		// creating rays
		for(let i=0; i<this.numRays; i++){
			
			this.Rays[i] = new Ray(this.ctx, this.scenario, this.x, this.y, this.rotationAngle, rayAngle, i)

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
		var tilePosX = parseInt(x/this.scenario.tileWidth)
		var tilePosY = parseInt(y/this.scenario.tileHeight)
		
		if(this.scenario.collision(tilePosX, tilePosY))
			crash = true
		
		return crash
	}
	
	update(){

		//move
		
		var newX = this.x +this.move * Math.cos(this.rotationAngle) * this.movementSpeed
		var newY = this.y + this.move * Math.sin(this.rotationAngle) * this.movementSpeed
		
		if(!this.collision(newX,newY)){
			this.x = newX
			this.y = newY
		}
		
		// rotate
		this.rotationAngle += this.rotate * this.rotationSpeed
		this.rotationAngle = normalizeAngle(this.rotationAngle)
		
		
		// update rays
		for(let i=0; i<this.numRays; i++){
			this.Rays[i].x = this.x
			this.Rays[i].y = this.y
			this.Rays[i].setAngle(this.rotationAngle)
		}	
	}
	
	draw(){
		
		//update before drawing
		this.update()
		
		// draw rays
		for(let i=0; i<this.numRays; i++){
			this.Rays[i].draw()
		}

		if(viewMode == 1){
			// dot
			this.ctx.fillStyle = '#FFFFFF'
			this.ctx.fillRect(this.x-3, this.y-3, 6,6)
			
			
			// line parallel to player view
			var xDestino = this.x + Math.cos(this.rotationAngle) * 40
			var yDestino = this.y + Math.sin(this.rotationAngle) * 40	
			
			this.ctx.beginPath()
			this.ctx.moveTo(this.x, this.y)
			this.ctx.lineTo(xDestino, yDestino)
			this.ctx.strokeStyle = "#FFFFFF"
			this.ctx.stroke()
		}
	}
}



class Sprite{

	constructor(x, y, image){
		
		this.x 		 = x
		this.y 		 = y
		this.image   = image
		
		this.distance = 0
		this.angle  = 0
		
		this.visible = false
		
	}

	// calculate angle based on player
	calculateAngle(){
		var vectX = this.x - player.x
		var vectY = this.y - player.y
		

		var playerAngleObjeto = Math.atan2(vectY, vectX)
		var diferenciaangle = player.rotationAngle - playerAngleObjeto
		
		
		
		if (diferenciaangle < -3.14159)
			diferenciaangle += 2.0 * 3.14159
		if (diferenciaangle > 3.14159)
			diferenciaangle -= 2.0 * 3.14159
		
		
		diferenciaangle = Math.abs(diferenciaangle)
		

		if(diferenciaangle < FOV_medio)
			this.visible = true
		else
			this.visible = false
	}
	
	calculateDistance(){
		this.distance = lineSegment(player.x,player.y,this.x,this.y)
	}
	
	updateData(){
		this.calculateAngle()
		this.calculateDistance()
	}
	
	draw(){
		
		this.updateData()
		
		if(viewMode==1){
			ctx.fillStyle = '#FFFFFF'
			ctx.fillRect(this.x-3, this.y-3, 6,6)
		}

		if(this.visible == true){
      
      	const texturePixelHeight = 64,
			texturePixelWidth = 64,
		    tileHeight = 500														  // Sprite height after render

			var proyectionPlaneDistance = (canvasWidth/2) / Math.tan(FOV / 2)
			var spriteHeight = (tileHeight / this.distance) * proyectionPlaneDistance // get screen center
      
			// calculate where line starts and ends (vertically)
			var y0 = parseInt(canvasHeight/2) - parseInt(spriteHeight/2)
			var y1 = y0 + spriteHeight
					
			var textureHeight = y0 - y1
			var textureWidth = textureHeight										  // Sprites are meant to be square
			
			// calculate x coordinate of sprite
			var dx = this.x - player.x
			var dy = this.y - player.y
			
			var spriteAngle = Math.atan2(dy, dx) - player.rotationAngle
			
			var viewDist = 500
			

			console.log(proyectionPlaneDistance)
			
			var x0 = Math.tan(spriteAngle) * viewDist
			var x = (canvasWidth/2 + x0 - textureWidth/2)
			
			ctx.imageSmoothingEnabled = false
			
			
			// width proportions (closer we get, wider the vertical lines are)
			var columnWidth = textureHeight/texturePixelHeight	
			

			// draw sprite column to column to prevent it from being visible behind a wall
			
			for(let i=0; i< texturePixelWidth; i++){
				for(let j=0; j<columnWidth; j++){
					
					var x1 = parseInt(x+((i-1)*columnWidth)+j)	
					
					// compare current line with distance to zbuffer to decide if it's drawn
					if(zBuffer[x1] > this.distance){
						ctx.drawImage(this.image,i,0,1,texturePixelHeight-1,x1,y1,1,textureHeight)
					}
				}
			}	
		}
	}
}

// painter's algorithm btw

function renderSprites(){
  
	// array-sort by distance (descending order)
	// https://davidwalsh.name/array-sort

	sprites.sort(function(obj1, obj2) {
		// Ascending: obj1.distance - obj2.distance
		// Descending: obj2.distance - obj1.distance
		return obj2.distance - obj1.distance
	})

	//draw sprites one by one
	for(a=0; a<sprites.length; a++){
		sprites[a].draw()
	}

}

function init(){
  
	console.log("init started")
	canvas = document.getElementById('game')
	ctx = canvas.getContext('2d')
	
	tiles = new Image()
	tiles.src= "walls.png"

	// // get canvas coordinate offset from dom
	// const bodyRect = document.body.getBoundingClientRect(),
	// elemRect = canvas.getBoundingClientRect(),
	// offset_top   = elemRect.top - bodyRect.top,
	// offset_left  = elemRect.left - bodyRect.left

	// set canvas size (based on values hardcoded in css)
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight

	scenario = new Level(canvas, ctx, map)
	player = new Player(ctx, scenario, 100 ,100)
	

	// start the game loop
	setInterval(function(){gameLoop()},1000/FPS)

}

function clearCanvas(){
	canvas.width = canvas.width
	canvas.height = canvas.height
}

// paints basic colors for floor and ceiling
function drawFloorAndCeiling(){
	ctx.fillStyle = '#666666'
	ctx.fillRect(0, 0, 500, 250)
	
	ctx.fillStyle = '#752300'
	ctx.fillRect(0, 250, 500, 500)
	
}

function gameLoop(){
	clearCanvas()
	
	if(viewMode==1)
		scenario.draw()

	if(viewMode==0)
		drawFloorAndCeiling()
	
	player.draw()
	
	renderSprites()
}