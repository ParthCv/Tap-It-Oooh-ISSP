import "./index.css";
import App from "./app";

let o3h = {};

import(/* webpackIgnore: true */ "/api/o3h.js").then(async (o) => {
    o3h = o;

    window.mainApp = new App(o3h);
});
