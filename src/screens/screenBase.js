import util from "../util";
import {PreloadList} from "../libs/Preloader";
import {LAYOUTS} from "../const";

export default class ScreenBase {
    constructor(o3h, mainApp) {
        this.hostElement = null;    // in subclasses, call document.querySelector to get our host element
        this.o3h = o3h;
        this.runtime = o3h.Instance;
        this.mainApp = mainApp;

        this.name = '';
        this.layoutName = LAYOUTS.HTML_ONLY;
        this.preloadList = new PreloadList();

        // this.isCreatorMode = util.isCreatorMode(o3h);
        // this.isAudienceMode = util.isAudienceMode(o3h);
    }

    getName() {
        return this.name;
    }

    getLayoutName() {
        return this.layoutName;
    }

    getPreloadList() {
        return this.preloadList;
    }

    async show() {
        this.hostElement.classList.remove('hidden');
    }

    async onShowing() {
    }

    async hide() {
        this.hostElement.classList.add('hidden');
    }
}
