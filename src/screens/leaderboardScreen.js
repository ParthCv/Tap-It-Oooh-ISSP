import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { isCreatorMode } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class LeaderboardScreen extends ScreenBase {
    constructor(app) {
        super("Leaderboard", document.querySelector("#leaderboard"), LAYOUTS.EMPTY_LAYOUT, app);

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());
    }

    show() {
        super.show();
        // Shows the camera and audio on/off toggles to the user
        this.app.systemSettingsService.showSystemSettings();
    }

    hide() {        
        super.hide();

        // Set that the tutorial has been seen for this play mode
        const playMode = isCreatorMode() ? "creator" : "audience";
        
    }
}
