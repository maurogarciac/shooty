const map = [
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
	tileSize = 50

export class Level {

	constructor(canvas, context){

		this.tileSize = tileSize;
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
		this.tileWidth = this.tileSize
		this.tileHeight = this.tileSize
		
	}
	
	
	collision(x, y){
		var crash = false
		console.log("y: " + y + " x: " + x)
		if((y >= this.mapHeight || x >= this.mapWidth) || (y < 0 || x < 0)){
			console.error("X or Y value outside of map grid: x=" + x + " y=" + y )
		} else {
			if( this.matrix[y][x] != 0){
				crash = true
			}
			return crash	
		}
		
	}
	
	
	tile(x, y){
		var tilePosX = parseInt(x / this.tileWidth)		
		var tilePosY = parseInt(y / this.tileHeight)	
		return(this.matrix[tilePosY][tilePosX])
	}
	
	draw(){
		
		var color

		for(var y=0; y < this.mapHeight; y++){
			for(var x=0; x < this.mapWidth; x++){
				
				if(this.matrix[y][x]!=0){
					color = '#000000'
				}
				else{
					color = '#666666'
				}
				this.ctx.fillStyle = color
				this.ctx.fillRect(x * this.tileWidth, y * this.tileHeight, this.tileWidth, this.tileHeight)
			}
		}
	}
}