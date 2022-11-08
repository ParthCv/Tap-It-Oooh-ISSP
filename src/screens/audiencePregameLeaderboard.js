import {LAYOUTS, SCREENS} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";


export default class AudiencePregameLeaderboard extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.PREGAME_LEADERBOARD;
        this.layoutName = LAYOUTS.TOP_HALF_CAMERA;
        this.preloadList.addLoad(async () => {
            await LayoutManagerInstance.createTopHalfCameraLayout();
        });
        this.preloadList.addLoad(async () => {
            // mainApp.leaderboard.initialize();
            await mainApp.leaderboard.preloadData();
        });

        this.hostElement = document.querySelector('#pregameLeaderboard');
        this.nextButton = document.querySelector('#pregameLeaderboard button');
        this.nextButton.onclick = () => {
            this.mainApp.goToTutorial();
        }
    }

    async show() {
        await super.show();
        const leaderboardContainer = document.querySelector('#pregameLeaderboard .leaderboard-container');
        // await mainApp.leaderboard.getPodiumEntires();
        await mainApp,leaderboard.showPreGame(leaderboardContainer);
        this.settingsSerive.showSystemSettings();
    }

    async hide(){
        await super.hide();
        this.settingsSerive.hideSystemSettings();
    }
}
