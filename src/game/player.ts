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
import * as unit from "./unit"

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
    panOffset: ex.Vector
	visibleCoordinates: ex.Vector[]
	units: unit.Unit[]

    constructor (id: number, name: string) {
        super()
        this.id = id
        this.name = name
        this.ownedTowers = []
        this.resources = {
            mana: 0,
        }
		this.visibleCoordinates = [new ex.Vector(0,0)]
        this.panOffset = new ex.Vector(0, 0)
		this.units = []
    }

	checkForUnitOnSquare(square: ex.Vector): unit.Unit
	{
		for (let i = 0; i < this.units.length; i++)
		{
			if (this.units[i].gridPosition.equals(square)) { return this.units[i] }
		}
		return null
	}

    public onPreUpdate(engine: ex.Engine, delta: number) {
        const panSpeed = 4 //TODO pull this into a config setting
        const panMove = new ex.Vector(0, 0)
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Up)) {
            panMove.y += 1
            console.log("moving")
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Down)) {
            panMove.y -= 1
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Left)) {
            panMove.x -= 1
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Right)) {
            panMove.x += 1
        }
        this.panOffset = this.panOffset.add(panMove.scale(delta*panSpeed))
    }

	addUnit(unit: unit.Unit) { this.units.push(unit) }
}
