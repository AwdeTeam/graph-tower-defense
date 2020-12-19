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

import * as terrains from "./data/terrains.json"

export interface GridCallbacks {
    getActiveVisibleCoordinates: (x: number, y: number) => boolean
}

export class Grid extends ex.Actor {

	// array of squares
	squares: GridSquare[][]
	sizeX: number
	sizeY: number
	gridSize: number
    terrainGenerator: (square: GridSquare) => TerrainType
    callbacks: GridCallbacks
	
    constructor(sizeX: number, sizeY: number, gridSize: number,
        terrainGenerator: (square: GridSquare) => TerrainType,
        callbacks: GridCallbacks) {
		super({ x: 0, y: 0 })
		this.sizeX = sizeX
		this.sizeY = sizeY
		this.gridSize = gridSize
		this.squares = []
        this.terrainGenerator = terrainGenerator
        this.callbacks = callbacks
	}

	onInitialize() {
		// create list of gridsquares
		for (let x = 0; x < this.sizeX; x++)
		{
			this.squares[x] = []
			for (let y = 0; y < this.sizeY; y++)
			{
				let gridSquare: GridSquare = new GridSquare(x, y, this.gridSize, this.callbacks)
                gridSquare.terrain = new Terrain(this.terrainGenerator(gridSquare))
				this.squares[x][y] = gridSquare
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
    terrain: Terrain
	callbacks: GridCallbacks
	
	constructor(x: number, y: number, gridSize: number, callbacks: GridCallbacks) {
		super({x: x, y: y, width: gridSize, height: gridSize})
		this.x = x
		this.y = y
		this.gridSize = gridSize
		this.callbacks = callbacks
	}

	draw(ctx: CanvasRenderingContext2D, delta: number) {
		if (!this.callbacks.getActiveVisibleCoordinates(this.x, this.y)) {
			ctx.fillStyle = "#222"
			ctx.fillRect(this.x*this.gridSize, this.y*this.gridSize, this.gridSize, this.gridSize)
		}
		else if (this.terrain) {
            ctx.fillStyle = this.terrain.backgroundColorHexString
            ctx.fillRect(this.x*this.gridSize, this.y*this.gridSize, this.gridSize, this.gridSize)
        }
		ctx.strokeRect(this.x*this.gridSize, this.y*this.gridSize, this.gridSize, this.gridSize)
	}
}

interface TerrainType {
    backgroundColorHexString: string
    movementCost: number
    elevation: number
}

export class Terrain {
    backgroundColorHexString: string
    movementCost: number
    elevation: number

    constructor(terrain: TerrainType) {
        this.backgroundColorHexString = terrain.backgroundColorHexString
        this.movementCost = terrain.movementCost
        this.elevation  = terrain.elevation
    }
}

export const TerrainGenerators = {
    allFlat: (square: GridSquare): TerrainType => { return <TerrainType> terrains.flat },
    random: (square: GridSquare): TerrainType => {
        if (Math.random() > 0.5) {
            return <TerrainType> terrains.flat
        }
        return <TerrainType> terrains.hill
    }
}
