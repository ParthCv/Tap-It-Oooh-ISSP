export const SOUNDS = {
    SFX_BUTTON_TAP: "./sounds/SFX_Button_Tap.mp3",
    BG_MUSIC: "./sounds/MUS_TapIt_Theme.mp3"
};

export const LAYOUTS = {
    EMPTY_LAYOUT: "emptyLayout",
    RECORDING_CAMERA: "recordingCamera",
    REVIEW_VIDEO: "reviewVideo"
};

// These assets must match the names configured in ./o3hmanifest.json
export const ASSETS = {
    VIDEO_RECORDING: "videoRecording"
};

export const VIDEO_LENGTH = 30;

export const PIP_POSITION = {
    SIZE_X: 0.35,
    SIZE_Y: 0.3,
    OFFSET_X: -0.06,
    OFFSET_Y: -0.15
};

export const getFullScreenLayout = () => ({
    childrenFlexDirection: o3h.Layout.Direction.Vertical,
    children: [
        {
            id: "main",
            flexRatio: 1
        }
    ]
});

export const getPIPCameraLayout = () => ({
    "children": [{
        "id": "camera",
        "anchor": o3h.Layout.Position.TopRight,
        "pivot": o3h.Layout.Position.TopRight,
        "size": {
            "x": PIP_POSITION.SIZE_X,
            "y": PIP_POSITION.SIZE_Y
        },
        "offset": {
            "x": PIP_POSITION.OFFSET_X,
            "y": PIP_POSITION.OFFSET_Y
        }
    }]
});
