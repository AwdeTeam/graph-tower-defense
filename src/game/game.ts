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

import {Player} from "./player"
import {Grid, TerrainGenerators} from "./grid"
import {Resources} from "./resources"

const defaultConfig = {
    display: {
        width: 800,
        height: 600,
    },
    game: {
        grid: {
            width: 16,
            height: 12,
            squareSize: 50,
        },
    }
}

export class Game {
    config: any
    engine: ex.Engine
    assets: ex.Loader
    canvas: HTMLCanvasElement
	grid: Grid
	activePlayer: Player
	aiPlayer: Player
	resources: Resources

    constructor(canvas: HTMLCanvasElement, config: any = defaultConfig) {
        console.log("Building game")
        this.config = config
        this.canvas = canvas
        this.engine = new ex.Engine({
            width: this.config.display.width,
            height: this.config.display.height,
            canvasElement: this.canvas,
        })
		this.activePlayer = new Player(0, "user")
        this.grid = new Grid(
            this.config.game.grid.width,
            this.config.game.grid.height,
            this.config.game.grid.squareSize,
            TerrainGenerators.random, 
			{ getActiveVisibleCoordinates: this.getActiveVisibleCoordinates.bind(this) }
        )
		this.engine.add(this.grid)


		// loop through dictionary and add to loader
		this.resources = new Resources()
		this.resources.addResources(this.assets)
    }

    start() {
        console.log("Starting game")
        this.engine.start(this.assets).then(function () {
			this.resources.sounds["baseSound"].play()
		})
    }


	getActiveVisibleCoordinates(x: number, y: number): boolean
	{
		for (let i = 0; i < this.activePlayer.visibleCoordinates.length; i++) {
			let square = this.activePlayer.visibleCoordinates[i]
			if (square[0] == x && square[1] == y) { return true; }
		}
		return false
	}
}
