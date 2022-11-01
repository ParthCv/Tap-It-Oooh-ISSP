import {sleep} from './utils'

const GameState = Object.freeze({
    Boot: 'Boot',
    Title: 'Title',
    SkippableInstruction: 'SkippableInstruction',
    IntroWaitingForBody: 'IntroWaitingForBody',
    IntroCountdown: 'IntroCountdown',
    GameLoopInitialize: 'GameLoopInitialize',
    GameIntro: 'GameIntro',
    GameIdle: 'GameIdle',
    SquatPrompt: 'SquatPrompt',
    SquatDetect: 'SquatDetect',
    SquatResult: 'SquatResult',
    CompletionPrompt: 'CompletionPrompt',
    GameOverResults: 'GameOverResults',
    GameLeaderboard: 'GameLeaderboard',
});

export default class TapItController {
    constructor(instance) {
        this.runtime = instance;
        this.gameState = GameState.Boot;
        this.cameraComponent = {};
        this.videoComponent = {};

        this.replayRecorder = {};
        this.replayData = {};
        this.replayPlayer = {};

        this.cameraVideoAsset = null;
        this.screenVideoAsset = null;
        this.replayAsset = null;
        this.assetManager = null;

        this.recording = false;
        this.totalScore = 0;
        this.challengerTotalScore = 0;
        this.challengerScore = null;
    }

    async load() {
        this.fullScreenRecorder = await this.runtime.getControlManager().getFullScreenRecorder();
    }

    async showSingleLayout() {
        try {
            const cameraConfig = new o3h.CameraComponentConfig();
            cameraConfig.showRecordingUI = false;
            cameraConfig.resolutionScale = o3h.CameraResolutionScale.Full; // Full resolution
            cameraConfig.cameraType = o3h.CameraType.FrontFacing;

            const componentConfigs = {"main": cameraConfig};
            const layout = await this.runtime.createLayout("Full Screen", componentConfigs);

            this.cameraComponent = layout.getComponent("main");

            await layout.show();
        } catch (error) {
            console.log(error.message);
        }
    }

    async startCamera() {
        try {
            this.assetManager = await this.runtime.getAssetManager();
            this.fullScreenRecorder.startRecording();
            this.cameraComponent.startRecording();
            sleep(10000);

            this.screenVideoAsset = await this.fullScreenRecorder.stopRecording();
            this.cameraVideoAsset = await this.cameraComponent.stopRecording();
            
            // this.assetManager.addToOutput("screenVideo", this.screenVideoAsset);
            // this.assetManager.addToOutput("cameraVideo", this.cameraVideoAsset);
            this.screenVideoAsset.addToOutput("screenVideo");
            this.cameraVideoAsset.addToOutput("cameraVideo");
            
            const exitCondition = {
                score: this.totalScore
            };

            this.runtime.completeModule(exitCondition);
        } catch (error) {
            console.log("Error during start of game controller: " + error.message);
        }
    }

    async start() {
        try {
            this.switchState(GameState.Title);
        } catch (error) {
            console.log("Error during start of game controller: " + error.message);
        }
    }


    switchState(newState) {
        try {           
            console.log("Switching state: from " + this.gameState + " to: " + newState);
            this.gameState = newState;
            switch (newState) {
                case GameState.Title:
                    this.enterTitleState();
                    break;

                case GameState.SkippableInstruction:
                    this.enterInstructionsState();
                    break;

                case GameState.GameIntro:
                    this.enterGameIntroState();
                    break;
                
                case GameState.GameLeaderboard:
                    this.enterLeaderboardState();
                    break;

            }
        } catch (error) {
            console.log("An error in switching into state " + this.gameState + " error: " + error.message);
        }
    }
    
    enterTitleState() {
        // this.runtime.getSystemSettingsService().showSystemSettings();
        document.onclick = () => {
            document.onclick = null;
            this.switchState(GameState.SkippableInstruction);
        }
    }

    enterInstructionsState() {
        document.getElementById("titleScreen").style.display = "none";
        document.getElementById("instructions").style.display = "block";
        document.getElementById("start").onclick = () => {
            this.switchState(GameState.GameIntro);
        }
    }

    async enterGameIntroState() {
        document.getElementById("instructions").style.display = "none";
        document.getElementById("game").style.display = "block";
        await this.showSingleLayout();
        this.startCamera();
    }

    async enterLeaderboardState() {
        // To play ending song while displaying leaderboard
        // this.audioController.startEndMusic();
        this.finishRecording(true);

        document.getElementById("game").style.display = "none";
        document.getElementById("leaderboard").style.display = "block";
        document.getElementById("leaderboard").innerHTML = "Your score is: " + this.totalScore;


        document.getElementById("gameoverbutton").onclick = async () => {
            document.getElementById("gameoverbutton").onclick = null;

            await this.finishRecording(false);
            this.saveAssets();

            this.bodyPoseTracker.stop();

            const exitCondition = {
                score: this.totalScore
            };

            this.runtime.completeModule(exitCondition);
        };

        document.getElementById("retrybutton").onclick = async () => {
            document.getElementById("retrybutton").onclick = null;

            await this.finishRecording(false);
            await this.discardAssets();

            this.resetGame();
            document.getElementById("leaderboard").style.display = "none";

            this.switchState(GameState.GameIntro);
        };
    }

}