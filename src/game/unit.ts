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
import { GridSquare } from "./grid"

enum UnitType {
    contTower = 0,
    wallTower,
    storTower,
    watcTower,
    drilTower,
    gunTower,
    basicUnit,
}

enum ResType{
    none = 0,
    iron,
}

class Unit extends ex.Actor{
    public type: UnitType
    public health: number
    public damage: number
    public range: number
    public attRate: number

    constructor(x: number, y: number, type: number, gridSize: number){
        super({x: x, y: y, width: gridSize, height: gridSize})
        this.type = type;
    }
}

export class GridTower extends Unit{
    public consumes: ResType
    public conAmount: number

    public produces: ResType
    public proAmount: number

    public stores: ResType
    public stoAmount: number

    constructor(x: number, y: number, type: number, gridSize: number, gridSlot: GridSquare){
        super(x,y, type, gridSize);
        switch(this.type){
            case UnitType.contTower: {
                this.health = 250;
                this.damage = 0;
                this.range = 4;
                this.attRate = 0;

                this.consumes = ResType.none;
                this.conAmount = 0;

                this.produces = ResType.none;
                this.proAmount = 0;

                this.stores = ResType.none;
                this.stoAmount = 0;
                break;
            }
            case UnitType.wallTower: {
                this.health = 500;
                this.damage = 0;
                this.range = 0;
                this.attRate = 0;

                this.consumes = ResType.none;
                this.conAmount = 0;

                this.produces = ResType.none;
                this.proAmount = 0;

                this.stores = ResType.none;
                this.stoAmount = 0;
                break;
            }
            case UnitType.storTower: {
                this.health = 100;
                this.damage = 0;
                this.range = 0;
                this.attRate = 0;

                this.consumes = ResType.none;
                this.conAmount = 0;

                this.produces = ResType.none;
                this.proAmount = 0;

                this.stores = ResType.iron;
                this.stoAmount = 200;
                break;
            }
            case UnitType.watcTower: {
                this.health = 100;
                this.damage = 0;
                this.range = 5;
                this.attRate = 0;

                this.consumes = ResType.none;
                this.conAmount = 0;

                this.produces = ResType.none;
                this.proAmount = 0;

                this.stores = ResType.none;
                this.stoAmount = 0;
                break;
            }
            case UnitType.drilTower: {
                this.health = 100;
                this.damage = 0;
                this.range = 0;
                this.attRate = 0;

                this.consumes = ResType.none;
                this.conAmount = 0;

                this.produces = ResType.iron;
                this.proAmount = 2;

                this.stores = ResType.iron;
                this.stoAmount = 20;
                break;
            }
            default: {
                alert("Error: Unknown tower type passed into GridTower constructor.")
                break;
            }
        }
    }


}