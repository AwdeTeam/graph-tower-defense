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
    getActiveVisibleCoordinates: (gridPosition: ex.Vector) => boolean
    getOffset: () => ex.Vector
}

export class Grid extends ex.Actor {

	// array of squares
	squares: GridSquare[][]
	size: ex.Vector
	cellSideLength: number
    terrainGenerator: (square: GridSquare) => TerrainType
    callbacks: GridCallbacks
	
    constructor(size: ex.Vector, cellSideLength: number,
        terrainGenerator: (square: GridSquare) => TerrainType,
        callbacks: GridCallbacks) {
		super({ x: 0, y: 0 })
		this.size = size
		this.cellSideLength = cellSideLength
		this.squares = []
        this.terrainGenerator = terrainGenerator
        this.callbacks = callbacks
	}

    mouseDownHandler(event: ex.Input.PointerDownEvent) {
        console.log(event)
        console.log(event.pos)
    }

	onInitialize() {
		// create list of gridsquares
		for (let x = 0; x < this.size.x; x++)
		{
			this.squares[x] = []
			for (let y = 0; y < this.size.y; y++)
			{
                let gridSquare: GridSquare = new GridSquare(new ex.Vector(x, y),
                    this.cellSideLength,
                    this.callbacks)
				gridSquare.enableCapturePointer = true
				gridSquare.capturePointer.captureMoveEvents = true
				gridSquare.on("pointerenter", gridSquare.pointerEnter)
				gridSquare.on("pointerleave", gridSquare.pointerLeave)
                gridSquare.terrain = new Terrain(this.terrainGenerator(gridSquare))
				this.squares[x][y] = gridSquare
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D, delta: number) {
		for (let x = 0; x < this.size.x; x++)
		{
			for (let y = 0; y < this.size.y; y++) 
			{
				this.squares[x][y].draw(ctx, delta)
			}
		}
	}
}

export class GridSquare extends ex.Actor { 
    gridPosition: ex.Vector
	cellSideLength: number
    terrain: Terrain
	callbacks: GridCallbacks
	borderColor: string
	
	constructor(gridPosition: ex.Vector, cellSideLength: number, callbacks: GridCallbacks) {
        let localPos = gridPosition.scale(cellSideLength)
		super({x: localPos.x, y: localPos.y, width: cellSideLength, height: cellSideLength})
        this.gridPosition = gridPosition
		this.cellSideLength = cellSideLength
		this.callbacks = callbacks

		this.enableCapturePointer = true
		this.borderColor = "#000"
		this.enableCapturePointer = true
	}

	pointerEnter(ev: any) {
		console.log("POINTER INSIDE")
		this.borderColor = "#00F"
	}
	
	pointerLeave(ev: any) {
		console.log("POINTER OUTSIDE")
		this.borderColor = "#000"
	}

    getLocalPosition(): ex.Vector {
        return this.gridPosition.scale(this.cellSideLength).add(this.callbacks.getOffset())
    }

	draw(ctx: CanvasRenderingContext2D, delta: number) {
        let localPos = this.getLocalPosition()
		if (!this.callbacks.getActiveVisibleCoordinates(this.gridPosition)) {
			ctx.fillStyle = "#222"
            ctx.fillRect(localPos.x, localPos.y, this.cellSideLength, this.cellSideLength)
		}
		else if (this.terrain) {
            ctx.fillStyle = this.terrain.backgroundColorHexString
            ctx.fillRect(localPos.x, localPos.y, this.cellSideLength, this.cellSideLength)
        }
		ctx.strokeStyle = this.borderColor
        ctx.strokeRect(localPos.x, localPos.y, this.cellSideLength, this.cellSideLength)
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
