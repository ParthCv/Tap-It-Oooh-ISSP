/* eslint-disable no-unused-vars */
const PrivateSymbol = Symbol('Private');

module.exports.ACHIEVEMENT_TYPE = {
    NEW_PERSONAL_BEST: 0,
    BEAT_CREATOR: 1,
    LOCAL_HIGH_SCORE: 2,
    GLOBAL_HIGH_SCORE: 3
};

/**
 * @typedef {Object} UserInformation - <module:o3h.UserDataService.UserInformation>
 */

/**
 * @typedef {Object} LeaderboardEntryDisplay - a MODIFIED version of <module:o3h.UserDataService.LeaderboardEntry> for display
 * @property {number} Score - the player's current leaderboard score
 * @property {number} Rank - the player's current leadaerboard rank
 * @property {UserInformation} User - the player's information
 * @property {bool} IsEmphasized - true if this leaderboard entry should be visually emphasized when displayed
 * @property {bool} IsHost - true if this leaderboard entry is the Host's ORIGINAL score. Should be displayed with a "HOST" label on the profile icon
 * @property {bool} IsHostReplay - true if this leaderboard entry is the Host's REPLAYED score. Should be displayed with a "HOST REPLAY" label on the profile icon
 */

/**
 * Class that assists in getting the data needed to render a leaderboard.
 */
