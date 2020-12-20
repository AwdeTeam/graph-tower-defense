import * as ex from "excalibur"

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
	}


	addResources(loader: ex.Loader)
	{
		console.log("Adding resources...")

		this.songs["base"] = new Song("base.mp3", 28800, loader)
		this.songs["1_normal"] = new Song("1_normal.mp3", 28800, loader)

		console.log(this.songs)

		
		this.nextSong = this.songs["base"]
	}

	playNextSong()
	{
		this.nextSong.sound.play()
		const timer = new ex.Timer({ fcn: () => { 
			console.log("Playing next song...")
			this.playNextSong()
		}, interval: this.nextSong.time})
		this.callbacks.addTimer(timer)

		// randomization here
		this.nextSong = this.songs["1_normal"]
	}
}
