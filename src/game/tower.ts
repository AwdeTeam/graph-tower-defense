/*
 * unit
 * =========================
 * 
 * Basic class for towers
 * 
 * 
 * **Created**
 *    2020-12-19
 * **Author**
 *    Alex L.
 */
import * as ex from "excalibur"
import {ResType, Unit, UnitType} from "./unit"
import {GridSquare } from "./grid"


interface TowerType{
    sprite: string
    consumes: ResType
    conAmount: number
    produces: ResType
    proAmount: number
    stores: ResType
    stoAmount: number
    health: number
    damage: number
    range: number
    attRate:number
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
            //storTower needs to be informed what to store
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
            //drilTower needs to be informed what its producing
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