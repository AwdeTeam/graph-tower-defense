/*
 * game
 * ====================================================================================================
 *
 * description
 *
 * ----------------------------------------------------------------------------------------------------
 * 
 * **Created**
 *    2020-12-18
 * **Author**
 *    Darkar
 */

import * as ex from "excalibur"

const defaultConfig = {
    display: {
        width: 800,
        height: 600,
    },
}

export class Game {
    config: any
    engine: ex.Engine
    canvas: HTMLCanvasElement

    constructor (canvas: HTMLCanvasElement, config: any = defaultConfig) {
        console.log("Building game")
        this.config = config
        this.canvas = canvas
        this.engine = new ex.Engine({
            width: this.config.display.width,
            height: this.config.display.height,
            canvasElement: this.canvas,
        })
    }

    start () {
        console.log("Starting game")
        this.engine.start()
    }
}
