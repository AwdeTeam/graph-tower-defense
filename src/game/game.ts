/*
 * game
 * ====================================================================================================
 *
 * Core game object
 *
 * ----------------------------------------------------------------------------------------------------
 * 
 * **Created**
 *    2020-12-18
 * **Author**
 *    Darkar
 */

import * as ex from "excalibur"

import {Grid} from "./grid"

const defaultConfig = {
    display: {
        width: 800,
        height: 600,
    },
    game: {
        grid: {
            width: 10,
            height: 10,
            squareSize: 50,
        },
    }
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
        this.grid = new Grid(
            this.config.game.grid.width,
            this.config.game.grid.height,
            this.config.game.grid.squareSize
        )
		this.engine.add(this.grid)
    }

    start() {
        console.log("Starting game")
        this.engine.start()
    }
}
