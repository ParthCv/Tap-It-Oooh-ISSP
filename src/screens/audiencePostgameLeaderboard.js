import {LAYOUTS, SCREENS, SOUNDS} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";

export default class AudiencePostgameLeaderboard extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.POSTGAME_LEADERBOARD;
        // this.layoutName = LAYOUTS.HTML_ONLY;
        // // this.preloadList.addLoad(async () => {
        // //     await LayoutManagerInstance.cr();
        // // });
        this.preloadList.addLoad(async () => {
            await mainApp.leaderboard.preloadData();
        });

        this.hostElement = document.querySelector('#postgameLeaderboard');
        // this.nextButton = document.querySelector('#postgameLeaderboard button');
        this.nextButton = document.getElementById('nextButton');
        this.retryButton = document.getElementById('retryButton');
        this.nextButton.onclick = () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            this.mainApp.endModule();
        }
        this.retryButton.onclick = () => {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);    
            this.mainApp.leaveTutorialScreen();
        }

        this.settingsService = this.runtime.getSystemSettingsService();
    }

    async show() {
        await super.show();
        const leaderboardContainer = document.querySelector('#postgameLeaderboard .leaderboard-container');
        let score = localStorage.getItem('SCORE')
        await mainApp.leaderboard.showPostGame(leaderboardContainer, score);
        this.settingsService.showSystemSettings();
    }

    async hide() {
        await super.hide();
    }
}
