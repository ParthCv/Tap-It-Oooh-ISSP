import {sleepProg, hideElement, showElement} from './utils'
import { PreloadList, PreloadListLoader } from './libs/Preloader';
import SoundManagerInstance from './soundManager';
import {SOUNDS} from "./const";

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
        this.totalTime = 10;
        this.challengerTotalScore = 0;
        this.challengerScore = null;

        
        this.preloadList = new PreloadList();
    }

    async load() {
        this.preloadList.addLoad(() => SoundManagerInstance.loadSound(SOUNDS.BG_MUSIC));
        this.fullScreenRecorder = await this.runtime.getControlManager().getFullScreenRecorder();

        // don't await this, since we want it to kick off and run in the background
        // while user begins to use app.
    
        this.preloadList.loadAll();
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
            //If timer reaches 0 then game over

            
            // this.screenVideoAsset = await this.fullScreenRecorder.stopRecording();
            // this.cameraVideoAsset = await this.cameraComponent.stopRecording();
            
            // // this.assetManager.addToOutput("screenVideo", this.screenVideoAsset);
            // // this.assetManager.addToOutput("cameraVideo", this.cameraVideoAsset);
            // this.screenVideoAsset.addToOutput("screenVideo");
            // this.cameraVideoAsset.addToOutput("cameraVideo");
            
            // const exitCondition = {
            //     score: this.totalScore
            // };

            // this.runtime.completeModule(exitCondition);
        } catch (error) {
            console.log("Error during start of game controller: " + error.message);
        }
    }

    async gameOver(){
        try{
            this.screenVideoAsset = await this.fullScreenRecorder.stopRecording();
            this.cameraVideoAsset = await this.cameraComponent.stopRecording();
            this.saveRecording();
            
        } catch (error) {
            console.log("Error during game over: " + error.message);
        }
    }

    async saveRecording(){
        try{
            // this.screenVideoAsset = await this.fullScreenRecorder.stopRecording();
            // this.cameraVideoAsset = await this.cameraComponent.stopRecording();
            
            // this.assetManager.addToOutput("screenVideo", this.screenVideoAsset);
            // this.assetManager.addToOutput("cameraVideo", this.cameraVideoAsset);
            this.screenVideoAsset.addToOutput("screenVideo");
            this.cameraVideoAsset.addToOutput("cameraVideo");
            
            const exitCondition = {
                score: this.totalScore
            };

            this.runtime.completeModule(exitCondition);
        } catch (error) {
            console.log("Error during save recording: " + error.message);
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
        SoundManagerInstance.playSound(SOUNDS.BG_MUSIC);
        document.onclick = () => {
            document.onclick = null;
            this.switchState(GameState.SkippableInstruction);
        }
    }

    enterInstructionsState() {
        hideElement("titleScreen")
        showElement("instructions")
        document.getElementById("titleScreen").style.display = "none";
        document.getElementById("game").style.display = "none";
        document.getElementById("leaderboard").style.display = "none";
        document.getElementById("instructions").style.display = "block";
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
    
    async enterGameIntroState() {
        document.getElementById("titleScreen").style.display = "none";
        document.getElementById("instructions").style.display = "none";
        document.getElementById("leaderboard").style.display = "none";
        document.getElementById("game").style.display = "block";
        await this.showSingleLayout();
        // this.startCamera();
        this.assetManager = await this.runtime.getAssetManager();
        this.fullScreenRecorder.startRecording();
        this.cameraComponent.startRecording();
        var counter = document.getElementById("button");
        var count = 0;
        var score = document.getElementById("score");

        const onclick_handler = () => {
            count += 1;
            score.innerHTML = "Score:" + "  "+ count + "";
        };

        const move_around = () => {
            var x = Math.floor(Math.random() * 500);
            var y = Math.floor(Math.random() * 500);
            counter.style.left = x + "px";
            counter.style.top = y + "px";
        };

        counter.onclick = onclick_handler; move_around();
        var timer = 60;

        var started = true;
        counter.addEventListener('click', function() {
            console.log(timer);
            if (started){
            var myInterval = window.setInterval(function(){
            if (timer > 0)
                timer--;
                document.getElementById("timer").innerHTML = "Timer: " + timer;
            if (timer <= 0) {
                counter.setAttribute("disabled", "");
                clearInterval(myInterval);
            }
            }, 1000);
            started = false;
        }
        });
        // document.getElementById("button").onclick = () => {
        //     this.switchState(GameState.GameLeaderboard);
        // }
    }

    async enterLeaderboardState() {
        // To play ending song while displaying leaderboard
        // this.audioController.startEndMusic();
        // this.finishRecording(true);

        document.getElementById("game").style.display = "none";
        document.getElementById("instructions").style.display = "none";
        document.getElementById("titleScreen").style.display = "none";
        document.getElementById("leaderboard").style.display = "block";
        document.getElementById("finalscore").innerHTML = "Your score is: " + this.totalScore;


        document.getElementById("gameoverbutton").onclick = () => {
            // document.getElementById("gameoverbutton").onclick = null;

            // await this.finishRecording(false);
            // this.saveAssets();

            // this.bodyPoseTracker.stop();

            // const exitCondition = {
            //     score: this.totalScore
            // };

            // this.runtime.completeModule(exitCondition);
            this.gameOver();
        };

        document.getElementById("retrybutton").onclick = async () => {
            document.getElementById("retrybutton").onclick = null;

            await this.finishRecording(false);
            await this.discardAssets();

            this.resetGame();
            document.getElementById("leaderboard").style.display = "none";

            this.switchState(GameState.GameIntro);
        };
        this.gameOver();
    }

}