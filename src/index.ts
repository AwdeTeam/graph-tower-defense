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

class MainApp {
    applicationSection: JQuery<HTMLElement>
    gameCanvas: JQuery<HTMLCanvasElement>
    
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
        // TODO Make the game
    }

    async render () {
        console.log("Rendering document")
        this.clean()
        this.setupGame()
        this.build()
    }
}

function run () {
    let app: MainApp = new MainApp()
    app.render()
}

window.addEventListener("load", run)
