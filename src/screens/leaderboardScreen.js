import ScreenBase from "./screenBase";

import { LAYOUTS, SOUNDS } from "../const";
import { isCreatorMode } from "../util";

import LayoutManagerInstance from "../layoutManager";
import SoundManagerInstance from "../soundManager";
import { ACHIEVEMENT_TYPE, LeaderboardData } from './leaderboardDataManager.js';


export default class LeaderboardScreen extends ScreenBase {
    constructor(app) {
        super("Leaderboard", document.querySelector("#leaderboard"), LAYOUTS.EMPTY_LAYOUT, app);

        const leaderboardData = new LeaderboardData();
        // this can take several seconds, be sure to do this in the background, so user is not blocked.
        await leaderboardData.initialize(o3h.Instance);

        // if you are showing the top 3, plus the creator and player's current scores, 
        // use these 2 methods
        const top3 = leaderboardData.getPodiumEntries();
        const creatorAndPlayer = leaderboardData.getNonPodiumEntries();

        // if you are ONLY showing the creator and player standings, use this instead
        // const creatorAndPlayer = leaderboardData.getCreatorPlayerEntries();

        top3.forEach((entry) => { SomehowRenderEntry(
            entry.Name, entry.Score, entry.Rank, 
            entry.IsHost, entry.IsHostReplay, entry.IsEmphasized); });

            /* gameplay happens here */
        const score = count();

        leaderboardData.addScore(score);
        const newTop3 = leaderboardData.getPodiumEntries();
        const newCreatorAndPlayer = leaderboardData.getNonPodiumEntries();

        const bestAchievement = leaderboardData.getBestAchievement();
        SomehowRenderAchievement(bestAchievement.Type, bestAchievement.Description);

        /* mocking data for testing */
        const mockUser = {
            Name: 'testuser',
            AvatarImageUrl: 'http://placekitten.com/256/256',
            Level: 50,
            Type: 0, // 0 for audience, 1 for host
        };

        const entries = [];
        for (let i = 1; i <= 15; i++){
        entries.push({
            Rank: i,
            User: {
            Name: `player${i}`,
            AvatarImageUrl: 'http://placekitten.com/256/256',
            Level: 50,
            Type: 0,
            },
            Score: (16 - i) * 100,
            IsHost: false,
        });
        }
        const mockO3H = new MockO3H(mockUser, entries);

        this.preloadList.addLoad(() => LayoutManagerInstance.createEmptyLayout());
    }

    show() {
        super.show();
        // Shows the camera and audio on/off toggles to the user
        this.app.systemSettingsService.showSystemSettings();
    }

    hide() {        
        super.hide();

        // Set that the tutorial has been seen for this play mode
        const playMode = isCreatorMode() ? "creator" : "audience";
        
    }
}
