import {INPUT_OUTPUT_ASSETS, SCREENS, HAVE_WATCHED_TUTORIAL_SETTING, SOUNDS} from "./const";
import SplashScreen from "./screens/splashScreen";
import TutorialScreen from "./screens/tutorialScreen";
import {PreloadListLoader} from "./libs/Preloader";
import GameplayScreen from "./screens/gameplayScreen";
import ReviewScreen from "./screens/reviewScreen";
import AudiencePregameLeaderboard from "./screens/audiencePregameLeaderboard";
// import ScoreComparisonScreen from "./screens/scoreComparison";
import LayoutManagerInstance from "./layoutManager";
import ScreenManagerInstance from "./screenManager";
// import LeaderboardData from "./libs/leaderboard";
import SoundManagerInstance from './soundManager';
import VsScreen from "./screens/vsScreen";
import * as util from "./util";
import { ACHIEVEMENT_TYPE, LeaderboardData, MockO3H } from './libs/leaderboard';
import Leaderboard from './libs/leaderboard_temp';

//create a new testa data for Mock03H class
const mockUser = {
    Name: 'testuser',
    AvatarImageUrl: 'http://placekitten.com/256/256',
    Level: 50,
    Type: 0, // 0 for audience, 1 for host
};

const entries = [];
for (let i = 1; i <= 15; i++){
entries.push({
    Rank: i,
    User: {
    Name: `player${i}`,
    AvatarImageUrl: 'http://placekitten.com/256/256',
    Level: 50,
    Type: 0,
    },
    Score: (16 - i) * 100,
    IsHost: false,
});
}
const mockO3H = new MockO3H(mockUser, entries);
export default class App {
    constructor(o3h) {
        this.o3h = o3h;
        this.runtime = o3h.Instance;

        // Change the viewport settings for the module iframe
        this.runtime.adjustViewport("device-width", "device-height");

        LayoutManagerInstance.initSingleton(o3h);
        // ScreenManagerInstance.setAnalyticService(this.runtime.getAnalyticService());

        this.score = 0;
        // const leaderboard = new LeaderboardData();
        // this.leaderboard = new LeaderboardData();
        this.leaderboard = new Leaderboard(o3h);


        this.splashScreen = new SplashScreen(o3h, this);
        this.tutorialScreen = new TutorialScreen(o3h, this);

        this.gameplayScreen = new GameplayScreen(o3h, this);
        this.reviewScreen = new ReviewScreen(o3h, this);

        this.isCreatorMode = util.isCreatorMode(o3h);
        this.isAudienceMode = util.isAudienceMode(o3h);

        // these 2 screens only happen in audience mode
        if (this.isAudienceMode){
            this.pregameLeaderboardScreen = new AudiencePregameLeaderboard(mockO3H, this);
            this.vsScreen = new VsScreen(o3h, this);
            // this.scoreCompareScreen = new ScoreComparisonScreen(o3h, this);
        }

        this.listPreloader = new PreloadListLoader();

        // some stuff we can't do in the constructor, since we need to await calls.
        // we'll do that stuff in init()
        this.doAsyncSetup();
    }

    async doAsyncSetup() {
        // need to init each screen. pregameLeaderboard and scoreCompare only happen in audience mode.
        const allScreens = []
        allScreens.push(this.splashScreen);
        if (this.isAudienceMode) {
            allScreens.push(this.pregameLeaderboardScreen);
        }
        allScreens.push(this.tutorialScreen);
        if (this.isAudienceMode) {
            allScreens.push(this.vsScreen);
        }
        allScreens.push(this.gameplayScreen);
        // if (this.isAudienceMode) {
        //     allScreens.push(this.scoreCompareScreen);
        // }
        // allScreens.push(this.reviewScreen);

        allScreens.forEach((s) => {
            ScreenManagerInstance.addScreen(s)
            this.listPreloader.addPreloadList(s.getPreloadList());
        });

        // don't await this, since we want it to kick off and run in the background
        // while user begins to use app.
        this.listPreloader.loadAll();

        // show the initial screen
        await ScreenManagerInstance.showScreen(SCREENS.SPLASH);
        SoundManagerInstance.playSound(SOUNDS.BG_MUSIC);
        // this will tell the client to show our app
        this.runtime.ready(this.onAppShowing);
    }

    async onAppShowing() {
        // app is showing now, do anything that was waiting for it to be visible
    }

    async leaveSplashScreen() {
        if (this.isAudienceMode) {
            await this.goToPregameLeaderboard();
        }
        else {
            await this.goToTutorial();
        }
    }

    async goToPregameLeaderboard() {
        await ScreenManagerInstance.showScreen(SCREENS.PREGAME_LEADERBOARD);
    }

    async goToTutorial() {
        // MUSTFIX: restore this, but need to test tutorial repeatedly on dev client, and there's no way to clear data right now
        /*
        const dataService = this.runtime.getUserPersistentDataService();
        const settings = await dataService.getSettingsDataAsync() || {};
        console.log('Current settings data', settings);

        if (HAVE_WATCHED_TUTORIAL_SETTING in settings) {
            return this.goToGameplay();
        }
        else {
         */
            await ScreenManagerInstance.showScreen(SCREENS.TUTORIAL);
        /*
        }
         */
    }

    async leaveTutorialScreen() {
        // const dataService = this.runtime.getUserPersistentDataService();
        // const settings = await dataService.getSettingsDataAsync() || {};
        // settings[HAVE_WATCHED_TUTORIAL_SETTING] = true;
        // dataService.setSettingsDataAsync(settings);
        // console.log('New settings data', settings);

        // if (this.isAudienceMode) {
        //     await this.goToVs();
        // }
        // else {
        //     await this.goToGameplay();
        // }
        await this.goToGameplay();
    }

    async goToVs() {
        await ScreenManagerInstance.showScreen(SCREENS.VS);
    }

    async goToGameplay() {
        await ScreenManagerInstance.showScreen(SCREENS.GAMEPLAY);
    }

    async leaveGameplay(fullScreenRecording, camRecording, replayData, score){
        this.fullScreenRecording = fullScreenRecording;
        this.camRecording = camRecording;
        this.replayData = replayData;
        this.score = score;//TODO: decide if we should allow negative scores or not: Math.max(0, score);    // protect against negative scores, which are possible if player is terrible
        this.reviewScreen.setScore(this.score);

        if (this.isCreatorMode) {
            this.goToReview();
        }
        else {
            ScreenManagerInstance.showScreen(SCREENS.SCORE_COMPARE);
        }
    }

    async goToReview() {
        const assetManager = this.runtime.getAssetManager();
        assetManager.addToOutput(INPUT_OUTPUT_ASSETS.OUTPUT_FULLSCREEN_RECORDING, this.fullScreenRecording);
        assetManager.addToOutput(INPUT_OUTPUT_ASSETS.OUTPUT_CAMERA, this.camRecording);
        if (this.isCreatorMode) {
            assetManager.addToOutput(INPUT_OUTPUT_ASSETS.OUTPUT_REPLAY_DATA, this.replayData);
        }

        await ScreenManagerInstance.showScreen(SCREENS.REVIEW);
    }

    async endModule() {
        this.runtime.completeModule({ score: this.score });
    }
}
