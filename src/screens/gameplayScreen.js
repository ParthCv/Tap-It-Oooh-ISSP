import * as consts from  "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";


export default class GameplayScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = consts.SCREENS.GAMEPLAY;
        this.layoutName = consts.LAYOUTS.FULL_SCREEN_CAMERA;

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());
        this.preloadList.addLoad(async () => {
            await LayoutManagerInstance.createFullScreenCameraLayout();
            this.fullscreenRecorder = await this.runtime.getControlManager().getFullScreenRecorder();
        });

        this.hostElement = document.querySelector('#gameplayScreen');

        this.score = 0;

        this.button = document.getElementById("game-button");
        this.scoreElement = document.getElementById("score");
    }

    async onShowing() {

        console.log("game screen");
        this.hostElement.classList.remove('hidden');

        let timer = 5;

        this.fullscreenRecorder.startRecording();

        const onclick_handler = () => {
            this.score += 1;
            this.scoreElement.innerHTML = "Score:" + "  "+ this.score + "";
        };

        const move_around = () => {
            var x = Math.floor(Math.random() * 500);
            var y = Math.floor(Math.random() * 500);
            this.button.style.left = x + "px";
            this.button.style.top = y + "px";
        };

        this.button.onclick = onclick_handler; move_around();

        var started = true;
        this.button.addEventListener('click', function() {
            console.log(timer);
            if (started){
            var myInterval = window.setInterval(function(){
            if (timer > 0)
                timer--;
                document.getElementById("timer").innerHTML = "Timer: " + timer + "";

            if (timer <= 0) {
                console.log("Timer is at 0!");
                document.getElementById("game-button").setAttribute("disabled", "");
                clearInterval(myInterval);
                console.log("Supposed to leave gameplay!");
                this.mainApp.leaveGamePlay();
            }
            }, 1000);
            started = false;
            }
        });
    }

    // show() {
    //     super.show();
    //     // Shows the camera and audio on/off toggles to the user
    //     this.app.systemSettingsService.showSystemSettings();
    // }

    // hide() {        
    //     super.hide();

    //     // Set that the tutorial has been seen for this play mode
    //     const playMode = isCreatorMode() ? "creator" : "audience";
    //     PersistentDataManagerInstance.setSettingsDataProperty(`${playMode}_tutorial`, true);
    // }
}
