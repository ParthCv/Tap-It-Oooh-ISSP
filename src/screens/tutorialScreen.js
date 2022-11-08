import "./styles/tutorialScreen.scss";
import ScreenBase from "./screenBase";

import * as consts from "../const";
import { isCreatorMode } from "../util";
import { LAYOUTS, SCREENS, SOUNDS} from "../const";
import LayoutManagerInstance from "../layoutManager";
import PersistentDataManagerInstance from "../persistentDataManager";
import SoundManagerInstance from "../soundManager";

export default class TutorialScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = consts.SCREENS.TUTORIAL;
        this.layoutName = consts.LAYOUTS.HTML_ONLY;
        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());


        this.preloadList.addHttpLoad('./images/screens/bg.png');

        this.hostElement = document.querySelector('#tutorialScreen');
        this.nextButton = document.querySelector('#tutorialScreen button');

        this.skipTutorial = false;
        this.nextButton.onclick = () => {
            this.skipTutorial = true;
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.mainApp.leaveTutorialScreen();
        }

        this.settingsService = this.runtime.getSystemSettingsService();
    }

    async onShowing() {
        console.log("Showing Tutorial");
        this.hostElement.classList.remove('hidden');
    }

    async show() {
        await super.show();
        this.settingsService.showSystemSettings();
    }

    async hide() {
        await super.hide();
        this.settingsService.hideSystemSettings();
    }

    // show() {
    //     super.show();
    //     // Shows the camera and audio on/off toggles to the user
    //     this.app.systemSettingsService.showSystemSettings();
    // }

    // hide() {        
    //     super.hide();

    //     // Set that the tutorial has been seen for this play mode
    //     const playMode = isCreatorMode() ? "creator" : "audience";
    //     PersistentDataManagerInstance.setSettingsDataProperty(`${playMode}_tutorial`, true);
    // }
}
