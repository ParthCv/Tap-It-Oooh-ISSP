import {getCreatorAudienceLayout, getCreatorCameraLayout, getEvenSplitLayout, getFullScreenLayout, LAYOUTS} from "./const";
import {wait} from "./util";

/*
    Handles showing, hiding, and waiting for screens to be ready to change.

    Further reading: https://docs.oooh.io/docs/controlling-layout#layout
 */
class LayoutManager {
    constructor() {
        this.activeLayoutName = null;
        this.layoutsByName = new Map();

        // Reusing components is crucial to making your module run fast and efficient.
        // We'll save off a reference to the camera when it is first created, so we can pass
        // it to any other layouts that need a camera.
        this.cameraComponent = null;

        // if in audience mode, this will be where we play back the creator camera recording
        this.creatorVideoComponent = null;

        // this will hold the gameplay video for the user to review before submitting
        this.reviewVideoComponent = null;

        // don't overload client by creating layouts in parallel. Queue up the layouts.
        this.createLayoutQueue = [];
    }

    initSingleton(o3h) {
        this.o3h = o3h;
        this.runtime = o3h.Instance;
    }

    // creates layouts, but is essentially thread-locked, only allowing one layout to be created at a time.
    async createLayout(layoutName, layoutConfig, layoutComponents, existingComponents = {}) {
        if (this.layoutsByName.has(layoutName)) {
            return this.layoutsByName.get(layoutName);
        }

        const layout = await this.runtime.createLayout(layoutConfig, layoutComponents, existingComponents);
        this.layoutsByName.set(layoutName, layout);

        return layout;
    }

    async createEmptyLayout() {
        await this.createLayout(LAYOUTS.HTML_ONLY, 'Full Screen', {});
    }

    async showLayout(layoutName) {
        await this.layoutsByName.get(layoutName).show(true);
    }

    /* THESE ARE MODULE-SPECIFIC, SO MAY NOT KEEP THIS IN THE TEMPLATE CODE, MIGHT MOVE TO RECIPE */
    async createTopHalfCameraLayout() {
        const camConfig = new this.o3h.CameraComponentConfig();
        const layout = await this.createLayout(
            LAYOUTS.TOP_HALF_CAMERA,
            getEvenSplitLayout(this.o3h),
            {'top': camConfig});

        // since this is the first layout we create with a camera, save it so we can use in other layouts
        this.cameraComponent = layout.getComponent('top');
    }

    async createTopHalfCameraBottomHalfVideoLayout(videoUrl) {
        const camConfig = new this.o3h.CameraComponentConfig();
        const videoConfig = new this.o3h.VideoComponentConfig();
        videoConfig.url = videoUrl;
        const layout = await this.createLayout(
            LAYOUTS.TOP_CAMERA_BOTTOM_VIDEO,
            getEvenSplitLayout(this.o3h),
            {'top': camConfig, 'bottom': videoConfig});

        // since this is the first layout we create with a camera, save it so we can use in other layouts
        this.cameraComponent = layout.getComponent('top');
        this.creatorVideoComponent = layout.getComponent('bottom');
    }

    async createCreatorLayout() {
        const camConfig = new this.o3h.CameraComponentConfig();
        const existing = {};
        if (this.cameraComponent) {
            existing['top'] = this.cameraComponent;
        }

        const layout = await this.createLayout(
            LAYOUTS.CREATOR_CAMERA,
            getCreatorCameraLayout(this.o3h),
            {'top': camConfig},
            existing
            );

        this.cameraComponent = layout.getComponent('top');
    }

    async createCreatorAudienceLayout(videoUrl) {
        const videoConfig = new this.o3h.VideoComponentConfig();
        videoConfig.url = videoUrl;
        const camConfig = new this.o3h.CameraComponentConfig();
        const layout = await this.createLayout(
            LAYOUTS.CREATOR_AUDIENCE_CAMERA,
            getCreatorAudienceLayout(this.o3h),
            {'topLeft': videoConfig, 'topRight': camConfig},
            {'topLeft': this.creatorVideoComponent, 'topRight': this.cameraComponent});
        this.creatorVideoComponent = layout.getComponent('topLeft');
        await this.creatorVideoComponent.transition({ scale: { x: -1, y: 1 } });
        this.cameraComponent = layout.getComponent('topRight');
    }

    async createFullScreenVideoLayout() {
        const videoConfig = new this.o3h.VideoComponentConfig();
        const layout = await this.createLayout(
            LAYOUTS.FULL_SCREEN_VIDEO,
            getFullScreenLayout(this.o3h),
            {'main': videoConfig});
        this.reviewVideoComponent = layout.getComponent('main');
    }

    async createFullScreenCameraLayout() {
        const cameraConfig = new this.o3h.CameraComponentConfig();
        await this.createLayout(
            LAYOUTS.FULL_SCREEN_CAMERA,
            getFullScreenLayout(this.o3h),
            {'main': cameraConfig},
            {'main': this.cameraComponent});
    }
}

const LayoutManagerInstance = new LayoutManager();
export default LayoutManagerInstance;
