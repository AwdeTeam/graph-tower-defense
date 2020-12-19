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

    constructor(canvas: HTMLCanvasElement, config: any = defaultConfig) {
        console.log("Building game")
        this.config = config
        this.canvas = canvas
        this.engine = new ex.Engine({
            width: this.config.display.width,
            height: this.config.display.height,
            canvasElement: this.canvas,
        })
    }

    start() {
        console.log("Starting game")
        this.engine.start()
    }
}

export class Grid extends ex.ScreenElement {

	// array of squares
	squares: GridSquare[][]
	size_x: number
	size_y: number
	
	constructor(game: Game, size_x: number, size_y: number) {
		this.size_x = size_x
		this.size_y = size_y
		
	}

	onInitialize() {
		// create list of gridsquares
		for (let x = 0; x < this.size_x; x++)
		{
			for (let y = 0; y < this.size_y; y++)
			{
				let gs = GridSquare(x, y)
			}
		}
	}

	draw(ctx, delta) {

	}
	
}

export class GridSquare { 
	x: number
	y: number
	entities: ??[]
	
	constructor(x: number, y: number) {
		self.x = x
		self.y = y
	}
	
}
