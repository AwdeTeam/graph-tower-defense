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
import {Grid } from "./grid"

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

export class Unit extends ex.Actor{
    public type: UnitType
    public health: number
    public damage: number
    public range: number
    public attRate: number

    constructor(x: number, y: number, type: number, gridSize: number){
        super({x: x, y: y, width: gridSize, height: gridSize})
        this.type = type;
    }

    findNearestOwned(grid: Grid, owner: number): Unit {
        return null
    }
}