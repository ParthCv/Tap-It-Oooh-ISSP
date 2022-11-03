import {sleepProg, hideElement, showElement} from './utils'

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
        this.totalTime = 10;
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
            this.fullScreenRecorder.startRecording();
            this.cameraComponent.startRecording();
            sleepProg(10000);

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

                case GameState.IntroCountdown:
                    this.enterInroCountdownState();
                    break;

                case GameState.GameIntro:
                    this.enterGameIntroState();
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
        hideElement("titleScreen")
        showElement("instructions")
        document.getElementById("start").onclick = () => {
            this.switchState(GameState.IntroCountdown);
        }
    }

    async enterInroCountdownState() {
        hideElement("instructions")
        await this.startCountDown().then(() => {
            showElement("game")
            const countDown = document.getElementById("game_start_timer");
            console.log("countDown: " + countDown);
        });
        await this.showSingleLayout().then(() => {
            this.switchState(GameState.GameIntro);
        });
        
    }

    
    async startCountDown() {
        console.log("In startCountDown");
        const countDown = document.getElementById("game_start_timer");
        countDown.innerHTML = "3";
        console.log("countDown: " + countDown.innerHTML);
        setTimeout(() => {
            countDown.innerHTML = "2";
            console.log("countDown: " + countDown.innerHTML);
            setTimeout(() => {
                countDown.innerHTML = "1";
                console.log("countDown: " + countDown.innerHTML);
                setTimeout(() => {
                    countDown.innerHTML = "GO!";
                    console.log("countDown: " + countDown.innerHTML);
                    setTimeout(() => {
                        countDown.innerHTML = "";
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 1000);
    }
    
    enterGameIntroState() {
        //this.startCamera();
        while (this.totalTime > 0) {
            this.totalTime--;
            console.log("Time: " + this.totalTime);
            sleepProg(1000);
        }
        const exitCondition = {
            score: this.totalScore
        };

        this.runtime.completeModule(exitCondition);

    }

}