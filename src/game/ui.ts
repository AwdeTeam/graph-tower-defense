import * as ex from "excalibur"
import * as unit from "./unit"

export interface UICallbacks {
	getUnitTexture: (type: unit.UnitType) => ex.Texture
}

export class towerSelection extends ex.ScreenElement
{
	bottom: number
	right: number
	callbacks: UICallbacks
	lbl: ex.Label
	drill: towerIcon
	control: towerIcon
	
	constructor(engine: ex.Engine, bottom: number, right: number, callbacks: UICallbacks)
	{
		super()
		this.bottom	= bottom
		this.right = right
		this.callbacks = callbacks

		engine.add(this)
		
		this.drill = new towerIcon(engine, 20, bottom-80, "driller", unit.UnitType.drilTower, callbacks)
		engine.add(this.drill)
		
		this.control = new towerIcon(engine, 100, bottom-80, "control", unit.UnitType.contTower, callbacks)
		engine.add(this.control)
	}

	
	draw(ctx: CanvasRenderingContext2D, delta: number) {
		ctx.fillStyle = 'rgba(150, 150, 150, .5)'
		ctx.fillRect(0, this.bottom-100, this.right, 100)
	}
	
	onInitialize()
	{
		//this.z = 40
	}
	
    mouseDownHandler(event: ex.Input.PointerDownEvent) {
        //this.hover = true
    }

    mouseUpHandler(event: ex.Input.PointerUpEvent) {

    }

	mouseEnterHandler(event: ex.Input.PointerMoveEvent) {
		this.drill.mouseEnterHandler(event)
		this.control.mouseEnterHandler(event)
	}
	
	mouseLeaveHandler(event: ex.Input.PointerMoveEvent) {
	}
}

export class towerIcon extends ex.ScreenElement 
{
	text: string
	type: unit.UnitType
	callbacks: UICallbacks
	lbl: ex.Label
	hover: boolean
	
	constructor(engine: ex.Engine, x: number, y: number, text: string, type: unit.UnitType, callbacks: UICallbacks)
	{
		super({x: x, y: y})
		this.text = text
		this.type = type
		this.callbacks = callbacks
		
		const lbl = new ex.Label({x: x, y: y + 80 })
		lbl.fontFamily = 'Arial'
		lbl.fontSize = 20
		lbl.text = text
		lbl.color = ex.Color.White
		this.lbl = lbl
		engine.add(lbl)

		this.enableCapturePointer = true
		this.on("pointerenter", this.mouseEnterHandler)

	}

	draw(ctx: CanvasRenderingContext2D, delta: number)
	{
		ctx.drawImage(this.callbacks.getUnitTexture(this.type).image, this.pos.x, this.pos.y)
		if (this.hover)
		{
			ctx.fillStyle = "#000"
			ctx.strokeRect(this.pos.x-10, this.pos.y-10, 80, 80)
		}
	}
	
	onInitialize()
	{
		this.lbl.z = 50000 // >:( #enraged
	}
	
    mouseDownHandler(event: ex.Input.PointerDownEvent) {
        //this.hover = true
    }

    mouseUpHandler(event: ex.Input.PointerUpEvent) {

    }

	mouseEnterHandler(event: ex.Input.PointerMoveEvent) {
		console.log("HOVERING")
		this.hover = true
	}
	
	mouseLeaveHandler(event: ex.Input.PointerMoveEvent) {
		this.hover = false
	}

}
