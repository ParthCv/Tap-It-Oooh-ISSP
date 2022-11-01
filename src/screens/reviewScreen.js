import {LAYOUTS, SCREENS} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";

export default class ReviewScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.REVIEW;
        this.layoutName = LAYOUTS.FULL_SCREEN_CAMERA;
        this.preloadList.addLoad(async () => { await LayoutManagerInstance.createFullScreenCameraLayout(); });

        this.hostElement = document.querySelector('#reviewScreen');

        this.retryButton = document.querySelector('#reviewScreen #review_retry');
        this.retryButton.onclick = () => {
            this.runtime.getAnalyticService().replay();
            this.mainApp.goToGameplay();
        }

        this.nextButton = document.querySelector('#reviewScreen #review_done');
        this.nextButton.onclick = () => {
            this.mainApp.endModule();
        }
    }

    setScore(score) {
        document.querySelector('#reviewScore').innerText = score;
    }
}
