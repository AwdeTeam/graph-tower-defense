import * as ex from "excalibur"
import * as utils from "./util"

export interface MusicCallbacks {
	addTimer: (timer: ex.Timer) => void
}


export class Song {
	sound: ex.Sound
	path: string
	time: number

	constructor(path: string, time: number, loader: ex.Loader)
	{
		this.path = "/static/assets/music/" + path
		this.time = time
		this.sound = new ex.Sound(this.path)
		loader.addResource(this.sound)
	}
}


export class MusicManager {
	songs: { [characterName: string]: Song }
	nextSong: Song
	callbacks: MusicCallbacks

	constructor(callbacks: MusicCallbacks) {
		this.callbacks = callbacks
		this.songs = {}
		this.nextSong = null
	}


	addResources(loader: ex.Loader)
	{
		console.log("Adding resources...")

		this.songs["base"] = new Song("base.mp3", 28800, loader)

		for (let i = 1; i < 8; i++)
		{
			this.songs[i + "_normal"] = new Song(i + "_normal.mp3", 28800, loader)
			this.songs[i + "_minus"] = new Song(i + "_minus.mp3", 28800, loader)
			this.songs[i + "_plus"] = new Song(i + "_plus.mp3", 28800, loader)
		}
		this.songs["ALL_normal"] = new Song("ALL_normal.mp3", 28800, loader)
		this.songs["ALL_minus"] = new Song("ALL_minus.mp3", 28800, loader)
		this.songs["ALL_plus"] = new Song("ALL_plus.mp3", 28800, loader)

		
		let nextName = this.chooseRandomSongName()
		console.log("Next:" + nextName)
		this.nextSong = this.songs[nextName]
	}


	playNextSong()
	{
		console.log("Playing " + this.nextSong.path + "...")
		this.nextSong.sound.play(.1)
		const timer = new ex.Timer({ fcn: () => { 
			this.playNextSong()
		}, interval: this.nextSong.time })
		this.callbacks.addTimer(timer)

		// randomization here
		this.nextSong = this.songs[this.chooseRandomSongName()]
	}

	chooseRandomSongName(): string
	{
		// choose variant
		let num = utils.randomNumber(1, 9)
		let numString = num.toString()
		if (num == 8) { numString = "ALL" }

		// choose pitch
		let pitch = utils.randomNumber(0, 3) 
		let pitchString = "normal"
		if (pitch == 0) { pitchString = "minus" }
		else if (pitch == 2) { pitchString = "plus" }

		return numString + "_" + pitchString
	}
}
