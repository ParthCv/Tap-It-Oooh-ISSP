import "./index.css";
import TapItController from "./TapItController";


import(/* webpackIgnore: true */ '/api/o3h.js').then(async(o) => {
    // Export the o3h API globally
    window.o3h = o;
    // Create an App object that controls the module
    window.app = new TapItController();
    }
);