module.exports.LeaderboardData = class LeaderboardData {
    /**
     * Constructor.
     */
    constructor() {
        this[PrivateSymbol] = {};
        this[PrivateSymbol].initialized = false;
        this[PrivateSymbol].didAchieveNewGlobalRecord = false;
        this[PrivateSymbol].didAchieveNewLocalRecord = false;
        this[PrivateSymbol].didAchieveBeatCreator = false;
        this[PrivateSymbol].didAchieveNewPersonalBest = false;

        // creates a bunch of functions/methods on this[PrivateSymbol]
        this.addPrivateFunctions();
    }

    /**
     * Needed to set up the leaderboard data
     * @param o3hRuntime
     * @return {Promise<void>} A promise that resolves when the data is loaded, and the leaderboard data is ready to use.
     */
    async initialize(o3hRuntime) {
        this[PrivateSymbol].runtime = o3hRuntime;
        this[PrivateSymbol].userDataPromise = o3hRuntime.getUserDataService().getActiveUserInformation();

        const leaderboardPromise = o3hRuntime.getUserDataService().getLeaderboard();
        await Promise.all([leaderboardPromise, this[PrivateSymbol].userDataPromise]);
        this[PrivateSymbol].updateData(await leaderboardPromise, await this[PrivateSymbol].userDataPromise);
        this[PrivateSymbol].initialized = true;
    }

    /**
     * Updates the leaderboard with the user's score from gameplay, allowing you to get updated data from
     * getAllEntries, getPodiumEntries, etc, and call getBestAchievement.
     * @param {number} score the player's score from this round
     * @param {ReplayDataAsset} replayData a ReplayDataAsset, if your module needs to do any sort of score validation
     * @return {Promise<void>} A promise that resolves when the leaderboard data has been updated.
     */
    async addScore(score, replayData = null) {
        this[PrivateSymbol].checkInitialized();

        // should already be resolved
        const activeUser = await this[PrivateSymbol].userDataPromise;

        const oldPlayerEntry = this[PrivateSymbol].localEntries.find((e) => e.IsHost !== true && e.User.Name === activeUser.Name);
        const oldLocalLead = this[PrivateSymbol].localEntries.length > 0 ? this[PrivateSymbol].localEntries[0] : { Score: Number.NEGATIVE_INFINITY };
        const oldGlobalLead = this[PrivateSymbol].globalEntries.length > 0 ? this[PrivateSymbol].globalEntries[0] : { Score: Number.NEGATIVE_INFINITY };
        const creatorEntry = this[PrivateSymbol].localEntries.find((e) => e.IsHost === true);

        const leaderboard = await this[PrivateSymbol].runtime.getUserDataService().addToLeaderboard({ score, replayData });

        this[PrivateSymbol].didAchieveNewGlobalRecord = score > oldGlobalLead.Score;
        this[PrivateSymbol].didAchieveNewLocalRecord = score > oldLocalLead.Score;
        this[PrivateSymbol].didAchieveBeatCreator = creatorEntry !== undefined && score > creatorEntry.Score;
        this[PrivateSymbol].didAchieveNewPersonalBest = oldPlayerEntry !== undefined && score > oldPlayerEntry.Score;

        await this[PrivateSymbol].updateData(leaderboard, activeUser);
    }

    addPrivateFunctions() {
        this[PrivateSymbol].checkInitialized = () => {
            if (!this[PrivateSymbol].initialized) {
                throw new Error('Must await initialize() before using LeaderboardData!');
            }
        };

        this[PrivateSymbol].updateData = (leaderboard, activeUser) => {
            this[PrivateSymbol].localEntries = leaderboard.Entries;
            this[PrivateSymbol].globalEntries = leaderboard.GlobalEntries;
            this[PrivateSymbol].activeUser = activeUser;

            // Need to set hostEntry before decorateLocalEntries(), otherwise IsHostReplay property will not be set correctly.
            // NOTE: there is a infinitesimal chance that something goes wrong and hostEntry will be set to null.
            this[PrivateSymbol].hostEntry = this[PrivateSymbol].localEntries.find((e) => (e.IsHost === true || e.IsOwner === true));

            this[PrivateSymbol].decorateLocalEntries(this[PrivateSymbol].localEntries);
        };

        this[PrivateSymbol].decorateLocalEntries = (localEntries) => {
            // add isHost, IsHostReplay, and isEmphasized properties
            let hostEntryName = false;
            if (this[PrivateSymbol].hostEntry !== null && this[PrivateSymbol].hostEntry !== undefined) {
                hostEntryName = this[PrivateSymbol].hostEntry.User.Name;
            }

            // filter through entries
            localEntries.forEach((e) => {
                // to match design doc's, we're going to be using IsHost, and scrubbing out IsOwner, if set
                // note: this may be the second pass on this data, so IsHost may already be set
                e.IsHost = (e.IsOwner === true || e.IsHost === true);
                delete e.IsOwner;

                // check if it's a host entry, and not the original host score
                e.IsHostReplay = (e.User.Name === hostEntryName && e.IsHost !== true);

                // Always emphasize the active player
                e.IsEmphasized = (e.User.Name === this[PrivateSymbol].activeUser.Name && e.IsHost !== true);

                // TODO: FUTURE-FEATURE? Only emphasize active player if the get onto the leaderboard
                // e.IsEmphasized = (e.User.Name === this[PrivateSymbol].activeUser.Name && e.IsHost !== true && this[PrivateSymbol].didAchieveNewPersonalBest);
            });
        };

        this[PrivateSymbol].getCreatorPlayerEntries = (showEvenIfInTop3 = false) => {
            let npe = [];
            const { hostEntry } = this[PrivateSymbol];

            const playerEntry = this[PrivateSymbol].localEntries.find((e) => (e.User.Name === this[PrivateSymbol].activeUser.Name && e.IsHost !== true)); // TODO: test across all use cases

            let hostRank = Number.MAX_VALUE;

            if (hostEntry && (hostEntry.Rank > 3 || showEvenIfInTop3)) {
                npe.push(hostEntry);
                hostRank = hostEntry.Rank;
            }

            if (playerEntry) {
                if ((playerEntry.Rank > 3 || showEvenIfInTop3)) {
                    npe.push(playerEntry);

                    if (playerEntry.Rank < hostRank) {
                        npe = npe.reverse();
                    }
                }
            }
            else {
                // no current player entry, need to add an entry with blanked out rank and score
                let hostEntryName = '';
                if (this[PrivateSymbol].hostEntry !== null && this[PrivateSymbol].hostEntry !== undefined) {
                    hostEntryName = this[PrivateSymbol].hostEntry.User.Name;
                }

                // add temporary entry for displaying
                npe.push(this[PrivateSymbol].makeFakeEntry());
            }

            return npe;
        };

        this[PrivateSymbol].makeFakeEntry = () => {
            let hostEntryName = '';
            if (this[PrivateSymbol].hostEntry !== null && this[PrivateSymbol].hostEntry !== undefined) {
                hostEntryName = this[PrivateSymbol].hostEntry.User.Name;
            }

            // create fake entry for displaying when one doesn't exist (happens on first play)
            return {
                Score: null,
                Rank: null,
                User: this[PrivateSymbol].activeUser,
                IsEmphasized: true,
                IsHost: false,
                IsHostReplay: (this[PrivateSymbol].activeUser.Name === hostEntryName)
            };
        };
    }

    /**
     * Returns all the entries from the loaded leaderboard data, with player info inserted if a score
     * was provided in constructor.
     *
     * @return {LeaderboardEntryDisplay[]} - an array of all loaded entries.
     */
    getAllEntries() {
        this[PrivateSymbol].checkInitialized();
        return this[PrivateSymbol].localEntries;
    }

    /**
     * Returns an array of up to 3 top scoring entries.
     *
     * @return {LeaderboardEntryDisplay[]} - an array of up to 3 entries
     */
    getPodiumEntries() {
        this[PrivateSymbol].checkInitialized();
        return this[PrivateSymbol].localEntries.slice(0, 3);
    }

    /**
     * Returns an array of up to 2 entries, to be used for showing how the player compares to the creator.
     * If the creator has no score, it will only contain the player's score.  Also, if
     * the creator or player is in the top 3, their score will not be in this list.
     * If the player has no score yet, their entry will have null for the Rank and Score fields.
     *
     * @return {LeaderboardEntryDisplay[]} - an array of up to 2 entries
     */
    getNonPodiumEntries() {
        this[PrivateSymbol].checkInitialized();
        return this[PrivateSymbol].getCreatorPlayerEntries(false);
    }

    /**
     * Similar to getNonPodiumEntries, but returns the entries even if they are in top 3.
     * Useful for showing relationship between player and creator scores after a game, if the podium is NOT being shown.
     * @deprecated since leaderboard design changes April 2022. Please use getPodiumEntries() and getNonPodiumEntries() instead
     * @return {LeaderboardEntryDisplay[]} - an array of up to 2 entries
     */
    getCreatorAndPlayerEntries() {
        console.warn('getCreatorAndPlayerEntries() is deprecated, please use getPodiumEntries() and getNonPodiumEntries() instead');
        this[PrivateSymbol].checkInitialized();
        return this[PrivateSymbol].getCreatorPlayerEntries(true);
    }

    /**
     * Returns most valuable achievement player has achieved with new score, or null if no achievement.
     *
     * @return {object} - the most valuable achievement, in the form { type, description }. Type will be member of LeaderboardData.ACHIEVEMENT_TYPE
     */
    getBestAchievement() {
        this[PrivateSymbol].checkInitialized();

        // new record for this template
        if (this[PrivateSymbol].didAchieveNewGlobalRecord) {
            return {
                Type: module.exports.ACHIEVEMENT_TYPE.GLOBAL_HIGH_SCORE,
                Description: 'New Global High Score'
            };
        }

        // new record for this oooh.
        if (this[PrivateSymbol].didAchieveNewLocalRecord) {
            return {
                Type: module.exports.ACHIEVEMENT_TYPE.LOCAL_HIGH_SCORE,
                Description: 'New High Score'
            };
        }

        // if creator has a score, and this is the first time we are getting higher than that score, beat creator
        // tied scores are not better, first entry is better
        if (this[PrivateSymbol].didAchieveBeatCreator) {
            return {
                Type: module.exports.ACHIEVEMENT_TYPE.BEAT_CREATOR,
                Description: `Beat ${this[PrivateSymbol].hostEntry.User.Name}`
            };
        }

        // tied score is not better, original score is better
        if (this[PrivateSymbol].didAchieveNewPersonalBest) {
            return {
                Type: module.exports.ACHIEVEMENT_TYPE.NEW_PERSONAL_BEST,
                Description: 'New Personal Best'
            };
        }

        return null;
    }

    /**
     * Returns the host's leaderboard entry
     * @return {LeaderboardEntryDisplay}
     */
    getCreatorEntry() {
        return this[PrivateSymbol].hostEntry;
    }

    /**
     * Returns the player's leaderboard entry, or a fake one if no entry exists
     * @return {LeaderboardEntryDisplay}
     */
    getPlayerEntry() {
        let playerEntry = this[PrivateSymbol].localEntries.find((e) => (e.User.Name === this[PrivateSymbol].activeUser.Name && e.IsHost !== true));

        if (!playerEntry) {
            playerEntry = this[PrivateSymbol].makeFakeEntry();
        }

        return playerEntry;
    }

    /**
     * Returns the next higher scoring player's leaderboard entry, or null if no entry is higher
     * @param {number} score the score to be compared to when finding the next better score
     * @return {LeaderboardEntryDisplay} or null if no higher score found
     */
    getNextBetterScoreEntry(score) {
        const len = this[PrivateSymbol].localEntries.length - 1;

        // Loop from lowest to highest score
        for (let i = len; i >= 0; i--) {
            const entry = this[PrivateSymbol].localEntries[i];
            if (entry.Score > score) {
                return entry;
            }
        }

        return null;
    }

    /**
     * Returns the named player's leaderboard entry, or a fake one if no entry exists
     * @param {string} name the exact name of the player to find
     * @return {LeaderboardEntryDisplay} or {Score: <number>} if no local or global entries found
     */
    getPersonalBestScoreEntry(name) {
        const localBestEntry = this[PrivateSymbol].localEntries.length > 0
            ? this[PrivateSymbol].localEntries.find((e) => (e.User.Name === name)) : { Score: Number.NEGATIVE_INFINITY };
        const globalBestEntry = this[PrivateSymbol].globalEntries.length > 0
            ? this[PrivateSymbol].globalEntries.find((e) => (e.User.Name === name)) : { Score: Number.NEGATIVE_INFINITY };

        if (localBestEntry.Score > globalBestEntry.Score) {
            return localBestEntry;
        }
        return globalBestEntry;
    }

    /**
     * Returns the host's best leaderboard entry
     * @return {LeaderboardEntryDisplay} or {Score: <number>} if no local or global entries found
     */
    getHostBestAllTimeScoreEntry() {
        const localHostEntry = this[PrivateSymbol].localEntries.length > 0
            ? this[PrivateSymbol].localEntries.find((e) => (e.IsHost === true)) : { Score: Number.NEGATIVE_INFINITY };
        const localHostReplayEntry = this[PrivateSymbol].localEntries.length > 0
            ? this[PrivateSymbol].localEntries.find((e) => (e.IsHostReplay === true)) : { Score: Number.NEGATIVE_INFINITY };
        const hostName = this[PrivateSymbol].hostEntry.User.name;
        const globalBestEntry = this[PrivateSymbol].globalEntries.length > 0
            ? this[PrivateSymbol].globalEntries.find((e) => (e.User.Name === hostName)) : { Score: Number.NEGATIVE_INFINITY };

        // Get the best of the host's local scores: original and replay (if it exists)
        let localBestEntry = localHostEntry;
        if (localHostReplayEntry.Score > localHostEntry.Score) {
            localBestEntry = localHostReplayEntry;
        }

        let retEntry = null;
        if (localBestEntry.Score > globalBestEntry.Score) {
            retEntry = localBestEntry;
        }
        else {
            retEntry = globalBestEntry;
        }

        return retEntry;
    }

    /**
     * Returns the best global leaderboard entry, or a fake one if no entry exists
     * @return {LeaderboardEntryDisplay} or {Score: <number>} if no entry found
     */
    getWorldRecordScoreEntry() {
        return this[PrivateSymbol].globalEntries.length > 0 ? this[PrivateSymbol].globalEntries[0] : { Score: Number.NEGATIVE_INFINITY };
    }
};

