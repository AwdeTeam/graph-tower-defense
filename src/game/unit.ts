/*
 * unit
 * =========================
 * 
 * Basic class for unit entities, includes
 * health tracking, damage, and other stats
 * 
 * Meant to be extended into GridTower and GridActor
 * 
 * **Created**
 *    2020-12-19
 * **Author**
 *    Alex L.
 */
import * as ex from "excalibur"
import * as player from "./player"
import * as unit from "./unit"
import * as grid from "./grid"

export enum UnitType {
    contTower = 0,
    wallTower,
    storTower,
    watcTower,
    drilTower,
    gunTower,
    basicUnit,
	mob,
}

export enum ResType{
    none = 0,
    iron,
}

export interface EdgeCallbacks {
	getGridSize: () => number
}

export interface UnitCallbacks {
    loadTexture: (type: UnitType) => ex.Texture
    placeOnGrid: (gridPosition: ex.Vector) => ex.Vector
	getPlayerByID: (id: number) => player.Player
	getGridSquareFromPosition: (gridPosition: ex.Vector) => grid.GridSquare
}

export class Edge extends ex.Actor {
	unit1: Unit
	unit2: Unit
	callbacks: EdgeCallbacks
	
	constructor(unit1: Unit, unit2: Unit, callbacks: EdgeCallbacks) {
		super()
		this.unit1 = unit1
		this.unit2 = unit2
		this.callbacks = callbacks
	}

	draw(ctx: CanvasRenderingContext2D, delta: number) {
		ctx.beginPath();
		let point1 = this.unit1.getPixelPosition()
		let point2 = this.unit2.getPixelPosition()
		ctx.moveTo(point1.x, point1.y)
		ctx.lineTo(point2.x, point2.y)
		ctx.lineWidth = 5
		ctx.stroke()
	}
}


export class Unit extends ex.Actor {
    public type: UnitType
    public health: number
    public gridPosition: ex.Vector
    callbacks: UnitCallbacks
	playerID: number // ?

    constructor(
			playerID: number,
            gridPosition: ex.Vector,
            type: UnitType,
            callbacks: UnitCallbacks) {
        let pixelPosition = callbacks.placeOnGrid(gridPosition)
        super({x: pixelPosition.x, y: pixelPosition.y})
		this.playerID = playerID
        this.gridPosition = gridPosition
        this.type = type
        this.callbacks = callbacks
    }

    public getPixelPosition(): ex.Vector {
        return this.callbacks.placeOnGrid(this.gridPosition)
    }

    public onInitialize() {
        this.addDrawing(this.callbacks.loadTexture(this.type))
    }

    public onPostDraw() {
        this.pos = this.getPixelPosition()
    }
}

export interface CombatUnitCallbacks {
    findNearestOwned: (gridPosition: ex.Vector, ownerID: number) => Unit
	getOtherPlayer: (myPlayer: player.Player) => player.Player
}

export class CombatUnit extends Unit {
    public damage: number
    public range: number
    public attRate: number
    public target: Unit
	combatUnitCallbacks: CombatUnitCallbacks

    constructor(playerID: number, gridPosition: ex.Vector,
        type: UnitType, unitCallbacks: UnitCallbacks, callbacks: CombatUnitCallbacks)
	{
		super(playerID, gridPosition, type, unitCallbacks)
		this.combatUnitCallbacks = callbacks
	}

	acquireTarget(): unit.Unit
	{
		let targetUnit = this.combatUnitCallbacks.findNearestOwned(
			this.gridPosition, 
			this.combatUnitCallbacks.getOtherPlayer(this.callbacks.getPlayerByID(this.playerID)).id
		)

		return targetUnit
	}
}


// export interface MobileUnitCallbacks {
//     getGridCellPos: (globalPosition: ex.Vector) => ex.Vector
// }

export class MobileCombatUnit extends CombatUnit {
    public speed: number
    private static tolerance: 5 // Number of pixels we can be from the center to stop moving
    protected gridPathTarget: ex.Vector
    //protected mobileCallbacks: MobileUnitCallbacks
	movementCooldown: number

    constructor(
		playerID: number,
        gridPosition: ex.Vector,
        type: UnitType,
        callbacks: UnitCallbacks,
		combatUnitCallbacks: CombatUnitCallbacks
        //mobileCallbacks: MobileUnitCallbacks
    ) {
        super(playerID, gridPosition, type, callbacks, combatUnitCallbacks)
        ///this.mobileCallbacks = mobileCallbacks
		this.speed = 1000
		this.movementCooldown = 1000
    }

    public onPostUpdate(engine: ex.Engine, delta: number) {
		let target = this.acquireTarget()
		if (target == null) { return }
		let targetPos = target.gridPosition

		// can we move?
		this.movementCooldown -= delta
		if (this.movementCooldown > 0) { return }

		// calculate path
        let diff = targetPos.sub(this.gridPosition)

		// TODO determine if in range to shoot

		// determine whether next movement is in x or y axis
		let movement = "y"
		if (Math.abs(diff.x) > Math.abs(diff.y)) { movement = "x" }

		// move left
		if (movement == "x" && diff.x < 0) {
			this.gridPosition.x -= 1
            this.rotation = 3/2*Math.PI
		}
		// move right
		else if (movement == "x" && diff.x > 0) {
			this.gridPosition.x += 1
            this.rotation = 1/2*Math.PI
		}
		// move up
		else if (movement == "y" && diff.y > 0) {
			this.gridPosition.y += 1
			this.rotation = Math.PI
		}
		// move down
		else if (movement == "y" && diff.y < 0) {
			this.gridPosition.y -= 1
			this.rotation = 0*Math.PI
		}

        this.movementCooldown = this.speed*
            this.callbacks.getGridSquareFromPosition(this.gridPosition).terrain.movementCost
		let result = this.callbacks.placeOnGrid(this.gridPosition)
		this.pos = new ex.Vector(result.x, result.y)
    }
}
