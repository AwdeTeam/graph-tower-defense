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

import * as player from "./player"
import * as grid from "./grid"
import * as unit from "./unit"
import * as textures from "./data/textures.json"
import {MusicManager} from "./music"

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

function loadTexture(filename: string, loader: ex.Loader): ex.Texture {
    let texture = new ex.Texture(filename)
    loader.addResource(texture)
    return texture
}

export class Game {
    config: any
    engine: ex.Engine
    assets: ex.Loader
    canvas: HTMLCanvasElement
	grid: grid.Grid
	activePlayer: player.Player
	aiPlayer: player.Player
	manager: MusicManager

    constructor(canvas: HTMLCanvasElement, config: any = defaultConfig) {
        console.log("Building game")
        this.config = config
        this.canvas = canvas
        this.engine = new ex.Engine({
            width: this.config.display.width,
            height: this.config.display.height,
            canvasElement: this.canvas,
        })
		this.activePlayer = new player.Player(0, "user")
        this.grid = new grid.Grid(
            this.config.game.grid.width,
            this.config.game.grid.height,
            this.config.game.grid.squareSize,
            grid.TerrainGenerators.random, 
			{ getActiveVisibleCoordinates: this.getActiveVisibleCoordinates.bind(this) }
        )
		this.engine.add(this.grid)

		this.assets = new ex.Loader()

		this.manager = new MusicManager( { addTimer: this.addTimer.bind(this) })
		this.manager.addResources(this.assets)

		// loop through dictionary and add to loader
		//this.resources = new Resources()
		//this.resources.addResources(this.assets)
    }

    start() {
        console.log("Starting game")
		// const baseSound = new ex.Sound('/static/assets/music/base.mp3')
		// this.assets.addResources([baseSound])
		// const timer = new ex.Timer({ fcn: () => { 
		// 	console.log("Hello there!")
		// 	baseSound.play()
		// }, interval: 28800 })
		// this.engine.add(timer)
		// console.log(timer)
        this.engine.start(this.assets).then(function () {
			// this.resources.sounds["baseSound"].play()
			// this.sounds["baseSound"] = new ex.Sound('/assets/music/base.mp3')
			//baseSound.play()
			this.manager.playNextSong()
		}.bind(this))
    }

	addTimer(timer: ex.Timer) { this.engine.add(timer) }

    getUnitTexture(type: unit.UnitType): ex.Texture {
        let texture: string = ""
        switch (type) {
            case unit.UnitType.contTower: {
                texture = textures.contTower
                break
            }
            case unit.UnitType.wallTower: {
                texture = textures.wallTower
                break
            }
            case unit.UnitType.storTower: {
                texture = textures.storTower
                break
            }
            case unit.UnitType.watcTower: {
                texture = textures.watcTower
                break
            }
            default: {
                texture = "box.png"
            }
        }
        return loadTexture(`/static/assets/image/${texture}`, this.assets)
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
