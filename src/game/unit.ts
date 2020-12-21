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
    addToGrid: (unit: Unit, gridPosition: ex.Vector) => void
    moveOnGrid: (unit: Unit, oldPos: ex.Vector, newPos: ex.Vector) => void
	getPlayerByID: (id: number) => player.Player
	getGridSquareFromPosition: (gridPosition: ex.Vector) => grid.GridSquare
	shoot: (originatingUnit: unit.Unit, targetPos: ex.Vector) => void
	addEdge: (unit1: unit.Unit, unit2: unit.Unit) => void
	getEngine: () => ex.Engine
	removeAllEdgesFromUnit: (unit1: unit.Unit) => void
	removeLabel: (lbl: ex.Label) => void
	chooseRandomSquare: () => ex.Vector
}

export class Edge extends ex.Actor {
	unit1: Unit
	unit2: Unit
	callbacks: EdgeCallbacks
	ghost: boolean
	
	constructor(unit1: Unit, unit2: Unit, ghost: boolean, callbacks: EdgeCallbacks) {
		super()
		this.unit1 = unit1
		this.unit2 = unit2
		this.callbacks = callbacks
		this.ghost = ghost
	}

	draw(ctx: CanvasRenderingContext2D, delta: number) {
        if (this.unit1.health <= 0 || this.unit2.health <= 0) {
            return
        }
		ctx.beginPath();
		let point1 = this.unit1.getPixelPosition()
		let point2 = this.unit2.getPixelPosition()
		ctx.moveTo(point1.x, point1.y)
		ctx.lineTo(point2.x, point2.y)
		ctx.lineWidth = 5
		if (this.ghost) { ctx.strokeStyle = "rgba(0, 0, 0, .5)" }
		else {	ctx.strokeStyle = "rgba(0, 0, 0, 1.0)" }
		ctx.stroke()
	}
}


export class Unit extends ex.Actor {
    public type: UnitType
    public health: number
	public maxHealth: number
    public gridPosition: ex.Vector
    callbacks: UnitCallbacks
	playerID: number 
	ghost: boolean
	maxLinkDist: number
	dead: boolean
	edgeCount: number
	
	suppressCounts: boolean /// ?

	points: number
	resources: number
	lblPoints: ex.Label
	lblResources: ex.Label
	lblHealth: ex.Label

	regenCooldown: number
	

    constructor(
			playerID: number,
            gridPosition: ex.Vector,
            type: UnitType,
            callbacks: UnitCallbacks) {
        let pixelPosition = callbacks.placeOnGrid(gridPosition)
        super({x: pixelPosition.x, y: pixelPosition.y})
		this.playerID = playerID
		this.maxHealth = 20
        this.health = 20
        this.gridPosition = gridPosition
        this.type = type
        this.callbacks = callbacks
        this.callbacks.addToGrid(this, this.gridPosition)
        this.traits = [] // Oh boy am I not a fan of this solution...

		this.resources = 0
		this.points = 0

		if (this.playerID == -1) {
			this.ghost = true
			this.opacity = .5
		}
		else { this.ghost = false }


		this.maxLinkDist = 100
		if (this.type == UnitType.contTower)
		{
			this.maxLinkDist = 500
		}

		this.dead = false
		
		this.makeAvailableEdges()

		this.regenCooldown = 5000
    }

	
	destroy()
	{
		this.callbacks.removeAllEdgesFromUnit(this)
		this.callbacks.removeLabel(this.lblPoints)
		this.callbacks.removeLabel(this.lblResources)
		this.callbacks.removeLabel(this.lblHealth)
		this.dead = true
	}


	makeAvailableEdges()
	{
		if (this.type == UnitType.mob) 
		{ 
			this.edgeCount = -1
			return
		}

		this.edgeCount = 0
		
		let usePlayerID = this.playerID
		if (usePlayerID == -1) { usePlayerID = 0 } // (ghosts still need to show edges)
		let player = this.callbacks.getPlayerByID(usePlayerID)

		for (let i = 0; i < player.units.length; i++)
		{
			let u = player.units[i]
			if (u == this) { continue }
			let diff = this.pos.sub(u.pos)
			if (diff.size < this.maxLinkDist + u.maxLinkDist)
			{
				// make edge
				this.callbacks.addEdge(this, u)
				this.edgeCount++
			}
		}
	}

    public getPixelPosition(): ex.Vector {
        return this.callbacks.placeOnGrid(this.gridPosition)
    }

    public onInitialize() {
        this.addDrawing(this.callbacks.loadTexture(this.type))


		let lblR = new ex.Label({x: 0, y: 0})
		lblR.color = ex.Color.Orange
		this.lblResources = lblR

		let lblP = new ex.Label({x: 0, y: 0})
		lblP.color = ex.Color.Yellow
		this.lblPoints = lblP

		let lblH = new ex.Label({x: 0, y: 0})
		lblH.color = ex.Color.Red
		lblH.fontSize = 20
		this.lblHealth = lblH
		
		this.callbacks.getEngine().add(lblR)
		this.callbacks.getEngine().add(lblP)
		this.callbacks.getEngine().add(lblH)
    }

