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
import * as utils from "./util"

const defaultConfig = {
    display: {
        width: 800,
        height: 600,
    },
    game: {
        grid: {
            width: 16,
            height: 12,
            squareSize: 60,
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
	players: player.Player[]
	manager: MusicManager
	textures: ex.Texture[]
	shotTextures: ex.Texture[]

	cachedNearestOwned: {gridPosition: ex.Vector, ownerID: number, out: unit.Unit, ttl: number}[]

	debugHalt: boolean

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
		this.aiPlayer = new player.Player(1, "ai")
		this.players = []
		this.players.push(this.activePlayer)
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
		this.engine.add(this.grid)
        this.engine.add(this.activePlayer)

		this.assets = new ex.Loader()

		this.manager = new MusicManager( { addTimer: this.addTimer.bind(this) })
		this.manager.addResources(this.assets)

		this.loadTextures()
		this.setupInitialUnits()


		this.cachedNearestOwned = []
		
		this.debugHalt = false
		
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.setupHandlers()
    }

    setupHandlers() {
        this.engine.input.pointers.primary.on('down', this.mouseDownHandler)
        this.engine.input.pointers.primary.on('up', this.mouseUpHandler)
        this.engine.input.pointers.primary.on('move', this.mouseMoveHandler)
    }

    mouseDownHandler(event: ex.Input.PointerDownEvent) {
        this.grid.mouseDownHandler(event)
    }

    mouseUpHandler(event: ex.Input.PointerUpEvent) {
        this.grid.mouseUpHandler(event)
    }

    mouseMoveHandler(event: ex.Input.PointerMoveEvent) {
        this.grid.mouseMoveHandler(event)
    }

    start() {
        console.log("Starting game")
		this.loadTextures()
		this.setupInitialUnits()
        this.engine.start(this.assets).then(function () {
			this.manager.playNextSong()
		}.bind(this))
    }

	addTimer(timer: ex.Timer) { this.engine.add(timer) }

	
	


	// getGridCellPos(globalPosition: ex.Vector): ex.Vector
	// {
	// 		
	// }

	getActivePlayer(): player.Player
	{
		return this.activePlayer
	}

	getPlayerByID(id: number): player.Player
	{
		if (id == 1) { return this.aiPlayer }
		else { return this.activePlayer }
	}

	getOtherPlayer(myPlayer: player.Player): player.Player
	{
		// yep, this is bad, fix later
		if (myPlayer.id == 0) { return this.aiPlayer }
		else { return this.activePlayer }
	}

	findNearestOwned(gridPosition: ex.Vector, ownerID: number): unit.Unit
	{
		if (this.debugHalt) { return null }


		// search cache
		for (let i = this.cachedNearestOwned.length - 1; i >= 0; i--)
		{
			let entry = this.cachedNearestOwned[i]
			if (entry.gridPosition == gridPosition && entry.ownerID == ownerID)
			{
				if (entry.ttl > 0) 
				{ 
					entry.ttl--;
					return entry.out
				}
				else
				{
					// remove entry
					this.cachedNearestOwned.splice(i, 1)
				}
			}
		}

		
		
		// find player
		let player = null
		for (let i = 0; i < this.players.length; i++)
		{
			if (this.players[i].id == ownerID) {
				player = this.players[i]
				break
			}
		}

		// TODO: fog of war
		
		// ----
		// bfs
		// ----


		
		let frontier: ex.Vector[] = [gridPosition]
		let searched: ex.Vector[] = []


		let bfsIterations = 10
		while (bfsIterations > 0)
		{
			let removeFrontier: number[] = []

			// TODO: no checking for grid squares out of grid, minor perform optimization 
			
			// expand frontier
			let frontierLength = frontier.length
			for (let i = 0; i < frontierLength; i++) {
				let pos = frontier[i]
				//console.log("Expanding from " + pos.x.toString() + "," + pos.y.toString())

				let left = new ex.Vector(pos.x - 1, pos.y)
				let right = new ex.Vector(pos.x + 1, pos.y)
				let up = new ex.Vector(pos.x, pos.y + 1)
				let down = new ex.Vector(pos.x, pos.y - 1)

				if (!utils.isPosIn(left, searched) && !utils.isPosIn(left, frontier)) { 
					let newlen = frontier.push(left)
				}
				if (!utils.isPosIn(right, searched) && !utils.isPosIn(right, frontier)) {
					let newlen = frontier.push(right)
				}
				if (!utils.isPosIn(up, searched) && !utils.isPosIn(up, frontier)) {
					let newlen = frontier.push(up)
				}
				if (!utils.isPosIn(down, searched) && !utils.isPosIn(down, frontier)) {
					frontier.push(down)
				}
				
				searched.push(pos)
				removeFrontier.push(i)
			}
			
			// remove all previous frontier items
			for (let i = frontier.length - 1; i >= 0; i--)
			{
				if (removeFrontier.includes(i)) { frontier.splice(i, 1) }
			}
			

			// search frontier
			for (let i = 0; i < frontier.length; i++)
			{
				let out = player.checkForUnitOnSquare(frontier[i])
				if (out != null) 
				{ 
					// add new cache entry
					this.cachedNearestOwned.push({ 
						gridPosition: gridPosition, 
						ownerID: ownerID,
						out: out,
						ttl: 200
					})
					return out 
				}
			}
			bfsIterations--
		}
		this.cachedNearestOwned.push({ 
			gridPosition: gridPosition, 
			ownerID: ownerID,
			out: null,
			ttl: 200
		})
		
		return null
	}


	createUnit(p: player.Player, pos: ex.Vector, type: unit.UnitType)
	{
		let newUnit = null
		if (type == unit.UnitType.mob)
		{
			newUnit = new unit.MobileCombatUnit(p.id, pos, type, {
				loadTexture: this.getUnitTexture.bind(this),
				placeOnGrid: this.grid.placeOnGrid.bind(this.grid),
				getPlayerByID: this.getPlayerByID.bind(this),
				getGridSquareFromPosition: this.getGridSquareFromPosition.bind(this),
				shoot: this.shoot.bind(this),
			},
			{
				findNearestOwned: this.findNearestOwned.bind(this),
				getOtherPlayer: this.getOtherPlayer.bind(this)
			})
		}
		else
		{
			newUnit = new unit.Unit(p.id, pos, type, {
				loadTexture: this.getUnitTexture.bind(this),
				placeOnGrid: this.grid.placeOnGrid.bind(this.grid),
				getPlayerByID: this.getPlayerByID.bind(this),
				getGridSquareFromPosition: this.getGridSquareFromPosition.bind(this),
				shoot: this.shoot.bind(this),
			})
		}

		p.units.push(newUnit)
		this.engine.add(newUnit)
		return newUnit
	}
	

    setupInitialUnits() {
		let unit1 = this.createUnit(this.activePlayer, new ex.Vector(1,1), unit.UnitType.contTower)
		let unit2 = this.createUnit(this.activePlayer, new ex.Vector(6, 8), unit.UnitType.drilTower)

		let edge = new unit.Edge(unit1, unit2, { getGridSize: this.getGridSize.bind(this) })
		this.engine.add(edge)
		
		//let enemey1 = this.createUnit(this.aiPlayer, new ex.Vector(12, 5), unit.UnitType.mob)
		this.spawnEnemy()
    }

	spawnEnemy() {
		console.log("Spawned enemy")
		const timer = new ex.Timer({ fcn: () => { this.spawnEnemy() }, interval: 1000 })
		this.addTimer(timer)

		let x = utils.randomNumber(0,10)
		let y = utils.randomNumber(0,10)

		let enemey = this.createUnit(this.aiPlayer, new ex.Vector(x, y), unit.UnitType.mob)
	}

	loadTextures() {
		this.textures = []
		this.shotTextures = []

		this.textures[unit.UnitType.contTower] = loadTexture("tower_control.png", this.assets)
		this.textures[unit.UnitType.wallTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.storTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.watcTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.drilTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.gunTower] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.basicUnit] = loadTexture("tower_basic.png", this.assets)
		this.textures[unit.UnitType.mob] = loadTexture("Rat.png", this.assets)

		this.shotTextures[unit.ShotType.ratShot] = loadTexture("Rat_tail.png", this.assets)
		this.shotTextures[unit.ShotType.towerShot] = loadTexture("Projectile2.png", this.assets)
		this.shotTextures[2] = loadTexture("Rat_tail2.png", this.assets)
		this.shotTextures[3] = loadTexture("Rat_tailbig.png", this.assets)
	}

	getGridSize() { return this.config.game.grid.squareSize }

    getUnitTexture(type: unit.UnitType): ex.Texture {

		//if (this.textures.hasOwnProperty(type)) { return this.textures[type] }
		return this.textures[type]
    }
	getShotTexture(type: unit.ShotType): ex.Texture {
		if (type == unit.ShotType.ratShot)
		{
			let textureVersion = utils.randomNumber(0,3)
			if (textureVersion == 0) { return this.shotTextures[0] }
			else if (textureVersion == 1) { return this.shotTextures[2] }
			else if (textureVersion == 2) { return this.shotTextures[3] }
		}
		return this.shotTextures[type]
	}

	getGridSquareFromPosition(gridPosition: ex.Vector): grid.GridSquare
	{
		return this.grid.squares[gridPosition.x][gridPosition.y]
	}


	getActiveVisibleCoordinates(gridPosition: ex.Vector): boolean
	{
        if (!this.config.settings.fogOfWar) {
            return true
        }
		return utils.isPosIn(gridPosition, this.activePlayer.visibleCoordinates)
		// for (let i = 0; i < this.activePlayer.visibleCoordinates.length; i++) {
		// 	let square = this.activePlayer.visibleCoordinates[i]
		// 	if (square[0] == gridPosition.x && square[1] == gridPosition.y) { return true; }
		// }
		// return false
	}

    bulletCollision(pixelPosition: ex.Vector, damage: number) {
        let cell = this.grid.getGridCell(pixelPosition)
    }

	shoot(originatingUnit: unit.Unit, targetPos: ex.Vector)
	{
		let shotType = unit.ShotType.towerShot
		if (originatingUnit.type == unit.UnitType.mob)
		{
			shotType = unit.ShotType.ratShot
		}
		let shot = new unit.Shot(originatingUnit.pos, targetPos, originatingUnit.playerID, shotType, {
			loadShotTexture: this.getShotTexture.bind(this),
			getActivePlayer: this.getActivePlayer.bind(this),
            bulletCollision: this.bulletCollision.bind(this),
		})
		this.engine.add(shot)
	}
}
