import {
    getFullScreenLayout, getPIPCameraLayout, LAYOUTS
} from "./const";

/**
 * Handles creating and displaying layouts behind the module web view.
 * Learn more: https://docs.oooh.io/docs/using-layouts
 */
class LayoutManager {
    /**
     * @constructor
     */
    constructor() {
        // A map of strings to the promise of the layout
        this.layoutsByName = new Map();
    }

    /**
     * Creates a layout and returns a promise that resolves to it.
     * API Reference: https://docs.oooh.io/docs/api-reference-layoutmanager#layoutmanagercreatelayout-method
     * 
     * @param {string} layoutName - The name of the layout
     * @param {module:o3h~ComponentConfig} layoutConfig - The layout config
     * @param {module:o3h.Component} layoutComponents - Component definitions to use in the layout
     * @param {module:o3h~Transition} existingComponents - Existing components to reuse
     * 
     * @returns {Promise.<module:o3h~Layout>}
     */
    createLayout(layoutName, layoutConfig, layoutComponents, existingComponents = {}) {
        if (this.layoutsByName.has(layoutName)) {
            return this.layoutsByName.get(layoutName);
        }

        const layoutPromise = o3h.Instance.getLayoutManager().createLayout(layoutConfig, layoutComponents, existingComponents);
        this.layoutsByName.set(layoutName, layoutPromise);

        return layoutPromise;
    }

    /**
     * Creates an empty layout with an empty main component (to hide the previously shown layout).
     */
    async createEmptyLayout() {
        await this.createLayout(LAYOUTS.EMPTY_LAYOUT, "Full Screen", {});
    }

    /**
     * Gets a layout object that has already been created.
     * 
     * @param {string} layoutName - The name of the pre-created layout
     * @returns {Promise.<module:o3h~Layout>}
     */
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

    /**
     * Hides a layout that has already been created.
     * 
     * @param {string} layoutName - The name of the pre-created layout
     * @returns {Promise.<module:o3h~Layout>}
     */
    async hideLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            layout.hide();
            return layout;
        }
        return null;
    }

    /**
     * Destroys a layout object that has already been created.
     * 
     * @param {string} layoutName - The name of the pre-created layout
     */
    async destroyLayout(layoutName) {
        const layout = await this.layoutsByName.get(layoutName);
        if (layout) {
            layout.destroy();
            this.layoutsByName.delete(layoutName);
        }
    }
    
    /**
     * Creates a layout with one PIP camera element.
     */
     async createRecordingCameraLayout() {
        const cameraConfig = new o3h.CameraComponentConfig();

        const layout = await this.createLayout(
            LAYOUTS.RECORDING_CAMERA,
            getPIPCameraLayout(),
            { "camera": cameraConfig }
        );
        
        return layout;
    }

    /**
     * Creates a layout with one fullscreen video element.
     */
    async createReviewVideoLayout() {
        const videoConfig = new o3h.VideoComponentConfig();
        videoConfig.loop = true;

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
