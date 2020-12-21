import * as ex from "excalibur"
import * as unit from "./unit"

export interface UICallbacks {
	getUnitTexture: (type: unit.UnitType) => ex.Texture
	createGhost: () => void
}

export class towerSelection extends ex.ScreenElement
{
	bottom: number
	right: number
	callbacks: UICallbacks
	lbl: ex.Label

	icons: towerIcon[]
	selectedIcon: towerIcon
	
	
	constructor(engine: ex.Engine, bottom: number, right: number, callbacks: UICallbacks)
	{
		super()
		this.bottom	= bottom
		this.right = right
		this.callbacks = callbacks
		this.height = 100

		engine.add(this)
		
		let drill = new towerIcon(engine, 20, bottom-80, "driller", unit.UnitType.drilTower, callbacks)
		engine.add(drill)
		
		let control = new towerIcon(engine, 100, bottom-80, "control", unit.UnitType.contTower, callbacks)
		engine.add(control)

		this.icons = []
		this.icons.push(drill)
		this.icons.push(control)
	}

	
	draw(ctx: CanvasRenderingContext2D, delta: number) {
		ctx.fillStyle = 'rgba(150, 150, 150, .5)'
		ctx.fillRect(0, this.bottom-this.height, this.right, this.height)
	}
	
	onInitialize()
	{
		//this.z = 40
	}

	mouseMoveHandler(event: ex.Input.PointerMoveEvent)
	{
		for (let i = 0; i < this.icons.length; i++)
		{
			let icon = this.icons[i]
			if (icon.isPosIn(event.pos)) { icon.hover = true }
			else { icon.hover = false }
		}
	}

	
    // mouseDownHandler(event: ex.Input.PointerDownEvent) {
    //     //this.hover = true
    // }

	deselectAllIcons()
	{
		for (let i = 0 ; i < this.icons.length; i++)
		{
			this.icons[i].selected = false
		}
	}

    mouseUpHandler(event: ex.Input.PointerUpEvent) {
		for (let i = 0; i < this.icons.length; i++)
		{
			let icon = this.icons[i]
			if (icon.isPosIn(event.pos)) {
				if (icon.selected)
				{
					this.deselectAllIcons()
					this.selectedIcon = null
				}
				else
				{
					this.deselectAllIcons()
					icon.selected = true
					this.selectedIcon = icon
				}
				this.callbacks.createGhost()
			}
		}
    }

	// mouseEnterHandler(event: ex.Input.PointerMoveEvent) {
	// 	this.drill.mouseEnterHandler(event)
	// 	this.control.mouseEnterHandler(event)
	// }
	// 
	// mouseLeaveHandler(event: ex.Input.PointerMoveEvent) {
	// }
}

export class towerIcon extends ex.ScreenElement 
{
	text: string
	type: unit.UnitType
	callbacks: UICallbacks
	lbl: ex.Label
	hover: boolean
	padding: number
	selected: boolean
	
	constructor(engine: ex.Engine, x: number, y: number, text: string, type: unit.UnitType, callbacks: UICallbacks)
	{
		super({x: x, y: y})
		this.text = text
		this.type = type
		this.callbacks = callbacks

		this.padding = 10
		
		const lbl = new ex.Label({x: x, y: y + 80 })
		lbl.fontFamily = 'Arial'
		lbl.fontSize = 20
		lbl.text = text
		lbl.color = ex.Color.White
		this.lbl = lbl
		engine.add(lbl)

		this.hover = false
		this.selected = false
	}

	draw(ctx: CanvasRenderingContext2D, delta: number)
	{
		ctx.drawImage(this.callbacks.getUnitTexture(this.type).image, this.pos.x, this.pos.y)
		if (this.hover)
		{
			ctx.strokeStyle = "#000"
			ctx.strokeRect(this.pos.x-this.padding, this.pos.y-this.padding, 60+this.padding*2, 60+this.padding*2)
		}
		if (this.selected)
		{
			ctx.strokeStyle = "#0FF"
			ctx.strokeRect(this.pos.x-this.padding, this.pos.y-this.padding, 60+this.padding*2, 60+this.padding*2)
		}
	}
	
	onInitialize()
	{
		this.lbl.z = 50000 // >:( #enraged
	}

	isPosIn(pos: ex.Vector): boolean
	{
		if (pos.x > (this.pos.x-this.padding) && 
		   pos.y > (this.pos.y-this.padding) &&
		   pos.x < (this.pos.x+60+this.padding) &&
		   pos.y < (this.pos.y+60+this.padding))
		{
			return true
		}
		return false
	}
}
