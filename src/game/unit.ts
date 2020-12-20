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
	shoot: (originatingUnit: unit.Unit, targetPos: ex.Vector) => void
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
        this.traits = [] // Oh boy am I not a fan of this solution...
    }

    public getPixelPosition(): ex.Vector {
        return this.callbacks.placeOnGrid(this.gridPosition)
    }

    public onInitialize() {
        this.addDrawing(this.callbacks.loadTexture(this.type))
    }

    public onPostDraw() {
        this.pos = this.getPixelPosition()
        this.isOffScreen = false
        this.visible = true
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
	shotCooldown: number

    constructor(playerID: number, gridPosition: ex.Vector,
        type: UnitType, unitCallbacks: UnitCallbacks, callbacks: CombatUnitCallbacks)
	{
		super(playerID, gridPosition, type, unitCallbacks)
		this.combatUnitCallbacks = callbacks
		this.shotCooldown = 1000
	}

	acquireTarget(): unit.Unit
	{
		let targetUnit = this.combatUnitCallbacks.findNearestOwned(
			this.gridPosition, 
			this.combatUnitCallbacks.getOtherPlayer(this.callbacks.getPlayerByID(this.playerID)).id
		)

		return targetUnit
	}
	
    public onPostUpdate(engine: ex.Engine, delta: number) {
		let target = this.acquireTarget()
		if (target != null) 
		{ 
			let targetPos = target.gridPosition
			let shootingCoords = this.callbacks.placeOnGrid(targetPos)
			this.tryShoot(shootingCoords, delta)
		}
	}
	
	tryShoot(targetPos: ex.Vector, delta: number)
	{
		// can we shoot?
		this.shotCooldown -= delta
		if (this.shotCooldown > 0) { return }

		this.callbacks.shoot(this, targetPos)
		this.shotCooldown = 1000
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

	// returns true if already at target 
	moveTowardsTarget(targetPos: ex.Vector, delta: number): boolean
	{
		// can we move?
		this.movementCooldown -= delta
		if (this.movementCooldown > 0) { return false }

		// calculate path
        let diff = targetPos.sub(this.gridPosition)

		if (Math.abs(diff.x) + Math.abs(diff.y) <= 2) { return true; } // fire instead

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

		//this.movementCooldown = this.speed*this.callbacks.getGridSquareFromPosition(this.gridPosition).terrain.movementCost
		//let result = this.callbacks.placeOnGrid(this.gridPosition)
		//this.pos = new ex.Vector(result.x, result.y)
        this.movementCooldown = this.speed*
            this.callbacks.getGridSquareFromPosition(this.gridPosition).terrain.movementCost
		this.pos = this.callbacks.placeOnGrid(this.gridPosition)
		return false
	}

    public onPostUpdate(engine: ex.Engine, delta: number) {
		let target = this.acquireTarget()
		if (target != null) 
		{ 
			let targetPos = target.gridPosition
			let result = this.moveTowardsTarget(targetPos, delta)
			if (result)
			{
				let shootingCoords = this.callbacks.placeOnGrid(targetPos)
				this.tryShoot(shootingCoords, delta)
			}
		}
    }
}

export interface ShotCallbacks {
    loadShotTexture: (type: ShotType) => ex.Texture
	getActivePlayer: () => player.Player
    bulletCollision: (pixelPosition: ex.Vector, damange: number) => void
}

export enum ShotType {
    ratShot = 0,
    towerShot,
}

export class Shot extends ex.Actor
{
	ownerID: number
	type: ShotType
	callbacks: ShotCallbacks
	target: ex.Vector
	prevPanOffset: ex.Vector
	
    constructor(currentPos: ex.Vector, targetPos: ex.Vector, ownerID: number,
        type: ShotType, callbacks: ShotCallbacks)
	{
		let inbetween = targetPos.sub(currentPos)

		let inferiorRadians = inbetween.toAngle() + Math.PI / 2
		inbetween = inbetween.normalize().scale(100)
		
		super({x: currentPos.x, y: currentPos.y, rotation: inferiorRadians, vel: inbetween})
        this.target = targetPos
		this.ownerID = ownerID
		this.type = type
		this.callbacks = callbacks
		this.prevPanOffset = this.callbacks.getActivePlayer().panOffset
	}

	onInitialize() { this.addDrawing(this.callbacks.loadShotTexture(this.type)) }

    public onPostUpdate(engine: ex.Engine, delta: number) {
        const collisionDistance = 8

		let currentOffset = this.callbacks.getActivePlayer().panOffset
		let actualOffset = currentOffset.sub(this.prevPanOffset)
		this.pos = this.pos.add(actualOffset)
        this.target = this.target.add(actualOffset)
		this.prevPanOffset = currentOffset

        if (this.pos.sub(this.target).magnitude() < collisionDistance) {
            this.kill()
        }
    }

    public onPreKill() {
        this.callbacks.bulletCollision(this.pos, 1)
    }
}
