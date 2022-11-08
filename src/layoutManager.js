import {getCreatorAudienceLayout, getCreatorCameraLayout, getEvenSplitLayout, getFullScreenLayout, LAYOUTS} from "./const";
import {wait} from "./util";

/**
 * Handles layout creation and display, and maintains references to the components in each layout.
 * Further reading: https://docs.oooh.io/docs/controlling-layout#layout
 */
class LayoutManager {
    /**
     * @constructor
     */
    constructor() {
        // A map of strings to the promise of the layout
        this.layoutsByName = new Map();
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

    /**
     * Creates an empty layout with an empty main component.
     */
    async createEmptyLayout() {
        await this.createLayout(LAYOUTS.EMPTY_LAYOUT, "Full Screen", {});
    }

    async getLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            return layout;
        }
        return null;
    }

    /**
     * Shows a layout that has already been created and hides the current active layout.
     * 
     * @param {string} layoutName - The name of the pre-created layout
     */
    async showLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            await layout.show(true);
            return layout;
        }
        return null;
    }

    async hideLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            layout.hide(true);
            return layout;
        }
        return null;
    }

    async destroyLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            layout.destroy();
            this.layoutsByName.delete(layoutName);
        }
    }

    /** 
     * *** CREATE YOUR MODULE LAYOUTS ***
     * The following methods are examples for creating your own layouts using this LayoutManager. You can create your
     * own for your module.
     *  
     * - Add the layout name and a constant key to LAYOUTS in ./const.js
     * - Add a method to get the custom layout configuration in ./const.js
     * - Configure the video and camera components you'd like to create in your layout
     * - Call this.createLayout() with the layout name, the custom configuration and your component configs
     * 
     * - You can get components from the layout using Layout.getComponent()
     *      - ... and re-use them in new layouts by passing in a map of existingComponents to this.createLayout()
     */


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





    
    /**
     * Creates a layout with one fullscreen camera element.
     */
     async createRecordingCameraLayout() {
        const cameraConfig = new o3h.CameraComponentConfig();

        const layout = await this.createLayout(
            LAYOUTS.RECORDING_CAMERA,
            getFullScreenLayout(),
            { "main": cameraConfig }
        );
        
        return layout;
    }

    /**
     * Creates a layout with one fullscreen video element.
     */
    async createReviewVideoLayout() {
        const videoConfig = new o3h.VideoComponentConfig();

        const layout = await this.createLayout(
            LAYOUTS.REVIEW_VIDEO,
            getFullScreenLayout(),
            { "main": videoConfig }
        );

        return layout;
    }

}

const LayoutManagerInstance = new LayoutManager();
export default LayoutManagerInstance;
