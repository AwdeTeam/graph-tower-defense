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
    pointerOver: GridSquare
	
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

    getGridCell(pixelPosition: ex.Vector): GridSquare {
        let localPos = pixelPosition.scale(1/this.cellSideLength).add(this.callbacks.getOffset())
        let [x, y] = [Math.floor(localPos.x), Math.floor(localPos.y)]
        if (0 < x && x < this.squares.length && 0 < y && y < this.squares[x].length) {
            return this.squares[x][y]
        }
        return null
    }

    getGridPosition(gridPosition: ex.Vector): ex.Vector {
        return gridPosition.scale(this.cellSideLength).add(this.callbacks.getOffset())
    }

    placeOnGrid(gridPosition: ex.Vector): ex.Vector {
        return this.getGridPosition(gridPosition).add(ex.Vector.One.scale(this.cellSideLength/2))
    }

    mouseDownHandler(event: ex.Input.PointerDownEvent) {
        let cell = this.getGridCell(event.pos)
        if (cell) { cell.mouseDownHandler(event) }
    }

    mouseUpHandler(event: ex.Input.PointerUpEvent) {
        let cell = this.getGridCell(event.pos)
        if (cell) { this.getGridCell(event.pos).mouseUpHandler(event) }
    }

    mouseMoveHandler(event: ex.Input.PointerMoveEvent) {
        let cell = this.getGridCell(event.pos)
        if (!cell) { return }
        if (this.pointerOver && cell !== this.pointerOver) {
            this.pointerOver.mouseLeaveHandler(event)
        }
        cell.mouseEnterHandler(event)
        this.pointerOver = cell
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

    mouseDownHandler(event: ex.Input.PointerDownEvent) {
        console.log(this.gridPosition)
        this.borderColor = "#0FF"
    }

    mouseUpHandler(event: ex.Input.PointerUpEvent) {

    }

	mouseEnterHandler(event: ex.Input.PointerMoveEvent) {
		this.borderColor = "#00F"
	}
	
	mouseLeaveHandler(event: ex.Input.PointerMoveEvent) {
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
        ctx.strokeRect(localPos.x, localPos.y, this.cellSideLength-1, this.cellSideLength-1)
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
