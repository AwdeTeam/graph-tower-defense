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

export interface ResourceCollection {
    resource: number
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
            resource: 0,
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

    onPreUpdate(engine: ex.Engine, delta: number) {
        const panSpeed = 1 //TODO pull this into a config setting
        const panMove = new ex.Vector(0, 0)
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Up) || engine.input.keyboard.isHeld(ex.Input.Keys.W)) {
            panMove.y += 1
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Down) || engine.input.keyboard.isHeld(ex.Input.Keys.S)) {
            panMove.y -= 1
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Left) || engine.input.keyboard.isHeld(ex.Input.Keys.A)) {
            panMove.x += 1
        }
        if (engine.input.keyboard.isHeld(ex.Input.Keys.Right) || engine.input.keyboard.isHeld(ex.Input.Keys.D)) {
            panMove.x -= 1
        }
        this.panOffset = this.panOffset.add(panMove.scale(delta*panSpeed))

		for (let i = this.units.length - 1; i >= 0; i--)
		{
			//let unit = this.units[i]
			if (this.units[i].dead)
			{
				console.log("Removing unit " + i.toString() + " for player " + this.id.toString())
				engine.remove(this.units[i])
				this.units.splice(i, 1)
			}
		}
    }

	addUnit(unit1: unit.Unit) { this.units.push(unit1) }
	
	

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
}
