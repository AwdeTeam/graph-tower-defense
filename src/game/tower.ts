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
import {ResType, Unit, UnitType} from "./unit"
import {GridSquare } from "./grid"
import * as towers from "./data/towers.json"

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

    public sprite: string

    constructor(x: number, y: number, type: number, gridSize: number, gridSlot: GridSquare){
        super(x,y, type, gridSize);
        let protoTower;
        switch(this.type){
            case UnitType.contTower: {
                protoTower = <TowerType>towers.control;
                break;
            }
            case UnitType.wallTower: {
                protoTower = <TowerType>towers.wall;
                break;
            }
            //storTower needs to be informed what to store
            case UnitType.storTower: {
                protoTower = <TowerType>towers.storage;
                break;
            }
            case UnitType.watcTower: {
                protoTower = <TowerType>towers.watch;
                break;
            }
            //drilTower needs to be informed what its producing
            case UnitType.drilTower: {
                protoTower = <TowerType>towers.drill;
                break;
            }
            default: {
                alert("Error: Unknown tower type passed into GridTower constructor.")
                break;
            }
        }
        this.sprite = protoTower.sprite;
        this.consumes = protoTower.consumes;
        this.conAmount = protoTower.conAmount;
        this.produces = protoTower.produces;
        this.proAmount = protoTower.proAmount;
        this.stores = protoTower.stores;
        this.stoAmount = protoTower.stoAmount;
        this.health = protoTower.health;
        this.damage = protoTower.damage;
        this.range = protoTower.range;
        this.attRate = protoTower.attRate;
        if(type == UnitType.drilTower){
            //checks given GridSquare to determine resource to produce
        }else if(type == UnitType.storTower){
            //ask player what to store
        }
    }


}