import { VIDEO_LENGTH } from "./const";
import ScreenManagerInstance from "./screenManager";

/**
 * Handles showing and hiding the native record button, and handling full screen recordings
 * Learn more: https://docs.oooh.io/docs/recording-video
 */
class RecordingManager {
    constructor() {
        this.nativeRecordButton = null;
        this.fullScreenRecorder = null;
        this.onRecordingComplete = null;
        this.recording = false;
        this.fullScreenRecording = null;
    }

    /**
     * Initialises the recording manager by creating a native record button and getting the full-screen recorder
     * @param {function} onRecordingStarted - A function that runs when recording is started
     * @param {function} onRecordingComplete - A function that runs when recording is complete
     */
    async init(onRecordingStarted, onRecordingComplete) {
        // Get a reference to managers from the Oooh API
        const nativeUIManager = o3h.Instance.getNativeUIManager();
        const controlManager = o3h.Instance.getControlManager();

        // Create a native record button at the recommended position and size
        this.nativeRecordButton = await nativeUIManager.createNativeRecordButton(0.5, 0.81, 0.085);
        // The player is prompted to allow full-screen recording
        this.fullScreenRecorder = await controlManager.getFullScreenRecorder();

        // Keep a reference to the functions called when recording starts and is complete
        this.onRecordingStarted = onRecordingStarted;
        this.onRecordingComplete = onRecordingComplete;

        this.recording = false;
        this.fullScreenRecording = null;

        // Listen for when the native record button is clicked
        this.nativeRecordButton.clickedEvent.add(() => { this.recordingButtonClicked() } );
        // Listen for when the native record button's countdown has ended
        this.nativeRecordButton.countdownEndedEvent.add(() => { this.recordingCountdownEnded() });
    }

    // When the native record button is clicked...
    async recordingButtonClicked() {
        if (this.recording) {
            // If the screen is being recorded, reset the countdown and call the countdown ended function
            this.nativeRecordButton.resetCountdown(0);
            this.recordingCountdownEnded();
        } else {
            // Set a boolean flag so the recording manager knows we are currently recording
            this.recording = true;

            if (this.fullScreenRecording != null) {
                // If there is a previous recording, delete it
                this.deleteFullScreenRecording();
            }
            
            // Call the onRecordingStarted function provided in RecordingManager.init()
            this.onRecordingStarted();
            // Add a recording class to the active screen to hide elements with the interface class
            ScreenManagerInstance.activeScreen.startRecording();

            // Start the native record button countdown
            this.nativeRecordButton.startCountdown();
            // Start recording with the full-screen recorder
            this.fullScreenRecorder.startRecording();
        }
    }

    // When the recording countdown has ended or the user has stopped recording...
    async recordingCountdownEnded() {
        // Set the recording boolean flag to false since we have stopped recording
        this.recording = false;

        this.hideNativeRecordButton();
        this.nativeRecordButton.resetCountdown(VIDEO_LENGTH);
        
        // 
        this.fullScreenRecording = await this.fullScreenRecorder.stopRecording();

        ScreenManagerInstance.activeScreen.stopRecording();
        // Call the onRecordingComplete function provided in RecordingManager.init() for the module to continue
        this.onRecordingComplete();
    }

    // Shows the native record button and resets the countdown timer
    showNativeRecordButton() {
        this.nativeRecordButton.show();
        this.nativeRecordButton.resetCountdown(VIDEO_LENGTH);
    }
    // Hides the native record button
    hideNativeRecordButton() {
        this.nativeRecordButton.hide();
    }

    // Returns true if currently recording, otherwise false
    isRecording() {
        return this.recording;
    }

    // Returns the latest full-screen recording video asset
    getFullScreenRecording() {
        return this.fullScreenRecording;
    }
    // Deletes the latest full-screen recording video asset
    deleteFullScreenRecording() {
        if (this.fullScreenRecording != null) {
            this.fullScreenRecording.delete();
            this.fullScreenRecording = null;
        }
    }
}

const RecordingManagerInstance = new RecordingManager();
export default RecordingManagerInstance;
