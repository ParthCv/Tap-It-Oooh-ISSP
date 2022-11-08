import {LAYOUTS, SCREENS, SOUNDS} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class AudiencePregameLeaderboard extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.PREGAME_LEADERBOARD;
        this.layoutName = LAYOUTS.TOP_HALF_CAMERA;
        this.preloadList.addLoad(async () => {
            await LayoutManagerInstance.createTopHalfCameraLayout();
        });
        this.preloadList.addLoad(async () => {
            await mainApp.leaderboard.preloadData();
        });

        this.hostElement = document.querySelector('#pregameLeaderboard');
        this.nextButton = document.querySelector('#pregameLeaderboard button');
        this.nextButton.onclick = () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.mainApp.goToTutorial();
        }
    }

    async show() {
        await super.show();
        const leaderboardContainer = document.querySelector('#pregameLeaderboard .leaderboard-container');
        await mainApp.leaderboard.showPreGame(leaderboardContainer);
    }
}
