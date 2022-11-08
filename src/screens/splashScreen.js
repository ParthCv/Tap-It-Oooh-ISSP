import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class SplashScreen extends ScreenBase {
    constructor(app) {
        super("SplashScreen", document.querySelector("#splashScreen"), LAYOUTS.EMPTY_LAYOUT, app);

        // Show the tutorial screen when the player taps to continue with the module
        document.querySelector("#splashScreen button").addEventListener("click", () => {
            SoundManagerInstance.playSound(SOUNDS.BG_MUSIC);
            this.app.showTutorial();
        });
    

        // Pre-loads the button tap sound effect
        this.preloadList.addLoad(() => SoundManagerInstance.loadSound(SOUNDS.BG_MUSIC));

        // Fonts pre-loading in index.html

        // Pre-loads an empty layout in Oooh
        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

    }
}
