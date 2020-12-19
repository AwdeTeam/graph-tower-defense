/*
 * grid
 * ====================================================================================================
 *
 * Gameplay grid
 *
 * ----------------------------------------------------------------------------------------------------
 * 
 * **Created**
 *    2020-12-19
 * **Author**
 *    WildfireXIII
 */

import * as ex from "excalibur"

export class Grid extends ex.Actor {

	// array of squares
	squares: GridSquare[][]
	sizeX: number
	sizeY: number
	gridSize: number
	
	constructor(sizeX: number, sizeY: number, gridSize: number) {
		super({ x: 0, y: 0 })
		this.sizeX = sizeX
		this.sizeY = sizeY
		this.gridSize = gridSize
		this.squares = []
	}

	onInitialize() {
		// create list of gridsquares
		for (let x = 0; x < this.sizeX; x++)
		{
			this.squares[x] = []
			for (let y = 0; y < this.sizeY; y++)
			{
				let gs = new GridSquare(x, y, this.gridSize)
				this.squares[x][y] = gs
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D, delta: number) {
		for (let x = 0; x < this.sizeX; x++)
		{
			for (let y = 0; y < this.sizeY; y++) 
			{
				this.squares[x][y].draw(ctx, delta)
			}
		}
	}
	
}

export class GridSquare extends ex.Actor { 
	x: number
	y: number
	gridSize: number
	
	constructor(x: number, y: number, gridSize: number) {
		super({x: x, y: y, width: gridSize, height: gridSize})
		this.x = x
		this.y = y
		this.gridSize = gridSize
	}

	draw(ctx: CanvasRect, delta: number) {
		ctx.strokeRect(this.x*this.gridSize, this.y*this.gridSize, this.gridSize, this.gridSize)
	}
}
