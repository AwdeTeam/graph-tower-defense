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
    placeOnGrid: (gridX: number, gridY: number) => ex.ActorArgs
}

export class Unit extends ex.Actor {
    public type: UnitType
    public health: number
    protected callbacks: UnitCallbacks

    constructor(
            gridX: number, gridY: number,
            type: UnitType,
            callbacks: UnitCallbacks) {
        super(callbacks.placeOnGrid(gridX, gridY))
        this.type = type
        this.callbacks = callbacks
    }

    public onInitialize() {
        this.addDrawing(this.callbacks.loadTexture(this.type))
    }
}

export interface CombatUnitCallbacks {
    findNearestOwned: (gridX: number, gridY: number, ownerID: number) => Unit
}

export class CombatUnit extends Unit {
    public damage: number
    public range: number
    public attRate: number
    public target: Unit
}

export interface MobileUnitCallbacks {
    
}
