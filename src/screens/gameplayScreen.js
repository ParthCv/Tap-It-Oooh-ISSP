import * as consts from  "../const";
import {SOUNDS} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";


export default class GameplayScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = consts.SCREENS.GAMEPLAY;
        this.layoutName = consts.LAYOUTS.FULL_SCREEN_CAMERA;

        this.fullscreenRecorder = null;
        this.camera = null;

        this.assetManager = this.runtime.getAssetManager();

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());

        this.preloadList.addLoad(async () => {
            await LayoutManagerInstance.createFullScreenCameraLayout();
            this.fullscreenRecorder = await this.runtime.getControlManager().getFullScreenRecorder();
        });


        this.hostElement = document.querySelector('#gameplayScreen');
    }

    async show() {
        await super.show();
        this.camera = LayoutManagerInstance.cameraComponent;
    }

    async onShowing() {
        console.log("game screen");

        this.camera.startRecording();
        this.fullscreenRecorder.startRecording();

        let button = document.getElementById("game-button");
        let scoreElement = document.getElementById("score");

        // let score = 0;
        let score = 0;
        let startedGame = false;
        let endGame = false;

        let endGamefunction = this.finishGame;

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

                    this.mainApp.leaveGameplay(score);
                    // await endGamefunction(score);
                }
            }, 1);
        }         

        button.addEventListener("click", function() {
            SoundManagerInstance.playSound(SOUNDS.SFX_BUTTON_TAP);
            if(!startedGame) { 
                startTimer(5000);
                startedGame = true;
            } else if (!endGame) {
                scoreElement.innerHTML = "Score: " + ++score;
            }

            if(endGame){
                button.disabled = true;
            }
            localStorage.setItem("SCORE", score);
        })
    }


    async finishGame(score) {
        console.log(this.camera); // undefined
        const camRecording = await this.camera.stopRecording();
        const fullScreenRecording = await this.fullscreenRecorder.stopRecording();

        let replayData = null;
        if (this.isCreatorMode) {
            replayData = await this.replayRecorder.getReplayData();
            console.dir(replayData);
        }

        this.mainApp.leaveGameplay(fullScreenRecording, camRecording, replayData, score);
    }

}


