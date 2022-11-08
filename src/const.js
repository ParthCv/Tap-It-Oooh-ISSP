module.exports.ONE_FRAME_MS = 33;
module.exports.ONE_SECOND_MS = 1000;

module.exports.VS_SCREEN_SHOW_TIME = 5000;

module.exports.HAVE_WATCHED_TUTORIAL_SETTING = 'haveWatchedTutorial';

// module.exports.REPLAY_DATA = {
//     EVENT_LASER: 'laser',
//     EVENT_SPAWN_CAT: 'spawnCat',
//     PROPERTY_POINT_TRANSLATOR_CONFIG: 'pointTranslatorConfig',
// }

module.exports.SCREENS = {
    SPLASH: 'splash',
    PREGAME_LEADERBOARD: 'pregameLeaderboard',
    POSTGAME_LEADERBOARD: 'postgameLeaderboard',
    TUTORIAL: 'tutorial',
    VS: 'vs',
    GAMEPLAY: 'gameplay',
    REVIEW: 'review',
    SCORE_COMPARE: 'scoreComparison',
    REACTION: 'reaction',
}

module.exports.LAYOUTS = {
    HTML_ONLY: 'html_only',
    CREATOR_CAMERA: 'creator_camera',
    TOP_HALF_CAMERA: 'top_half_camera',
    TOP_CAMERA_BOTTOM_VIDEO: 'top_camera_bottom_video',
    CREATOR_AUDIENCE_CAMERA: 'creator_audience_camera',
    FULL_SCREEN_VIDEO: 'full_screen_video',
    FULL_SCREEN_CAMERA: 'full_screen_camera',
}

module.exports.COMPONENTS = {
    VIDEO: 'video'
}

module.exports.SOUNDS = {
    SFX_BUTTON_TAP: "./sounds/SFX_Button_Tap.mp3",
    BG_MUSIC: "./sounds/MUS_TapIt_Theme.mp3"
}

module.exports.INPUT_OUTPUT_ASSETS = {
    OUTPUT_CAMERA: 'outputCameraCreator',
    OUTPUT_FULLSCREEN_RECORDING: 'outputFullscreenRecording',
    OUTPUT_REPLAY_DATA: 'outputReplayData',
    INPUT_CREATOR_CAMERA: 'inputCameraCreator',
    INPUT_REPLAY_DATA: 'inputReplayData',
}

module.exports.getCreatorCameraLayout = (o3h) => {
    return {
        childrenFlexDirection: o3h.Layout.Direction.Vertical,
        children: [
            {
                id: 'top',
                flexRatio: 1,
            },
            {
                id: 'bottom',
                flexRatio: 2,
            }
        ]
    };
}

module.exports.getEvenSplitLayout = (o3h) => {
    return {
        childrenFlexDirection: o3h.Layout.Direction.Vertical,
        children: [
            {
                id: 'top',
                flexRatio: 1,
            },
            {
                id: 'bottom',
                flexRatio: 1,
            }
        ]
    };
}

module.exports.getCreatorAudienceLayout = (o3h) => {
    return {
        childrenFlexDirection: o3h.Layout.Direction.Vertical,
        children: [
            {
                flexRatio: 1,
                childrenFlexDirection: o3h.Layout.Direction.Horizontal,
                children: [
                    {
                        id: 'topLeft',
                        flexRatio: 1
                    },
                    {
                        id: 'topRight',
                        flexRatio: 1
                    }
                ]
            },
            {
                id: 'bottom',
                flexRatio: 2,
            }
        ]
    }
}

module.exports.getFullScreenLayout = (o3h) => {
    return {
        childrenFlexDirection: o3h.Layout.Direction.Vertical,
        children: [
            {
                id: 'main',
                flexRatio: 1,
            }
        ]
    };
}

