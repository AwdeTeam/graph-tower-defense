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
import * as ui from "./ui"

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

	ghostUnit: unit.Unit

	ts: ui.towerSelection
	windowHeight: number
	
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

		this.ghostUnit = null
    }


	initUI(engine: ex.Engine, height: number, width: number, callbacks: ui.UICallbacks)
	{
		this.ts = new ui.towerSelection(engine, height, width, callbacks)
		//engine.add(ts)
		this.windowHeight = height
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
        const panSpeed = 1 //TODO pull this into a config setting
        const panMove = new ex.Vector(0, 0)
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Up)) {
            panMove.y += 1
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Down)) {
            panMove.y -= 1
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Left)) {
            panMove.x += 1
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Right)) {
            panMove.x -= 1
        }
        this.panOffset = this.panOffset.add(panMove.scale(delta*panSpeed))
    }

	addUnit(unit: unit.Unit) { this.units.push(unit) }
	
	

	isCursorOverTS(pos: ex.Vector): boolean
	{
		return (pos.y > this.windowHeight - this.ts.height)
	}
	
    mouseDownHandler(event: ex.Input.PointerDownEvent) {
		let handled = false
		if (this.ts != undefined)
		{
			if (this.isCursorOverTS(event.pos))
			{
				//this.ts.mouseUpHandler(event)
				handled = true
			}
		}
		return handled
    }

    mouseUpHandler(event: ex.Input.PointerUpEvent) {
		let handled = false
		if (this.ts != undefined)
		{
			if (this.isCursorOverTS(event.pos))
			{
				this.ts.mouseUpHandler(event)
				handled = true
			}
		}
		return handled

    }

	mouseMoveHandler(event: ex.Input.PointerMoveEvent): boolean
	{
		let handled = false
		if (this.ts != undefined)
		{
			if (this.isCursorOverTS(event.pos))
			{
				this.ts.mouseMoveHandler(event)
				handled = true
			}
		}
		return handled
	}

	// mouseEnterHandler(event: ex.Input.PointerMoveEvent) {
	// 	this.ts.mouseEnterHandler(event)
	// }
	// 
	// mouseLeaveHandler(event: ex.Input.PointerMoveEvent) {
	// }
}
