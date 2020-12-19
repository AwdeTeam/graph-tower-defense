/*
 * index
 * ====================================================================================================
 *
 * The root of the application, sets up the window
 *
 * ----------------------------------------------------------------------------------------------------
 * 
 * **Created**
 *    2020-12-18
 * **Author**
 *    Darkar
 */

import * as $ from "jquery"

import {Game} from "./game/game"

class MainApp {
    applicationSection: JQuery<HTMLElement>
    gameCanvas: JQuery<HTMLCanvasElement>
    game: Game
    
    constructor () {
        this.applicationSection = $("#game")
    }

    clean () {
        this.applicationSection.empty()
        this.gameCanvas = $("canvas")
    }

    build () {
        this.applicationSection.append(this.gameCanvas)
    }

    setupGame () {
        this.game = new Game(this.gameCanvas[0])
    }

    start () {
        this.game.start()
    }

    async render () {
        console.log("Rendering document")
        this.clean()
        this.setupGame()
        this.build()
        this.start()
    }
}

function run () {
    let app: MainApp = new MainApp()
    app.render()
}

window.addEventListener("load", run)