	public updateLbls()
	{
		if (this.ghost) { return }
		this.lblHealth.pos = this.pos.add(new ex.Vector(5, -5))
		this.lblHealth.text = this.health.toString()
		
		if ( this.type == UnitType.mob) { return }
		this.lblResources.pos = this.pos.add(new ex.Vector(15, 30))
		this.lblPoints.pos = this.pos.add(new ex.Vector(-30, 30))

		this.lblResources.text = this.resources.toString()
		this.lblPoints.text = this.points.toString()
	}


	checkHealth() { if (this.health <= 0) { this.destroy(); return false; } return true; }
	
	checkRegen(delta: number)
	{
		this.regenCooldown -= delta
		if (this.regenCooldown <= 0) { 
			if (this.health < this.maxHealth) { this.health++ }
			this.regenCooldown = 4000
		}
	}

    public onPostUpdate(engine: ex.Engine, delta: number) {
        if (!this.checkHealth()) { return }
		this.checkRegen(delta)

    }

    public onPostDraw(ctx: CanvasRenderingContext2D, delta: number) {
        this.pos = this.getPixelPosition()
        ctx.font = "30px Arial"
        ctx.fillStyle = "#F00"
        //ctx.fillText(`${this.health}`, 0, 0)
		this.updateLbls()
    }
}

export class DrillUnit extends Unit
{
	mineCooldown: number
	
    constructor(playerID: number, gridPosition: ex.Vector, type: UnitType, unitCallbacks: UnitCallbacks)
	{
		super(playerID, gridPosition, type, unitCallbacks)
		this.mineCooldown = 1000
		this.health = 5
		this.maxHealth = 5
	}

	onPostUpdate(engine: ex.Engine, delta: number)
	{
        if (!this.checkHealth()) { return }
		//this.checkRegen(delta)
		this.mineCooldown -= delta
		if (this.mineCooldown <= 0)
		{
			let gs = this.callbacks.getGridSquareFromPosition(this.gridPosition)
			if (gs.hasPoints) { this.points += 10 }
			if (gs.hasResource) { this.resources += 10 }
			this.mineCooldown = 1000
		}
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
	combatUnitCallbacks: CombatUnitCallbacks
	shotCooldown: number

    constructor(playerID: number, gridPosition: ex.Vector,
        type: UnitType, unitCallbacks: UnitCallbacks, callbacks: CombatUnitCallbacks)
	{
		super(playerID, gridPosition, type, unitCallbacks)
		this.combatUnitCallbacks = callbacks
		this.shotCooldown = 1000
		this.health = 5
		this.maxHealth = 5
	}

	acquireTarget(): unit.Unit
	{
		let targetUnit = this.combatUnitCallbacks.findNearestOwned(
			this.gridPosition, 
			this.combatUnitCallbacks.getOtherPlayer(this.callbacks.getPlayerByID(this.playerID)).id
		)
		if (targetUnit == null) { return null }
        // if (targetUnit.health <= 0) {
        //     return null
        // }

		return targetUnit
	}
	
    public onPostUpdate(engine: ex.Engine, delta: number) {
		if (this.ghost) { return }
        if (!this.checkHealth()) { return }
		this.checkRegen(delta)
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

		// ammo
		let cost = 1 // (harder version commented below)
		//let cost = this.callbacks.getPlayerByID(this.playerID).getNumGunTurrets()
		if (this.type != UnitType.mob)
		{
			if (this.resources < cost ) { return }
		}

		this.callbacks.shoot(this, targetPos)
		this.resources -= cost
		this.callbacks.getPlayerByID(this.playerID).redistributeResources()
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
		this.health = 5
    }

	// returns true if already at target 
	moveTowardsTarget(targetPos: ex.Vector, delta: number): boolean
	{
        let oldPosition = this.gridPosition
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

        this.callbacks.moveOnGrid(this, oldPosition, this.gridPosition)

		//this.movementCooldown = this.speed*this.callbacks.getGridSquareFromPosition(this.gridPosition).terrain.movementCost
		//let result = this.callbacks.placeOnGrid(this.gridPosition)
		//this.pos = new ex.Vector(result.x, result.y)
        this.movementCooldown = this.speed*
            this.callbacks.getGridSquareFromPosition(this.gridPosition).terrain.movementCost
		this.pos = this.callbacks.placeOnGrid(this.gridPosition)
		return false
	}

    public onPostUpdate(engine: ex.Engine, delta: number) {
        if (!this.checkHealth()) { return }
		let target = this.acquireTarget()
		if (target == null)
		{
			// get random square
			let targetPos = this.callbacks.chooseRandomSquare()
			this.moveTowardsTarget(targetPos, delta)
		}
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
