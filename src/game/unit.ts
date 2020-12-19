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

export enum UnitType {
    contTower = 0,
    wallTower,
    storTower,
    watcTower,
    drilTower,
    gunTower,
    basicUnit,
}

export enum ResType{
    none = 0,
    iron,
}

export interface UnitCallbacks {
    loadTexture: (type: UnitType) => ex.Texture
    placeOnGrid: (gridPosition: ex.Vector) => ex.ActorArgs
}

export class Unit extends ex.Actor {
    public type: UnitType
    public health: number
    public gridPosition: ex.Vector
    protected callbacks: UnitCallbacks

    constructor(
            gridPosition: ex.Vector,
            type: UnitType,
            callbacks: UnitCallbacks) {
        super(callbacks.placeOnGrid(gridPosition))
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
}

export class CombatUnit extends Unit {
    public damage: number
    public range: number
    public attRate: number
    public target: Unit
}

export interface MobileUnitCallbacks {
    getGridCellPos: (globalPosition: ex.Vector) => ex.Vector
}

export class MobileCombatUnit extends CombatUnit {
    public speed: number
    private static tolerance: 5 // Number of pixels we can be from the center to stop moving
    protected gridPathTarget: ex.Vector
    protected mobileCallbacks: MobileUnitCallbacks

    constructor(
        gridPosition: ex.Vector,
        type: UnitType,
        callbacks: UnitCallbacks,
        mobileCallbacks: MobileUnitCallbacks
    ) {
        super(gridPosition, type, callbacks)
        this.mobileCallbacks = mobileCallbacks
    }

    public onPostUpdate() {
        let targ = this.mobileCallbacks.getGridCellPos(this.gridPosition)
        let path = targ.sub(this.pos)
        if (path.magnitude() > MobileCombatUnit.tolerance) {
            this.vel = path.normalize().scale(this.speed)
        } else {
            this.vel = new ex.Vector(0, 0)
        }
    }
}
