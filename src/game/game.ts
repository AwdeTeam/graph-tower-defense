/*
 * game
 * ====================================================================================================
 *
 * description
 *
 * ----------------------------------------------------------------------------------------------------
 * 
 * **Created**
 *    2020-12-18
 * **Author**
 *    Darkar
 */

import * as ex from "excalibur"

const defaultConfig = {
    display: {
        width: 800,
        height: 600,
    },
}

export class Game {
    config: any
    engine: ex.Engine
    canvas: HTMLCanvasElement
	grid: Grid

    constructor(canvas: HTMLCanvasElement, config: any = defaultConfig) {
        console.log("Building game")
        this.config = config
        this.canvas = canvas
        this.engine = new ex.Engine({
            width: this.config.display.width,
            height: this.config.display.height,
            canvasElement: this.canvas,
        })
		this.grid = new Grid(this, 10, 10, 50)
		this.engine.add(this.grid)
    }

    start() {
        console.log("Starting game")
        this.engine.start()
    }
}

export class Grid extends ex.ScreenElement {

	// array of squares
	squares: GridSquare[][]
	sizeX: number
	sizeY: number
	gridSize: number
	
	constructor(game: Game, sizeX: number, sizeY: number, gridSize: number) {
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

export class GridSquare extends ex.ScreenElement { 
	x: number
	y: number
	gridSize: number
	//entities: ??[]
	
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
