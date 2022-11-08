import {LAYOUTS, SCREENS, SOUNDS} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class ReviewScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.REVIEW;
        this.layoutName = LAYOUTS.FULL_SCREEN_CAMERA;
        this.preloadList.addLoad(async () => { await LayoutManagerInstance.createFullScreenCameraLayout(); });

        this.hostElement = document.querySelector('#reviewScreen');

        this.retryButton = document.querySelector('#reviewScreen #review_retry');
        this.retryButton.onclick = () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.runtime.getAnalyticService().replay();
            this.mainApp.goToGameplay();
        }

        this.nextButton = document.querySelector('#reviewScreen #review_done');
        this.nextButton.onclick = () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.mainApp.endModule();
        }
    }

    setScore(score) {
        document.querySelector('#reviewScore').innerText = score;
    }
}
