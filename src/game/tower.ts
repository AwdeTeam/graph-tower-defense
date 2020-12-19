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
import {ResType, Unit, UnitCallbacks, UnitType} from "./unit"
import {GridSquare } from "./grid"
import * as towers from "./data/towers.json"

interface TowerType{
    sprite: string
    consumeRes: ResType
    consAmount: number
    produceRes: ResType
    prodAmount: number
    storeRes: ResType
    storeMax: number
    health: number
    range: number
}

export class GridTower extends Unit{
    public consumeRes: ResType
    public consAmount: number

    public range: number
    public produceRes: ResType
    public prodAmount: number

    public storeRes: ResType
    public storeMax: number
    public storeCur: number

    public sprite: string

    constructor(gridX: number, gridY: number, type: UnitType, callbacks: UnitCallbacks){
        super(gridX,gridY, type, callbacks)
        let protoTower
        switch(this.type){
            case UnitType.contTower: {
                protoTower = <TowerType>towers.control
                break
            }
            case UnitType.wallTower: {
                protoTower = <TowerType>towers.wall
                break
            }
            //storTower needs to be informed what to store
            case UnitType.storTower: {
                protoTower = <TowerType>towers.storage
                break
            }
            case UnitType.watcTower: {
                protoTower = <TowerType>towers.watch
                break
            }
            //drilTower needs to be informed what its producing
            case UnitType.drilTower: {
                protoTower = <TowerType>towers.drill
                break
            }
            default: {
                alert("Error: Unknown tower type passed into GridTower constructor.")
                break
            }
        }
        this.sprite = protoTower.sprite
        this.consumeRes = protoTower.consumeRes
        this.consAmount = protoTower.consAmount
        this.produceRes = protoTower.produceRes
        this.prodAmount = protoTower.prodAmount
        this.storeRes = protoTower.storeRes
        this.storeMax = protoTower.storeMax
        this.storeCur = 0
        this.health = protoTower.health
        this.range = protoTower.range
        if(type == UnitType.drilTower){
            //checks given GridSquare to determine resource to produce
        }else if(type == UnitType.storTower){
            //ask player what to store
        }
    }

    //Fill in paramaters (like the graph or target) once more is determined
    towerUpdate(){
        if(this.prodAmount > 0){
            //check to see if a stockpile can store this
            //create and send to stockpile
            //else
            if(this.storeCur + this.prodAmount <= this.storeMax){
                this.storeCur += this.prodAmount
            }else{
                this.storeCur = this.storeMax
            }
        }
        //See if there is any excess that can be transferred
        if(this.storeCur > 0){
            //check graph for non-filled stockpiles or turrets
        }
    }
}