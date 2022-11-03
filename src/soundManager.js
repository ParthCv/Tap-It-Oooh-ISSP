import { Howl } from "howler";

/**
 * Handles loading and playing sound assets in an Oooh module
 * Learn more: https://docs.oooh.io/docs/audio
 */
class SoundManager {
    constructor() {
        // A map of strings to the sound object
        this.soundsByPath = new Map();
    }

    /**
     * Loads a sound asset to be used in a module
     * 
     * @param {string} soundPath - The path to the sound asset
     * @param {boolean} o3hAudio - Whether the sound should be loaded using Oooh or Howler (HTML5 audio polyfill)
     * @param {boolean} looping - Whether the sound should loop
     * @param {number} pool - If using Howler, the size of the inactive sounds pool
     * 
     * @returns {Promise<void>} - A Promise that resolves when the sound has loaded, use this when pre-loading
     */
    loadSound(soundPath, o3hAudio = false, looping = false, pool = 5) {
        if (this.soundsByPath.has(soundPath)) {
            return this.soundsByPath.get(soundPath).loading();
        }

        if (!o3hAudio) {
            // Use Howler (HTML5 audio polyfill)
            const sound = new HowlerSound(soundPath, looping, pool);
            this.soundsByPath.set(soundPath, sound);
        } else {
            // Use o3h audio
            const sound = new O3hSound(soundPath, looping, o3h.Instance.getAudioManager());
            this.soundsByPath.set(soundPath, sound);
        }

        return this.soundsByPath.get(soundPath).loading();
    }

    // Plays a sound asset that has already been created
    async playSound(soundPath) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            await sound.playSound();
        }
    }

    // Stops a sound asset that has already been created
    async stopSound(soundPath) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            await sound.stopSound();
        }
    }

    // Stops and unloads a sound asset that has already been created
    unloadSound(soundPath) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            // Stops and unloads the sound
            sound.unloadSound();
            this.soundsByPath.delete(soundPath);
        }
    }

    // Sets the volume of a sound asset that has already been created
    setVolume(soundPath, volume) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            sound.setVolume(volume);
        }
    }

    // Sets whether a sound asset that has already been created should loop or not
    setLooping(soundPath, looping) {
        const sound = this.soundsByPath.get(soundPath);
        if (sound) {
            sound.setLooping(looping);
        }
    }
}

// A class which encapsulates Howler Howl functionality
class HowlerSound {
    constructor(soundPath, looping = false, pool = 5) {
        // Use Howler
        this.howl = new Howl({
            src: [soundPath],
            html5: true,
            loop: looping,
            pool: pool
        });
    }

    loading() {
        const howl = this.howl;
        return new Promise((resolve, reject) => {
            if (howl.state() == "loaded") {
                resolve();
            }

            howl.once("load", () => resolve());
            howl.once("loaderror", () => reject());
        });
    }

    async playSound() {
        this.howl.play();
        await sleep(this.howl.duration() * 1000);

        if (!this.howl.loop()) {
            await this.stopSound();
        }
    }

    async stopSound() {
        this.howl.stop();
    }

    unloadSound() {
        this.howl.unload();
        this.howl = null;
    }

    setVolume(volume) {
        this.howl.volume(volume);
    }

    setLooping(looping) {
        this.howl.loop(looping);
    }
}

// A class which encapsulates Oooh AudioClip functionality
class O3hSound {
    constructor(soundPath, looping = false, audioManager) {
        this.audioClipPromise = audioManager.load(soundPath);

        this.audioClipPromise.then((clip) => {
            clip.loop = looping;
            // Audio clip is set with audio clip
            this.audioClip = clip;
        });
    }

    loading() {
        return this.audioClipPromise;
    }

    async playSound() {
        this.audioClip.play();
        await sleep(this.audioClip.duration * 1000);

        if (!this.audioClip.loop) {
            await this.stopSound();
        }
    }

    async stopSound() {
        await this.audioClip.reset();
    }

    unloadSound() {
        this.audioClip.unload();

        this.audioClip = null;
        this.audioClipPromise = null;
    }

    setVolume(volume) {
        this.audioClip.volume = volume;
    }

    setLooping(looping) {
        this.audioClip.loop = looping;
    }
}

const SoundManagerInstance = new SoundManager();
export default SoundManagerInstance;
