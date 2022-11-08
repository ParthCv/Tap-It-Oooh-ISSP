import LayoutManagerInstance from "./layoutManager";

/**
 * Handles showing, hiding, and waiting for screens to be ready to change.
 */
class ScreenManager {
    constructor() {
        this.activeScreen = null;
        this.activeLayoutName = null;
        this.screensByName = new Map();
        this.loadingCover = document.querySelector("#loadingCover");
    }

    // setAnalyticService(analyticService) {
    //     this.analyticService = analyticService;
    // }


    async addScreen(screenComponent) {
        this.screensByName.set(screenComponent.getName(), screenComponent);
    }

    async showScreen(screenName, extraPreloadList = null) {
        // TODO: this is probably wrong, we need to use specific names for each screen that match our BI docs

        // this.analyticService.setPage(screenName);
        console.log(screenName);

        if (this.activeScreen) {
            await this.showLoadingCover();
            await this.activeScreen.hide();
        }

        this.activeScreen = this.screensByName.get(screenName);
        const newLayoutName = this.activeScreen.getLayoutName();

        await this.activeScreen.getPreloadList().loadAll();

        // since extra preloads may depend on layouts, need to wait for screen's load list to finish before
        // starting to load the extras
        if (extraPreloadList) {
            await extraPreloadList.loadAll();
        }

        if (newLayoutName !== this.activeLayoutName) {
            this.activeLayoutName = newLayoutName;
            await LayoutManagerInstance.showLayout(this.activeLayoutName);
        }

        await this.activeScreen.show();
        await this.hideLoadingCover();
        // don't await, as the transition is now complete.
        this.activeScreen.onShowing();
    }

    /**
     * Shows a loading screen while screens load in the background.
     */
    showLoadingCover() {
        this.loadingCover.classList.remove("hidden");
    }

    /**
     * Hides the loading screen
     */
    hideLoadingCover() {
        this.loadingCover.classList.add("hidden");
    }
}

const ScreenManagerInstance = new ScreenManager();
export default ScreenManagerInstance;
