import {LAYOUTS, SCREENS} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";

export default class SplashScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.SPLASH;
        this.layoutName = LAYOUTS.HTML_ONLY;
        this.preloadList.addLoad(async () => { await LayoutManagerInstance.createEmptyLayout(); });

        this.preloadList.addHttpLoad('./images/screens/splash.jpg');

        this.hostElement = document.querySelector('#splashScreen');
        this.hostElement.onclick = () => {
            this.mainApp.leaveSplashScreen();
        }

        this.settingsService = this.runtime.getSystemSettingsService();
    }

    async show() {
        await super.show();
        this.settingsService.showSystemSettings();
    }

    async hide() {
        await super.hide();
        this.settingsService.hideSystemSettings();
    }
}
