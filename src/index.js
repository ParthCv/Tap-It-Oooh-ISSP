import "./index.css";
import TapItController from "./TapItController";

let controller;
let o3h = {};
let instance = {};


import(/* webpackIgnore: true */ '/api/o3h.js').then((o) => {
        o3h = o;
        instance = o.Instance;
        window.o3h = o3h; //Ensure the rest of this page can see o3h  
        load();
    }
);

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function load() {
    controller = new TapItController(instance);

    await controller.showSingleLayout();

    instance.ready(onStart);
}

async function onStart() {
    await controller.load();
    controller.start();

}