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
    loadTexture: (type: UnitType) => ex.Texture,
    placeOnGrid: (gridPosition: ex.Vector) => ex.ActorArgs
	getPlayerByID: (id: number) => player.Player
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
		let point1 = this.getPoint(this.unit1)
		let point2 = this.getPoint(this.unit2)
		ctx.moveTo(point1[0], point1[1])
		ctx.lineTo(point2[0], point2[1])
		ctx.lineWidth = 5
		ctx.stroke()
	}

	getPoint(unit: Unit) {

		let size = this.callbacks.getGridSize()
		let half = size / 2
		let x = unit.gridPosition.x * size + half
		let y = unit.gridPosition.y * size + half

		return [x, y]
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
        super(callbacks.placeOnGrid(gridPosition))
		this.playerID = playerID
        this.gridPosition = gridPosition
        this.type = type
        this.callbacks = callbacks
    }

    public onInitialize() {
        this.addDrawing(this.callbacks.loadTexture(this.type))
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

	constructor(playerID: number, gridPosition: ex.Vector, type: UnitType, unitCallbacks: UnitCallbacks, callbacks: CombatUnitCallbacks)
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
    }

    public onPostUpdate() {
        //let targ = this.mobileCallbacks.getGridCellPos(this.gridPosition)
		let targ = this.acquireTarget().gridPosition
        let path = targ.sub(this.pos)
        if (path.magnitude() > MobileCombatUnit.tolerance) {
            this.vel = path.normalize().scale(this.speed)
        } else {
            this.vel = new ex.Vector(0, 0)
        }
    }
}
