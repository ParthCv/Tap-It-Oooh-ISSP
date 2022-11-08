import ScreenManagerInstance from "./screenManager";
import RecordingManagerInstance from "./recordingManager";
import SoundManagerInstance from "./soundManager";

import SplashScreen from "./screens/splashScreen";
import TutorialScreen from "./screens/tutorialScreen";

import { PreloadListLoader } from "./libs/Preloader";

export default class TapItController {
    constructor() {
        this.runtime = o3h.Instance;
        // Change the viewport settings for the module iframe
        this.runtime.adjustViewport("device-width", "device-height");

        // Keep a reference to managers and services from the Oooh API
        this.assetManager = this.runtime.getAssetManager();
        this.inputManager = this.runtime.getInputManager();

        this.systemSettingsService = this.runtime.getSystemSettingsService();
        this.analyticService = this.runtime.getAnalyticService();

        
        // Create objects for each screen of the module
        this.splashScreen = new SplashScreen(this);
        this.tutorialScreen = new TutorialScreen(this);

        // Use another function for asynchronous 
        this.init();
    }

    async init() {
        // Add initialising the recording manager to the splash screen preload list
        console.log("TapItController.init()");
        this.splashScreen.getPreloadList().addLoad(
            () => RecordingManagerInstance.init(
                () => {
                    // Drop the mystery cover when recording starts
                    this.recordingScreen.dropMysteryCover();
                },
                () => {
                    // Prompt for review when recording stops
                    this.recordingScreen.reviewPhoto();
                })
            );

        // Start loading all of the assets for each screen in the background
        const listPreloader = new PreloadListLoader();
        listPreloader.addPreloadList(this.splashScreen.getPreloadList());
        listPreloader.addPreloadList(this.tutorialScreen.getPreloadList());

        // Asynchronously start loading the preload list for each screen in series
        listPreloader.loadAll();

        // Show the splash screen of the module and wait for its assets to load
        await ScreenManagerInstance.showScreen(this.splashScreen);
    
        // Now your module is ready to show to the player!
        this.runtime.ready(() => {
            // Start splash screen animation, music, etc.

        });
    }

    // Show the tutorial screen
    async showTutorial() {
        console.log("TapItController.showTutorial()");
        await ScreenManagerInstance.showScreen(this.tutorialScreen);
    }

    // Show the leaderboard screen
    async showLeaderboard() {
        console.log("TapItController.showLeaderboard()");
        await ScreenManagerInstance.showScreen(this.leaderboardScreen);
    }

}