import {LAYOUTS, SCREENS, INPUT_OUTPUT_ASSETS, VS_SCREEN_SHOW_TIME} from "../const";
import ScreenBase from "./screenBase";
import LayoutManagerInstance from "../layoutManager";
import {sleep} from "../util";

export default class VsScreen extends ScreenBase {
    constructor(o3h, mainApp) {
        super(o3h, mainApp);

        this.name = SCREENS.VS;
        this.layoutName = LAYOUTS.TOP_CAMERA_BOTTOM_VIDEO;
        this.assetManager = this.runtime.getAssetManager();

        this.preloadList.addLoad(async () => {
            this.creatorCameraVideoAsset = this.assetManager.getInputAsset(INPUT_OUTPUT_ASSETS.INPUT_CREATOR_CAMERA);
            const creatorCameraURL = await this.creatorCameraVideoAsset.getVideoPath();
            await LayoutManagerInstance.createTopHalfCameraBottomHalfVideoLayout(creatorCameraURL);
        });

        this.hostElement = document.querySelector('#vsScreen');
    }

    async show() {
        await super.show();
    }

    async onShowing() {
        console.log(LayoutManagerInstance.creatorVideoComponent)
        LayoutManagerInstance.creatorVideoComponent.setVolume(0);
        LayoutManagerInstance.creatorVideoComponent.playVideo();
        await sleep(VS_SCREEN_SHOW_TIME);
        this.mainApp.goToGameplay();
    }
}
