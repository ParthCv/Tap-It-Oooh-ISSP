export default class TapItController {
    constructor(instance) {
        this.runtime = instance;
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

    // Utility functions
    wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
        currentDate = Date.now();
        } while (currentDate - date < milliseconds);
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

    async start() {
        try {
            this.assetManager = await this.runtime.getAssetManager();
            this.fullScreenRecorder.startRecording();
            this.cameraComponent.startRecording();
            this.sleep(10000);

            this.screenVideoAsset = await this.fullScreenRecorder.stopRecording();
            this.cameraVideoAsset = await this.cameraComponent.stopRecording();
            
            this.assetManager.addAsset("screenVideo", this.screenVideoAsset);
            this.assetManager.addAsset("cameraVideo", this.cameraVideoAsset);
            
            const exitCondition = {
                score: this.totalScore
            };

            this.runtime.completeModule(exitCondition);
        } catch (error) {
            console.log("Error during start of game controller: " + error.message);
        }
    }


}