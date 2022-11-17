import {LAYOUTS, SCREENS, SOUNDS} from "../const";
import SoundManagerInstance from "../soundManager";
import ScreenBase from "./screenBase";

export default class ScoreComparisonScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.SCORE_COMPARE;
        this.layoutName = LAYOUTS.TOP_HALF_CAMERA;

        this.hostElement = document.querySelector('#scoreCompareScreen');
        this.hostElement.onclick = () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.mainApp.goToReview();
        }
    }

    async onShowing() {
        const leaderboardContainer = document.querySelector('#scoreCompareScreen .leaderboard-container');
        await mainApp.leaderboard.showPostGame(leaderboardContainer, 142);
    }
}
