import * as consts from  "../const";
import {SOUNDS} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";
import * as util from "../util";


export default class GameplayScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.isCreatorMode = util.isCreatorMode(o3h);
        this.isAudienceMode = util.isAudienceMode(o3h);

        this.name = consts.SCREENS.GAMEPLAY;
        this.layoutName = this.isCreatorMode ? consts.LAYOUTS.FULL_SCREEN_CAMERA : consts.LAYOUTS.AUDIENCE_LAYOUT;

        
        this.fullscreenRecorder = null;

        this.assetManager = this.runtime.getAssetManager();

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addLoad(async () => {
            if(this.isCreatorMode) {
                await LayoutManagerInstance.createFullScreenCameraLayout();
            }

            this.fullscreenRecorder = await this.runtime.getControlManager().getFullScreenRecorder();
            
            if (this.isAudienceMode) {
                // this.replayData = this.assetManager.getInputAsset(consts.INPUT_OUTPUT_ASSETS.INPUT_REPLAY_DATA);

                // console.log('REPLAY DATA? ', this.replayData);
                // this.replayPlayer = await this.replayData.createReplayPlayer();

                // // TODO: sync with video per allan's comment:
                // /* "you can use the creator's video as the gameTimer object and the replay's will sync with the video content in the case that buffer or something cause the video playback time to be untrue to wall clock time." */
                // this.replayPlayer.timedEvent.add((replayEvent) => {
                //     this.onReplayEvent(replayEvent);
                // });
                this.creatorCameraVideoAsset = this.assetManager.getInputAsset(consts.INPUT_OUTPUT_ASSETS.INPUT_CREATOR_CAMERA);
                const creatorCameraURL = await this.creatorCameraVideoAsset.getVideoPath();
                const layout = await LayoutManagerInstance.createAudienceLayout(creatorCameraURL);
                
            }
        });

        this.hostElement = document.querySelector('#gameplayScreen');
    }

    async show() {
        await super.show();
        this.camera = LayoutManagerInstance.cameraComponent;
        if(this.isAudienceMode) {
            this.video =  LayoutManagerInstance.creatorVideoComponent;
        }
    }


    async onShowing() {
        SoundManagerInstance.stopSound(SOUNDS.BG_MUSIC);
        console.log("game screen");

        this.camera.startRecording();
        this.fullscreenRecorder.startRecording();

        if(this.isAudienceMode) {
            this.video.stop();
            this.video.seekVideo(0);
            this.video.start();
        }
        
        let cameraInstance = this.camera;
        let fullscreenRecorderInstance = this.fullscreenRecorder;
        let mainAppInstance = this.mainApp;

        let button = document.getElementById("game-button");
        let scoreElement = document.getElementById("score");

        function moveButton(){
            let x = Math.random() * 60;
            let y = Math.random() * 60;
            button.style.left = x + "%";
            button.style.top = y + "%";
        }

        function shrinkButton(scale) {
            button.style.transform = "scale( " + (scale) + " )";
        }

        // let score = 0;
        let score = 0;
        let scale = 1;

        let startedGame = false;
        let endGame = false;

        let endGamefunction = this.finishGame;

        async function startCountDown() {
            SoundManagerInstance.playSound(SOUNDS.BG_MUSIC);
            console.log("In startCountDown");
            const countDown = document.getElementById("game-countdown");
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
                            button.addEventListener("click", timerFunc)
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }
        startCountDown();

        async function startTimer(ms) {
            let startTime = new Date().getTime();
            let timerId = setInterval(async function() {
                let total = new Date().getTime() - startTime;
                let difference = ms - total;
                if (total < ms) {
                    document.getElementById("timer").innerHTML = "Timer: " + Math.floor(difference/1000);
                } else {
                    document.getElementById("timer").innerHTML = "Timer: 0";
                    endGame = true;
                    clearInterval(timerId);
                    // this.mainApp.endModule(score);

                    // this.mainApp.leaveGameplay(score);
                    await endGamefunction(mainAppInstance, cameraInstance, fullscreenRecorderInstance, score);
                }
            }, 1);
        }         

        async function timerFunc() {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            if(!startedGame) {                
                startTimer(5000000);
                startedGame = true;
            } else if (!endGame) {
                scoreElement.innerHTML = "Score: " + ++score;
                if (score > 20) 
                    moveButton();
                else if (score < 10) {
                    console.log("shrinking");
                    shrinkButton(scale);
                    scale -= 0.075;
                }
            }
            if(endGame){
                button.disabled = true;
            }
            localStorage.setItem("SCORE", score);
        }

        async function finishGame(mainAppInstance, cameraInstance, fullScreenRecorderInstance, score) {
            const camRecording = await cameraInstance.stopRecording();
            const fullScreenRecording = await fullScreenRecorderInstance.stopRecording();
    
            mainAppInstance.leaveGameplay(fullScreenRecording, camRecording, score);
        }
    }
}