/**
 * A class to set test data on, and then pass to leaderboardData.initialize() instead of o3h.  Allows you to test specific leaderboard edge cases.
 * @type {exports.MockO3H}
 */
module.exports.MockO3H = class MockO3H {
    /**
     * @typedef MockUser
     * @property {string} Name
     * @property {string} AvatarImageUrl
     * @property {number} Level
     * @property {0|1} Type - Use 0 for audience, 1 for host
     */

    /**
     * Constructor
     * @param {MockUser} activeUser a mocked user of the form <tt>{ Name: testUsername, AvatarImageUrl: 'http://placekitten.com/256/256', Level: 50, Type: [0 or 1]}</tt>
     * @param {LeaderboardEntryDisplay[]} localEntries an array of raw leaderboard entries of the form <tt>{ Rank: [sequential number], User: [same form as activeUser param above], Score: [any number lower than the last], IsOwner: [true/false] }</tt>
     * @param {LeaderboardEntryDisplay[]} [globalEntries] (optional) an array similar to localEntries, representing the data across all hostings of the module
     */
    constructor(activeUser, localEntries, globalEntries = null) {
        this.mockService = {
            entries: localEntries,
            globalEntries: globalEntries || localEntries,
            async getLeaderboard() {
                return {
                    Entries: localEntries,
                    GlobalEntries: globalEntries || localEntries
                };
            },
            async getActiveUserInformation() {
                return activeUser;
            },
            async addToLeaderboard(updateObject) {
                let i;

                // only add if we got a better score
                if (!localEntries.find((e) => e.IsHost !== true && e.User.Name === activeUser.Name && e.Score >= updateObject.Score)) {
                    // remove current user entry, unless it's an owner entry
                    localEntries = localEntries.filter((e) => e.IsHost === true || e.User.Name !== activeUser.Name);

                    for (i = 0; i < localEntries.length && localEntries[i].Score >= updateObject.Score; i++);
                    localEntries.splice(i, 0, { Score: updateObject.Score, User: activeUser, IsOwner: false });

                    localEntries = localEntries.map((e, index) => {
                        e.Rank = index + 1;
                        return e;
                    });
                }

                if (!this.globalEntries.find((e) => e.User.Name === activeUser.Name && e.Score >= updateObject.Score)) {
                    // remove current user entry, unless it's an owner entry
                    this.globalEntries = this.globalEntries.filter((e) => e.IsHost === true || e.User.Name !== activeUser.Name);

                    for (i = 0; i < this.globalEntries.length && this.globalEntries[i].Score >= updateObject.Score; i++) ;
                    this.globalEntries.splice(i, 0, { Score: updateObject.Score, User: activeUser });

                    this.globalEntries = this.globalEntries.map((e, index) => {
                        e.Rank = index + 1;
                        return e;
                    });
                }

                return {
                    Entries: localEntries,
                    GlobalEntries: this.globalEntries
                };
            }
        };
    }

    getUserDataService() {
        return this.mockService;
    }
};
