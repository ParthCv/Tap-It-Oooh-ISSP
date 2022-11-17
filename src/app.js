import {INPUT_OUTPUT_ASSETS, SCREENS, HAVE_WATCHED_TUTORIAL_SETTING, SOUNDS} from "./const";
import SplashScreen from "./screens/splashScreen";
import TutorialScreen from "./screens/tutorialScreen";
import {PreloadListLoader} from "./libs/Preloader";
import GameplayScreen from "./screens/gameplayScreen";
import ReviewScreen from "./screens/reviewScreen";
import AudiencePregameLeaderboard from "./screens/audiencePregameLeaderboard";
import AudiencePostgameLeaderboard from './screens/audiencePostgameLeaderboard';
import ScoreComparisonScreen from "./screens/scoreComparison";
import LayoutManagerInstance from "./layoutManager";
import ScreenManagerInstance from "./screenManager";
import Leaderboard from "./libs/leaderboard";
import SoundManagerInstance from './soundManager';
import VsScreen from "./screens/vsScreen";
import * as util from "./util";

export default class App {
    constructor(o3h) {
        this.o3h = o3h;
        this.runtime = o3h.Instance;

        // Change the viewport settings for the module iframe
        this.runtime.adjustViewport("device-width", "device-height");

        LayoutManagerInstance.initSingleton(o3h);
        // ScreenManagerInstance.setAnalyticService(this.runtime.getAnalyticService());

        this.score = 0;
        this.leaderboard = new Leaderboard(o3h);

        this.splashScreen = new SplashScreen(o3h, this);
        this.tutorialScreen = new TutorialScreen(o3h, this);

        this.gameplayScreen = new GameplayScreen(o3h, this);
        
        this.reviewScreen = new ReviewScreen(o3h, this);

        this.isCreatorMode = util.isCreatorMode(o3h);
        this.isAudienceMode = util.isAudienceMode(o3h);

        this.pregameLeaderboardScreen = new AudiencePregameLeaderboard(o3h, this);
        this.postgameLeaderboardScreen = new AudiencePostgameLeaderboard(o3h, this);

        // these 2 screens only happen in audience mode
        if (this.isAudienceMode){
            // this.pregameLeaderboardScreen = new AudiencePregameLeaderboard(o3h, this);
            this.vsScreen = new VsScreen(o3h, this);
            this.scoreCompareScreen = new ScoreComparisonScreen(o3h, this);
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
        // if (this.isAudienceMode) {
            allScreens.push(this.pregameLeaderboardScreen);
        // }
        allScreens.push(this.tutorialScreen);
        if (this.isAudienceMode) {
            allScreens.push(this.vsScreen);
        }
        allScreens.push(this.gameplayScreen);
        if (this.isAudienceMode) {
            // allScreens.push(this.scoreCompareScreen);
            allScreens.push(this.postgameLeaderboardScreen);

        }
        allScreens.push(this.reviewScreen);

        allScreens.forEach((s) => {
            ScreenManagerInstance.addScreen(s)
            this.listPreloader.addPreloadList(s.getPreloadList());
        });

        // don't await this, since we want it to kick off and run in the background
        // while user begins to use app.
        this.listPreloader.loadAll();

        // show the initial screen
        await ScreenManagerInstance.showScreen(SCREENS.SPLASH);
        SoundManagerInstance.setVolume(0.3);
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

        if (this.isAudienceMode) {
            await this.goToVs();
        }
        else {
            await this.goToGameplay();
        }
        //await this.goToGameplay();
    }

    async goToVs() {
        await ScreenManagerInstance.showScreen(SCREENS.VS);
    }

    async goToGameplay() {
        await ScreenManagerInstance.showScreen(SCREENS.GAMEPLAY);
    }

    //async leaveGameplay(fullScreenRecording, camRecording, replayData, score){
    async leaveGameplay(score){
        // this.fullScreenRecording = fullScreenRecording;
        // this.camRecording = camRecording;
        // this.replayData = replayData;

        this.score = score;//TODO: decide if we should allow negative scores or not: Math.max(0, score);    // protect against negative scores, which are possible if player is terrible
        this.reviewScreen.setScore(this.score);

        if (this.isCreatorMode) {
            this.goToReview();
        }
        else {
            // await ScreenManagerInstance.showScreen(SCREENS.SCORE_COMPARE);
            this.goToPostgameLeaderboard();
        }
    }
    async goToReview() {
        // const assetManager = this.runtime.getAssetManager();
        // assetManager.addToOutput(INPUT_OUTPUT_ASSETS.OUTPUT_FULLSCREEN_RECORDING, this.fullScreenRecording);

        // if (this.isCreatorMode) {
        //     assetManager.addToOutput(INPUT_OUTPUT_ASSETS.OUTPUT_REPLAY_DATA, this.replayData);
        // }

        ScreenManagerInstance.showScreen(SCREENS.REVIEW);
    }
    async goToPostgameLeaderboard() {
        await ScreenManagerInstance.showScreen(SCREENS.POSTGAME_LEADERBOARD);
    }

    async endModule() {
        this.runtime.completeModule({ score: this.score });
    }
}
