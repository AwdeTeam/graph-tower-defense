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
    },
    settings: {
        fogOfWar: false,
    }
}

function loadTexture(filename: string, loader: ex.Loader): ex.Texture {
    let texture = new ex.Texture(`/static/assets/images/${filename}`)
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
	textures: ex.Texture[]

    constructor(canvas: HTMLCanvasElement, config: any = defaultConfig) {
        console.log("Building game")
        let self = this
        this.config = config
        this.canvas = canvas
        this.engine = new ex.Engine({
            width: this.config.display.width,
            height: this.config.display.height,
            canvasElement: this.canvas,
        })
		this.activePlayer = new player.Player(0, "user")
        this.grid = new grid.Grid(
            new ex.Vector(this.config.game.grid.width, this.config.game.grid.height),
            this.config.game.grid.squareSize,
            grid.TerrainGenerators.random, 
            {
                getActiveVisibleCoordinates: this.getActiveVisibleCoordinates.bind(this),
                getOffset: () => { return self.activePlayer.panOffset },
            }
        )

		this.grid.enableCapturePointer = true
		this.grid.on("pointerenter", function (ev) { console.log("Hello!") })
		this.engine.add(this.grid)
		this.engine.input.pointers.primary.on('move', function (evt) {console.log("things")})

		this.assets = new ex.Loader()

		this.manager = new MusicManager( { addTimer: this.addTimer.bind(this) })
		this.manager.addResources(this.assets)

		this.loadTextures()
		this.setupInitialUnits()
    }

    start() {
        console.log("Starting game")
        this.engine.start(this.assets).then(function () {
			this.manager.playNextSong()
		}.bind(this))
    }

	addTimer(timer: ex.Timer) { this.engine.add(timer) }

    setupInitialUnits() {
		let testUnit = new unit.Unit(new ex.Vector(0, 0), unit.UnitType.contTower, {
			loadTexture: this.getUnitTexture.bind(this),
			placeOnGrid: this.placeUnitOnGrid.bind(this)
		})
		
		let testUnit2 = new unit.Unit(new ex.Vector(6, 8), unit.UnitType.drilTower, {
			loadTexture: this.getUnitTexture.bind(this),
			placeOnGrid: this.placeUnitOnGrid.bind(this)
		})

		let edge = new unit.Edge(testUnit, testUnit2, { getGridSize: this.getGridSize.bind(this) })
		
		this.engine.add(testUnit)
		this.engine.add(testUnit2)
		this.engine.add(edge)
    }

	loadTextures() {
		this.textures = []

		this.textures[unit.UnitType.contTower] = loadTexture("tower_control.png", this.assets)
		this.textures[unit.UnitType.wallTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.storTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.watcTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.drilTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.gunTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.basicUnit] = loadTexture("tower_basic.png", this.assets)
	}

	getGridSize() { return this.config.game.grid.squareSize }

	placeUnitOnGrid(gridPosition: ex.Vector): ex.ActorArgs
	{
		let halfSize = this.config.game.grid.squareSize / 2
		let x = gridPosition.x * this.config.game.grid.squareSize + halfSize
		let y = gridPosition.y * this.config.game.grid.squareSize + halfSize
		console.log("x:" + x + " y:" + y)
		return { x: x, y: y }
	}

    getUnitTexture(type: unit.UnitType): ex.Texture {

		//if (this.textures.hasOwnProperty(type)) { return this.textures[type] }
		return this.textures[type]
		
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
        return loadTexture(`/static/assets/images/${texture}`, this.assets)
    }

	getActiveVisibleCoordinates(gridPosition: ex.Vector): boolean
	{
        if (!this.config.settings.fogOfWar) {
            return true
        }
		for (let i = 0; i < this.activePlayer.visibleCoordinates.length; i++) {
			let square = this.activePlayer.visibleCoordinates[i]
			if (square[0] == gridPosition.x && square[1] == gridPosition.y) { return true; }
		}
		return false
	}
}
