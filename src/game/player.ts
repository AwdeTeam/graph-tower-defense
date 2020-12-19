/*
 * player
 * ====================================================================================================
 *
 * Player management
 *
 * ----------------------------------------------------------------------------------------------------
 * 
 * **Created**
 *    2020-12-18
 * **Author**
 *    Darkar
 */

import * as ex from "excalibur"

interface ResourceCollection {
    mana: number
}

interface MockTower {

}

enum MouseState{
    none=0,
    spawnRat=0
}

export class Player extends ex.Actor {
    id: number
    name: string
    resources: ResourceCollection
    ownedTowers: MockTower[]
	visibleCoordinates: [number, number][]

    constructor (id: number, name: string) {
        super()
        this.id = id
        this.name = name
        this.ownedTowers = []
        this.resources = {
            mana: 0,
        }
		this.visibleCoordinates = [[0, 0], [0, 1], [1, 0]]
    }

    public onPreUpdate(engine: ex.Engine, delta: number) {

    }
}
