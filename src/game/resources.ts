import * as ex from "excalibur"

export class Resources {
	sounds: { [characterName: string]: ex.Sound }


	addResources(loader: ex.Loader)
	{
		console.log("Adding resources...")
		this.sounds["baseSound"] = new ex.Sound('/assets/music/base.mp3')

		for (const loadable in this.sounds) {
			if (this.sounds.hasOwnProperty(loadable)) {
				loader.addResource(this.sounds[loadable]);
			}
		}
	}
}
