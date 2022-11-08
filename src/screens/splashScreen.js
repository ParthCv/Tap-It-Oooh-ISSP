import {LAYOUTS, SCREENS, SOUNDS} from "../const";
import ScreenBase from "./screenBase";
import SoundManagerInstance from "../soundManager";
import LayoutManagerInstance from "../layoutManager";

export default class SplashScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.SPLASH;
        this.layoutName = LAYOUTS.HTML_ONLY;
        this.preloadList.addLoad(async () => { await LayoutManagerInstance.createEmptyLayout(); });

        this.preloadList.addHttpLoad('./fonts/Gotham-UltraItalic.otf');
        this.preloadList.addHttpLoad('./images/screens/splash.png');
        this.preloadList.addLoad(() => SoundManagerInstance.loadSound(SOUNDS.BG_MUSIC));

        this.hostElement = document.querySelector('#splashScreen');
        this.hostElement.onclick = () => {
            this.mainApp.leaveSplashScreen();
        }

        this.settingsService = this.runtime.getSystemSettingsService();
    }

    async show() {
        await super.show();
        SoundManagerInstance.playSound(SOUNDS.BG_MUSIC);
        this.settingsService.showSystemSettings();
    }

    async hide() {
        await super.hide();
        this.settingsService.hideSystemSettings();
    }
}
