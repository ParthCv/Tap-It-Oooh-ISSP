/* eslint no-underscore-dangle: 0 */

/* eslint-disable import/no-unresolved */


const PrivateSymbol = Symbol('private');

/**
 * Class that assists in creating a leaderboard component.
 * <br/>
 * Class takes an o3h module, and can display the leaderboard as many times as desired.
 */
export default class Leaderboard {
    /**
     * Constructor. Loads needed data, but doesn't render the leaderboard
     *
     * @param {o3h} o3h - The o3h api module
     */
    constructor(o3h) {
        this.o3h = o3h;
        this[PrivateSymbol] = {};

        this[PrivateSymbol].currUserInfoPromise = o3h.Instance.getUserDataService().getActiveUserInformation();
        this[PrivateSymbol].leaderboardDataPromise = o3h.Instance.getUserDataService().getLeaderboard();

        this.timings = {
            fadeIn: 500,
            showAchievements: 1500,
            fadeOut: 200,
            displayRank: 5000
        }

        // 1/12 and 1/8 of the screen, but in VH units
        this.smallMoveDistance = 100 / 12;
        this.largeMoveDistance = 100 / 8;

        // gsap seems to be having issues animating marginTop (we could run a plugin, but that would increase footprint)
        // so instead of animating margin-top, we'll just animate the whole margin
        this.tweenProps = {
            noMargin: 0,
            smallAppearMargin: this.smallMoveDistance,
            smallDisappearMargin: -1 * this.smallMoveDistance,
            largeAppearMargin: this.largeMoveDistance,
            largeDisappearMargin: -1 * this.largeMoveDistance
        }

        this[PrivateSymbol].styleConfig = {
            supportedAspects: {
                tallest: 0.463,
                shortest: 0.562
            },

            leaderboard: {
                font: 'Arial',
                size: 2,
                color: "#ffffff"
            },

            listMember: {
                aspectRatio: 5,
                backgroundImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAABkCAYAAABwx8J9AAAEOElEQVR4nO3cwW0UMRSAYYNSA6IAaIMGuHOnMu7caYA2oABEEyAgAgLezeyMx37P/r5btIqUjO33Zy1ln5RSvpV7z56/KABADl+/fP79c979iPi7959+fvH61ZP/foEPH79ZVgAY7Fqj3755We5qL/xN5AGgrz3tvbv6qsgDwKlaNfXRoNeIPADc7sxW7gp6jcgDwB+9G9gs6DUiD8AKIrTt1KDXiDwAmUVtVveg14g8ABFlalGIoNeIPAA9ZW9M2KDXbI18EXoArpjxDWKqoNdcWgDv5gEoC/UgfdAvcWUPsJbVb2ynDXqNyAPMwez+31JBrxF5gNjM5G2WD3qNyAOMYdbuJ+gbiTxAW2ZoW4J+gMgDbGM2nk/QGxN5YHVm3hiC3oHIA7Myy+IQ9EFEHsjGjIpN0AMReSAKsycfQQ9O5IGzmSlzEPSERB7Yy6yYl6BPQuSBf5kBaxH0iYk8rMPZRtAXI/KQnzNLjaAj8hCYs8hWgk6VyEN/zhhHCDqbiTy04+zQmqBzyNbIF8OKhYk3PQg6zV0aVIYaK7DPGUXQ6caVPbOxf4lE0BlK5MnCviQ6QScckWc0+42MBJ0URJ6z2EfMQtBJS+S5lf3BzASdqYg8xb9OsihBZ3oiPzdrCb8IOksS+ZysEVwm6HBP5GPx7OE2gg5XiHwfnikcJ+hwI5E/xrOCcwg6NCDydZ4B9CPocJLVIi/eMJagQ0ezRF68IR5Bh8GiR168IQdBh4BGRV68IS9BhyRaR168YS6CDoltjXyNeMNcnlpPWNPW8AM5eIcOiR29NnftDvMQdEjijPj6QByYh6BDQCOjKvKQk6DDYBliKfIQn6BDRzNFUOQhFkGHk6wYN5GHcQQdGhCty0Qe+hB0uJEYHSfy0J6gwxUi04/IwzGCDvfEIx6Rh+0EnSWJQl4iD3WCztQufV65YT8XkQdBZyIGOH8TeVYj6KRkMLOHyDMzQSc8A5cziTyzEHRCMUiJQOTJSNAZxoAkE5EnOkGnC4OPGYk8kQg6zRlorGxr5ItzQWOCziHiDY+7dCacH1oSdDYzfKAtV/a0JOhUGSowhsizl6BjWEBwIs8Wgr4YQwDmIPL8S9An5nDDWkR+bYI+CYcWqBH5dQh6Qg4jcITIz0nQg3PIgB5EPj9BD8ThASIR+VwEfRCHAshI5OMS9A5sdmBmIh+DoDdmEwOI/AiCfoDNCbCdyJ9L0Dey6QDaE/l2BL3CZgIYR+T3WT7oNglAfCL/uGWCXlv4It4AaYn8Q1MG3V9tAGtaOfLpgy7eAFyzNfIleT9SBV28AWjhUjsydyZs0MUbgN4yX9mHCLp4AxBVlsh3D7p4A5BdxMifGnTxBmAVoyPfLOjiDQAP9Yz8rqCLNwDsc1bkHw26eAPAuVpE/kHQxRsAYrg18j9e+f0dz56/sIwAkMjXL59LKaV8B1YOOlr28fROAAAAAElFTkSuQmCC',
                backgroundImageUrlFirst: 'inherit',
                backgroundImageUrlSecond: 'inherit',
                backgroundImageUrlThird: 'inherit',

                rank: {
                    font: 'inherit',
                    size: 'inherit',
                    color: 'inherit'
                },

                name: {
                    font: 'inherit',
                    size: 'inherit',
                    color: 'inherit'
                },

                score: {
                    font: 'inherit',
                    size: 'inherit',
                    color: 'inherit'
                },

                points: {
                    font: 'inherit',
                    size: 'inherit',
                    color: 'inherit'
                },
            },

            announcement: {
                title: {
                    color: 'inherit',
                    size: 'inherit',
                    font: 'inherit'
                },
                score: {
                    color: 'inherit',
                    size: 'inherit',
                    font: 'inherit'
                }
            },

            rankSection: {
                topPositionPercent: 35
            },

            listSection: {
                topPositionPercent: 35
            }
        };

        this[PrivateSymbol].rankedUp = false;
        this[PrivateSymbol].beatCreatorForFirstTime = false;
        this[PrivateSymbol].haveDismissedAchievements = false;

        this[PrivateSymbol].showLeaderboardWhenLoaded = async (hostElement, isPreGame, playerScore = undefined) => {
            hostElement.innerHTML = '';
            hostElement = this[PrivateSymbol].createElementWithParent('div', hostElement, ['o3h-leaderboard'], 'o3h-leaderboard');

            // things will go awry quickly if we try to show this in creator mode
            if (this.o3h.Instance.playType === this.o3h.PlayType.Creator) {
                return;
            }

            try {
                const userAndLeaderboard = await Promise.all([this[PrivateSymbol].currUserInfoPromise, this[PrivateSymbol].leaderboardDataPromise]);
                const currUserInfo = userAndLeaderboard[0];

                // since we'll be modifying the entries, and we want to be able to reuse the leaderboard,
                // create a deep copy
                const entries = JSON.parse(JSON.stringify(userAndLeaderboard[1].Entries));
                const creatorEntry = entries.find((e) => e.IsOwner);

                if (isPreGame) {
                    await this[PrivateSymbol].createPregameLeaderBoard(currUserInfo, entries, creatorEntry, hostElement);
                } else {
                    await this[PrivateSymbol].createPostGameLeaderBoard(currUserInfo, entries, creatorEntry, hostElement, playerScore);
                }
            } catch (e) {
                /* eslint-disable no-console */
                console.log('error creating pregame leaderboard', e);
            }
        };

        this[PrivateSymbol].createPregameLeaderBoard = (userInfo, entries, creatorEntry, hostElement) => {
            const PODIUM_SIZE = 3;

            const listSection = this[PrivateSymbol].createElementWithParent('div', hostElement, ['o3h-leaderboard__list']);
            const podiumSection = this[PrivateSymbol].createElementWithParent('div', listSection, ['o3h-leaderboard__list_podium']);
            const nonPodiumSection = this[PrivateSymbol].createElementWithParent('div', listSection, ['o3h-leaderboard__list_also-ran']);

            const podiumEntries = entries.slice(0, PODIUM_SIZE);
            this[PrivateSymbol].renderListOfEntries(podiumEntries, podiumSection, userInfo.Name);

            // non-podium list will only show:
            //      1) the creator, if they have a score, and the score isn't in top 3. Some games may not have a creator score
            //      2) the player.  If the player has no score yet, we'll show them anyway with a hyphen in place of their rank and score.
            // We will end up with 1, and at most 2 entries here.
            const nonPodiumEntries = [];
            const playerEntry = entries.find((e) => e.User.Name.toLowerCase() === userInfo.Name.toLowerCase());

            // if creator not in top 3, but has a score, add to non-podium
            if (creatorEntry && creatorEntry.Rank > PODIUM_SIZE) {
                nonPodiumEntries.push(creatorEntry);
            }

            // if user has an entry, insert that too
            if (playerEntry !== undefined) {
                if (playerEntry.Rank > PODIUM_SIZE) {
                    nonPodiumEntries.push(playerEntry);

                    // we blindly tacked the player entry onto the end.  If we should've put it first, reverse the order
                    if (nonPodiumEntries.length === 2 && nonPodiumEntries[1].Rank < nonPodiumEntries[0].Rank) {
                        nonPodiumEntries.reverse();
                    }
                }
            } else {
                // need to push an entry for the user with dashes in place of rank and score
                nonPodiumEntries.push({
                    Rank: '-',
                    Score: '-',
                    IsOwner: false,
                    User: { Name: userInfo.Name, AvatarImageUrl: userInfo.AvatarImageUrl },
                });
            }

            this[PrivateSymbol].renderListOfEntries(nonPodiumEntries, nonPodiumSection, userInfo.Name);
        };

        this[PrivateSymbol].renderListOfEntries = (entries, hostElement, playerName = '') => {
            entries.forEach((entry) => {
                this[PrivateSymbol].buildListItem(hostElement, entry, [], entry.User.Name.toLowerCase() === playerName.toLowerCase());
            });
        };

        this[PrivateSymbol].createPostGameLeaderBoard = async (userInfo, entries, creatorEntry, hostElement, playerScore) => {
            this[PrivateSymbol].haveDismissedAchievements = false;
            this[PrivateSymbol].creatorEntry = creatorEntry;

            this[PrivateSymbol].rankedUp = false;
            this[PrivateSymbol].oldPlayerEntry = entries.find((e) => e.User.Name.toLowerCase() === userInfo.Name.toLowerCase());

            this[PrivateSymbol].newPlayerEntry = this[PrivateSymbol].insertAudienceIntoLeaderboard(entries, userInfo, playerScore);
            if (this[PrivateSymbol].newPlayerEntry === false) {
                throw new Error('could not create player entry in leaderboard');
            }

            const achievements = [];
            if (this[PrivateSymbol].oldPlayerEntry !== undefined && playerScore > this[PrivateSymbol].oldPlayerEntry.Score) {
                achievements.push('New Personal Best');

                if (this[PrivateSymbol].newPlayerEntry.Rank === 1) {
                    achievements.push('New Highscore');
                }
            }

            // MUSTFIX: how do we handle player.score === creator.score?  Is that beating them?
            // if creator has a score, and this is the first time we are getting higher than that score, beat creator
            if (creatorEntry !== undefined && this[PrivateSymbol].newPlayerEntry.Score > creatorEntry.Score
                && (this[PrivateSymbol].oldPlayerEntry === undefined || this[PrivateSymbol].oldPlayerEntry.Score <= creatorEntry.Score)) {
                achievements.push(`Beat ${creatorEntry.User.Name}`);
                this[PrivateSymbol].beatCreatorForFirstTime = true;
            }

            this[PrivateSymbol].rankedUp = this[PrivateSymbol].oldPlayerEntry !== undefined
                && this[PrivateSymbol].newPlayerEntry.Rank < this[PrivateSymbol].oldPlayerEntry.Rank;

            const clickCatcher = this[PrivateSymbol].createElementWithParent('div', hostElement, ['o3h-leaderboard__click-catcher']);
            clickCatcher.addEventListener('click', this[PrivateSymbol].handleDismissClick);
            clickCatcher.addEventListener('touchend', this[PrivateSymbol].handleDismissClick);

            // make rank dialog
            this[PrivateSymbol].createRankSection(hostElement, this[PrivateSymbol].newPlayerEntry.Rank, this[PrivateSymbol].rankedUp);
            document.getElementById('rankAnnouncement').style.opacity = 0;
            document.getElementById('rankDisplay').style.opacity = 0;

            // // if have achievement, cycle through list of them, animating into place
            // if (achievements.length > 0) {
            //     this[PrivateSymbol].createAchievementsSection(hostElement, achievements, this[PrivateSymbol].newPlayerEntry.Score);

            //     // const i in achievements is more concise, but eslint
            //     for (let i = 0; i < achievements.length; i++) {
            //         const ach = document.getElementById(`achievement${i}`);
            //         ach.style.opacity = '0';

            //         await showAchievement(ach, this.timings.fadeIn, this.timings.fadeOut,
            //             this.timings.showAchievements, this.smallMoveDistance);
            //     }

            //     const achScore = document.querySelector('#achievementsScore')
            //     await showAchievement(achScore, this.timings.fadeIn, this.timings.fadeOut,
            //         this.timings.showAchievements, this.smallMoveDistance);
            // }

            // this[PrivateSymbol].dismissAchievements();
        };

        this[PrivateSymbol].handleDismissClick = () => {
            if (this[PrivateSymbol].haveDismissedAchievements) {
                this[PrivateSymbol].dismissRank();
            } else {
                this[PrivateSymbol].dismissAchievements();
            }
        };

        this[PrivateSymbol].dismissAchievements = () => {
            const dismissThis = (delay) => { window.setTimeout(() => this[PrivateSymbol].dismissRank(), delay); };
            this[PrivateSymbol].haveDismissedAchievements = true;

            // hide the previous section
            const achCont = document.getElementById('achievementsContent');
            if (achCont) {
                achCont.style.display = 'none';
            }

            // then bring in rank stuff
            const rankAnnouncement = document.getElementById('rankAnnouncement');
            tweenMarginTopOpacity(rankAnnouncement, {
                duration: this.timings.fadeIn,
                easing: quadOut,
                from: {
                    marginTop: this.tweenProps.smallAppearMargin,
                    opacity: 0
                },
                to: {
                    marginTop: this.tweenProps.noMargin,
                    opacity: 1
                },
                onend: (target) => {
                    tweenMarginTopOpacity(rankAnnouncement, {
                        duration: this.timings.fadeOut,
                        delay: this.timings.displayRank,
                        easing: quadOut,
                        from: {
                            marginTop: this.tweenProps.noMargin,
                            opacity: 1
                        },
                        to: {
                            marginTop: this.tweenProps.smallDisappearMargin,
                            opacity: 0
                        },
                    });
                }
            });

            const rankDisplay = document.getElementById('rankDisplay');
            tweenMarginTopOpacity(rankDisplay, {
                duration: this.timings.fadeIn * 1.1,
                easing: quadOut,
                from: {
                    marginTop: this.tweenProps.smallAppearMargin,
                    opacity: 0
                },
                to: {
                    marginTop: this.tweenProps.noMargin,
                    opacity: 1
                },
                onend: (target) => {
                    tweenMarginTopOpacity(rankDisplay, {
                        duration: this.timings.fadeOut,
                        delay: this.timings.displayRank,
                        easing: quadOut,
                        from: {
                            marginTop: this.tweenProps.noMargin,
                            opacity: 1
                        },
                        to: {
                            marginTop: this.tweenProps.smallDisappearMargin,
                            opacity: 0
                        },
                    });
                }
            });

            // then build out the score cards
            const rankListSection = document.getElementById('rankList');

            // make the player listing
            const playerCard = this[PrivateSymbol].buildListItem(rankListSection, this[PrivateSymbol].newPlayerEntry);
            playerCard.style.opacity = 0;

            // transform px to vh
            const cardHeightVH = 100 * playerCard.offsetHeight / window.innerHeight;
            const travel = cardHeightVH * 3;
            let upperCard = playerCard;
            let lowerCard = false;
            const upperY = 0;
            let lowerY = upperY + cardHeightVH * 1.5;

            if (!this[PrivateSymbol].creatorEntry) {
                // just rocking the player card, so show it for a bit, then dismiss it
                tweenTopOpacity(upperCard, {
                    duration: this.timings.fadeIn,
                    easing: quadOut,
                    from: {
                        top: upperY + travel,
                        opacity: 0
                    },
                    to: {
                        top: upperY,
                        opacity: 1
                    },
                    onend: (target) => {
                        dismissThis(this.timings.displayRank);
                    }
                });
            } else {
                const creatorCard = this[PrivateSymbol].buildListItem(rankListSection, this[PrivateSymbol].creatorEntry);
                creatorCard.style.opacity = 0;

                const rankGap = this[PrivateSymbol].newPlayerEntry.Rank - this[PrivateSymbol].creatorEntry.Rank;
                if (this[PrivateSymbol].oldPlayerEntry !== undefined &&
                    (this[PrivateSymbol].rankedUp && rankGap > 0 || this[PrivateSymbol].beatCreatorForFirstTime)) {
                    this[PrivateSymbol].updateCardRank(playerCard, this[PrivateSymbol].oldPlayerEntry.Rank);
                }

                // if player has a higher rank number (worse rank), put them in lower slot
                // or, if player beat creator, put them lower, because going to swap after we display
                upperCard = (rankGap > 0 || this[PrivateSymbol].beatCreatorForFirstTime) ? creatorCard : playerCard;
                lowerCard = (rankGap > 0 || this[PrivateSymbol].beatCreatorForFirstTime) ? playerCard : creatorCard;

                // if we only increased our rank below the creator, we want to celebrate this tiny shred of victory by
                // flying the cards in, then showing an animation of the player moving up a bit, but still beneath Paco.
                if (this[PrivateSymbol].rankedUp && rankGap > 0) { lowerY = upperY + cardHeightVH * 2.5; }

                // move upper card into place
                tweenTopOpacity(upperCard, {
                    duration: this.timings.fadeIn,
                    easing: quadOut,
                    delay: this.timings.fadeIn * 0.2,
                    from: {
                        top: upperY + travel,
                        opacity: 0
                    },
                    to: {
                        top: upperY,
                        opacity: 1
                    }
                });

                // move lower card into place
                tweenTopOpacity(lowerCard, {
                    duration: this.timings.fadeIn,
                    easing: quadOut,
                    delay: this.timings.fadeIn * 0.2,
                    from: {
                        top: lowerY + travel,
                        opacity: 0
                    },
                    to: {
                        top: lowerY,
                        opacity: 1
                    },
                    onend: (target) => {
                        this[PrivateSymbol].doSwapAnimation(upperCard, lowerCard, dismissThis);
                    }
                });
            }
        };

        this[PrivateSymbol].doSwapAnimation = (upperCard, lowerCard, dismissThis) => {
            // gsap can't deal with non-existent dom element properties without using a plugin, so just make an object
            let oldRank = 9999999;
            if (this[PrivateSymbol].oldPlayerEntry){
                oldRank = this[PrivateSymbol].oldPlayerEntry.Rank;
            }

            const cardHeightVH = 100 * upperCard.offsetHeight / window.innerHeight;
            const upperY = 0;
            let lowerY = upperY + cardHeightVH * 1.5;
            const rankChanger = { rank: oldRank };
            const travel = cardHeightVH * 1.5;

            if (this[PrivateSymbol].beatCreatorForFirstTime) {
                const thisDelay = this.timings.displayRank * 0.25;
                const nextDelay = this.timings.displayRank * 0.7;

                // move lower card into place
                tweenOpacity(lowerCard, {
                    duration: this.timings.fadeIn,
                    easing: quadOut,
                    delay: this.timings.fadeIn * 0.2,
                    from: {
                        opacity: 1
                    },
                    to: {
                        opacity: 1
                    },
                    onprogress: (target, t) => {
                        // MUSTFIX: animate this by using t which goes 0 to 1
                        // old: oldRank
                        const r = this[PrivateSymbol].newPlayerEntry.Rank
                        this[PrivateSymbol].updateCardRank(lowerCard, r);
                    }
                });

                // scale creator card back behind player
                tweenScale(upperCard, {
                    duration: this.timings.fadeIn / 2,
                    easing: sineOut,
                    delay: thisDelay,
                    from: { x: 1, y: 1 },
                    to: { x: 0.82, y: 0.82 },
                    onend: (target) => {
                        tweenScale(upperCard, {
                            duration: this.timings.fadeIn / 2,
                            easing: sineIn,
                            delay: thisDelay,
                            from: { x: 0.82, y: 0.82 },
                            to: { x: 1, y: 1 },
                        });
                    }
                });

                // scale player card up over audience
                tweenScale(lowerCard, {
                    duration: this.timings.fadeIn / 2,
                    easing: sineOut,
                    delay: thisDelay,
                    from: { x: 1, y: 1 },
                    to: { x: 1.13, y: 1.13 },
                    onend: (target) => {
                        tweenScale(lowerCard, {
                            duration: this.timings.fadeIn / 2,
                            easing: sineIn,
                            delay: thisDelay,
                            from: { x: 1.13, y: 1.13 },
                            to: { x: 1, y: 1 },
                        });
                    }
                });

                // swap spots
                tweenTopOpacity(lowerCard, {
                    duration: this.timings.fadeIn,
                    easing: linear,
                    delay: thisDelay,
                    from: { top:upperY, opacity: 1 },
                    to: { top:lowerY, opacity: 1 }
                });

                tweenTopOpacity(upperCard, {
                    duration: this.timings.fadeIn,
                    easing: linear,
                    delay: thisDelay,
                    from: { top:lowerY, opacity: 1 },
                    to: { top:upperY, opacity: 1 },
                    onend: (target) => {
                        tweenTopOpacity(lowerCard, {
                            duration: this.timings.fadeIn,
                            easing: quadIn,
                            delay: thisDelay,
                            from: { top:upperY, opacity: 1 },
                            to: { top:upperY - travel, opacity: 0 }
                        });

                        tweenTopOpacity(upperCard, {
                            duration: this.timings.fadeIn,
                            easing: quadIn,
                            delay: thisDelay,
                            from: { top:lowerY, opacity: 1 },
                            to: { top:lowerY - travel, opacity: 0 },
                            onend: (target) => {
                                dismissThis(0);
                            }
                        });
                    }
                });
            } else if (this[PrivateSymbol].rankedUp && rankGap > 0) {
                // slide player up
                tweenTopOpacity(lowerCard, {
                    duration: this.timings.fadeIn,
                    easing: quadOut,
                    delay: this.timings.fadeIn * 0.2,
                    from: {
                        top: lowerCard.style.top,
                        opacity: 1
                    },
                    to: {
                        top: upperY + cardHeightVH * 1.5,
                        opacity: 1
                    },
                    onprogress: (target, t) => {
                        // MUSTFIX: animate this by using t which goes 0 to 1
                        // old: oldRank
                        const r = this[PrivateSymbol].newPlayerEntry.Rank
                        this[PrivateSymbol].updateCardRank(lowerCard, r);
                    }
                });
            } else {
                dismissThis(this.timings.displayRank);
            }

        }

        this[PrivateSymbol].updateCardRank = (cardElement, newRank) => {
            // when we animate rank, we'll get float values, so round it off
            newRank = Math.round(newRank);

            [...cardElement.children].forEach((child) => {
                if (child.classList.contains('o3h-leaderboard__list-member-rank')) {
                    child.innerHTML = newRank;
                }
            });
        };

        this[PrivateSymbol].dismissRank = () => {
            // immediately hide achievements
            document.getElementById('o3h-leaderboard').innerHTML = '';
        };

        this[PrivateSymbol].insertAudienceIntoLeaderboard = (leaderboardEntries, user, score) => {
            // find where we want to insert an entry for the current user, it should be below all the better scores and above all the worse scores
            let insertAtIndex = leaderboardEntries.findIndex((entry) => score >= entry.Score);
            const currentUserIndex = leaderboardEntries.findIndex((entry) => user.Name === entry.User.Name);

            if (insertAtIndex < 0) {
                insertAtIndex = leaderboardEntries.length;
            }

            // if they're in the leaderboard already, and already have a better score, don't change anything
            if (currentUserIndex >= 0 && insertAtIndex >= currentUserIndex) {
                return leaderboardEntries[currentUserIndex];
            }

            const playerObject = {
                Score: score,
                Rank: insertAtIndex + 1,
                User: user,
                IsOwner: false,
            };

            // make an Entry object for the score and put it in at the right place
            leaderboardEntries.splice(insertAtIndex, 0, playerObject);

            // splice out any entries in the leaderboard that have the same user name as the current user (skipping the first, best score for the user)
            // this works because user names are unique on Oooh
            let foundBest = false;
            for (let i = 0; i < leaderboardEntries.length; i++) {
                const entry = leaderboardEntries[i];
                if (entry.User.Name === user.Name) {
                    if (!foundBest) {
                        foundBest = true;
                    } else {
                        leaderboardEntries.splice(i, 1);
                        i--;
                    }
                }
                leaderboardEntries[i].Rank = i + 1;
            }

            return playerObject;
        };

        this[PrivateSymbol].buildListItem = (listElement, entry, classNames = null, isMe = false) => {
            const classes = [];

            // eslint won't handle null coalesce
            if (!classNames) {
                classNames = [];
            }

            classNames.forEach((cn) => {
                classes.push(`o3h-leaderboard__list-member--${cn}`);
            });

            const meClass = isMe ? 'o3h-leaderboard__list-member--self' : false;
            const listItem = this[PrivateSymbol].createElementWithParent('div', listElement, ['o3h-leaderboard__list-member'], meClass);
            listItem.setAttribute('data-rank', entry.Rank);

            const listItemContent = `
                <div class='o3h-leaderboard__list-member-rank'>${entry.Rank}</div>
                <div class='o3h-leaderboard__list-member-avatar' style='background-image: url(${entry.User.AvatarImageUrl})'></div>
                <div class='o3h-leaderboard__list-member-name'>${entry.User.Name}</div>
                <div class='o3h-leaderboard__list-member-score'>
                    <span class='o3h-leaderboard__list-member-score-num'>${entry.Score}${entry.Score !== '-' ? 'pts' : ''}</span>
                </div>
            `;

            listItem.innerHTML = listItemContent;
            return listItem;
        };

        this[PrivateSymbol].createElementWithParent = (elementType, parentElement, classes, id = null) => {
            const thisElement = document.createElement(elementType);
            parentElement.appendChild(thisElement);

            classes.forEach((c) => {
                if (c && c.length > 0) {
                    thisElement.classList.add(c);
                }
            });

            if (id) {
                thisElement.setAttribute('id', id);
            }

            return thisElement;
        };

        this[PrivateSymbol].createAchievementsSection = (parentElement, achievements, score) => {
            const chievos = [];
            for (let chievoIndex = 0; chievoIndex < achievements.length; chievoIndex++) {
                chievos.push(`
                    <div class='o3h-leaderboard__achievements-box_achievement' id='achievement${chievoIndex}' style='opacity: 0'>
                        <span>${achievements[chievoIndex]}</span>
                    </div>
                `);
            }

            const achievementsElement = this[PrivateSymbol].createElementWithParent('div', parentElement, ['o3h-leaderboard__achievements-box']);
            achievementsElement.innerHTML = `
                <div id='achievementsContent' class='o3h-leaderboard__achievements-box_content'>
                    ${chievos.join('')}
                    <div class='o3h-leaderboard__achievements-box_score' id='achievementsScore' style='opacity: 0'>
                        <span>${score}</span>
                    </div>
                </div>
            `;

            return achievementsElement;
        };

        this[PrivateSymbol].createRankSection = (parentElement, rank, isNewRank) => {
            const rankBox = this[PrivateSymbol].createElementWithParent('div', parentElement, ['o3h-leaderboard__rank-box']);
            rankBox.innerHTML = `
                <div id='rankContent' class='o3h-leaderboard__rank-box_content'>
                    <div class='o3h-leaderboard__rank-box_announcement' id='rankAnnouncement'>${isNewRank ? 'New Rank!' : 'Rank'}</div>
                    <div class='o3h-leaderboard__rank-box_number' id='rankDisplay'>${rank}</div>
                </div>
                <div id='rankList' class='o3h-leaderboard__rank-box_list'></div>
            `;

            return rankBox;
        };
    }

    /**
     * Wait for all the needed data to preload
     * @returns {Promise<unknown[]>} A promise that resolves when all needed data is preloaded.
     */
    async preloadData() {
        return Promise.all(
            [this[PrivateSymbol].currUserInfoPromise, this[PrivateSymbol].leaderboardDataPromise]
        );
    }

    /**
     * Shows the pre-game leaderboard, attaching it to the provided DOM element.
     * The pre-game leaderboard displays existing scores, and the player's current best score, if any
     *
     * @param {HTMLElement} hostElement - The DOM element to attach the leaderboard to
     */
    async showPreGame(hostElement) {
        await this[PrivateSymbol].showLeaderboardWhenLoaded(hostElement, true);
    }

    /**
     * Shows the post-game leaderboard, attaching it to the provided DOM element.
     * The post-game leaderboard only shows the creator's score, and the player's new score,
     * as well as any achievements from the current game.
     *
     * @param {HTMLElement} hostElement - The DOM element to attach the leaderboard to
     * @param {number} playerScore - The player's new score
     */
    async showPostGame(hostElement, playerScore) {
        await this[PrivateSymbol].showLeaderboardWhenLoaded(hostElement, false, playerScore);
    }

    /**
     * Sets basic leaderboard font and rendering styles
     *
     * Can be chained with any other modifyXYZ calls.
     *
     * You must call buildStyles afterward.
     *
     * @param {string} fontFamily - The default font family to use for the leaderboard.  The font must be loaded and available.
     * @param {string} fontColor - The default color for all leaderboard text
     * @param {number} fontSize - The default font size for all leaderboard text, in VH units
     * @param {string} listItemBackgroundImageUrl - The image to use as a background for leaderboard entries. Image should be pre-loaded to prevent flash-of-unstyled-content
     */
    modifyBasicCardStyles(fontFamily, fontColor, fontSize, listItemBackgroundImageUrl){
        this[PrivateSymbol].styleConfig.leaderboard.font = fontFamily;
        this[PrivateSymbol].styleConfig.leaderboard.size = fontSize;
        this[PrivateSymbol].styleConfig.leaderboard.color = fontColor;

        this[PrivateSymbol].styleConfig.listMember.backgroundImageUrl = listItemBackgroundImageUrl;
        this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlFirst = listItemBackgroundImageUrl;
        this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlSecond = listItemBackgroundImageUrl;
        this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlThird = listItemBackgroundImageUrl;

        return this;
    }

    /**
     * Sets the background images for first/second/third place leaderboard entries, when showing in pre-game mode.
     *
     * Can be chained with any other modifyXYZ calls.
     *
     * You must call buildStyles afterward
     *
     * @param {string} firstPlaceUrl - path to the first place background image
     * @param {string} secondPlaceUrl - path to the second place background image
     * @param {string} thirdPlaceUrl - path to the third place background image
     */
    modifyListMemberPlaceBackgrounds(firstPlaceUrl, secondPlaceUrl, thirdPlaceUrl){
        this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlFirst = firstPlaceUrl;
        this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlSecond = secondPlaceUrl;
        this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlThird = thirdPlaceUrl;

        return this;
    }

    /**
     * Sets more detailed styling on the leaderboard
     *
     * Can be chained with any other modifyXYZ calls.
     *
     * You must call buildStyles afterward.
     *
     * @param {string} rankFont - Font family to use for the rank on leaderboard entries
     * @param {string} rankColor - Color to use for the rank on leaderboard entries
     * @param {number} rankSize - Size in VH units to use for the rank on leaderboard entries
     * @param {string} nameFont - Font family to use for the player name on leaderboard entries
     * @param {string} nameColor - Color to use for the player name on leaderboard entries
     * @param {number} nameSize - Size in VH units to use for the player name on leaderboard entries
     * @param {string} scoreFont - Font family to use for the score on leaderboard entries
     * @param {string} scoreColor - Color to use for the score on leaderboard entries
     * @param {number} scoreSize - Size in VH units to use for the score on leaderboard entries
     * @param {string} pointsFont - Font family to use for the word "pts" on leaderboard entries. This sits right next to the score.
     * @param {string} pointsColor - Color to use for the word "pts" on leaderboard entries. This sits right next to the score.
     * @param {number} pointsSize - Size in VH units to use for the word "pts" on leaderboard entries. This sits right next to the score.
     */
    modifyExtendedCardStyles(rankFont, rankColor, rankSize, nameFont, nameColor, nameSize, scoreFont, scoreColor, scoreSize, pointsFont, pointsColor, pointsSize){
        this[PrivateSymbol].styleConfig.listMember.rank.font = rankFont;
        this[PrivateSymbol].styleConfig.listMember.rank.color = rankColor;
        this[PrivateSymbol].styleConfig.listMember.rank.size = rankSize + 'vh';

        this[PrivateSymbol].styleConfig.listMember.name.font = nameFont;
        this[PrivateSymbol].styleConfig.listMember.name.color = nameColor;
        this[PrivateSymbol].styleConfig.listMember.name.size = nameSize + 'vh';

        this[PrivateSymbol].styleConfig.listMember.score.font = scoreFont;
        this[PrivateSymbol].styleConfig.listMember.score.color = scoreColor;
        this[PrivateSymbol].styleConfig.listMember.score.size = scoreSize + 'vh';

        this[PrivateSymbol].styleConfig.listMember.points.font = pointsFont;
        this[PrivateSymbol].styleConfig.listMember.points.color = pointsColor;
        this[PrivateSymbol].styleConfig.listMember.points.size = pointsSize + 'vh';

        return this;
    }

    /**
     * Sets styles for the announcements that display in post-game mode, such as "Highscore - 1234", or "Beat Creator"
     *
     * Can be chained with any other modifyXYZ calls.
     *
     * You must call buildStyles afterward.
     *
     * @param {string} titleFont - Font family to use for the announcement text
     * @param {string} titleColor - Color to use for the announcement text
     * @param {number} titleSize - Size in VH units to use for the announcement text
     * @param {string} scoreFont - Font family to use for the announcement number (rank, score, etc)
     * @param {string} scoreColor - Color to use for the announcement number (rank, score, etc)
     * @param {number} scoreSize - Size in VH units to use for the announcement number (rank, score, etc)
     */
    modifyAnnouncementStyles(titleFont, titleColor, titleSize, scoreFont, scoreColor, scoreSize){
        this[PrivateSymbol].styleConfig.announcement.title.font = titleFont;
        this[PrivateSymbol].styleConfig.announcement.title.color = titleColor;
        this[PrivateSymbol].styleConfig.announcement.title.size = titleSize + 'vh';

        this[PrivateSymbol].styleConfig.announcement.score.font = scoreFont;
        this[PrivateSymbol].styleConfig.announcement.score.color = scoreColor;
        this[PrivateSymbol].styleConfig.announcement.score.size = scoreSize + 'vh';

        return this;
    }

    /**
     * Builds the styles and adds them to the DOM.  This must be called after any modifyXYZ styling calls.
     */
    buildStyles() {
        const stylesheetId = 'o3h-leaderboard-stylesheet';
        const existingStylesheet = document.getElementById(stylesheetId);
        if (existingStylesheet){
            existingStylesheet.parentNode.removeChild(existingStylesheet);
        }

        const styleNode = document.createElement('style');
        styleNode.id = stylesheetId;
        styleNode.innerHTML = `
            .o3h-leaderboard {
                font: ${this[PrivateSymbol].styleConfig.leaderboard.size}vh ${this[PrivateSymbol].styleConfig.leaderboard.font};
                color: ${this[PrivateSymbol].styleConfig.leaderboard.color};
                width: calc(100vh * ${this[PrivateSymbol].styleConfig.supportedAspects.tallest});
            }
            
            .o3h-leaderboard__click-catcher {
                width: 100vw;
                height: 100vh;
                z-index: 1000;
                position: fixed;
                top: 0;
                left: 0;
            }
            
            .o3h-leaderboard__list {
                position: absolute;
                z-index: 1;
                left: 0;
                top: ${this[PrivateSymbol].styleConfig.listSection.topPositionPercent}vh;
                height: calc(100vh - ${this[PrivateSymbol].styleConfig.listSection.topPositionPercent}vh);
                display: flex;
                flex-direction: column;
                width: 100%;
            }
            
            .o3h-leaderboard__list_podium {
                margin-bottom: 5vh;
            }
            
            .o3h-leaderboard__list-member {
                display: flex;
                flex-direction: row;
                align-items: center;
                width: 100vw;
                max-width: calc(100vh * ${this[PrivateSymbol].styleConfig.supportedAspects.shortest});
                height: calc(100vw / ${this[PrivateSymbol].styleConfig.listMember.aspectRatio});
                max-height: calc(100vh * ${this[PrivateSymbol].styleConfig.supportedAspects.shortest} / ${this[PrivateSymbol].styleConfig.listMember.aspectRatio});
                margin: 0 auto;
                background-position: center;
                background-repeat: no-repeat;
                background-size: contain;
                background-image: url(${this[PrivateSymbol].styleConfig.listMember.backgroundImageUrl});
                padding: 0 4vh;
                box-sizing: border-box;
            }
            
            .o3h-leaderboard__list-member[data-rank="1"] {
                background-image: url(${this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlFirst});
            }
            
            .o3h-leaderboard__list-member[data-rank="2"] {
                background-image: url(${this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlSecond});
            }
            
            .o3h-leaderboard__list-member[data-rank="3"] {
                background-image: url(${this[PrivateSymbol].styleConfig.listMember.backgroundImageUrlThird});
            }
            
            .o3h-leaderboard__list-member-rank,
            .o3h-leaderboard__list-member-avatar,
            .o3h-leaderboard__list-member-name,
            .o3h-leaderboard__list-member-score {
                display: inline-block;
                flex-shrink: 0;
            }
            
            .o3h-leaderboard__list-member-rank{
                font: ${this[PrivateSymbol].styleConfig.listMember.rank.size} ${this[PrivateSymbol].styleConfig.listMember.rank.font};
                color: ${this[PrivateSymbol].styleConfig.listMember.rank.color};
                min-width: 5vh;
            }
            
            .o3h-leaderboard__list-member-avatar{
                border-radius: 50%;
                width: 4vh;
                height: 4vh;
                margin-right: 1vh;
                background: gray;
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
            }
            
            .o3h-leaderboard__list-member-name{
                font: ${this[PrivateSymbol].styleConfig.listMember.name.size} ${this[PrivateSymbol].styleConfig.listMember.name.font};
                color: ${this[PrivateSymbol].styleConfig.listMember.name.color};
            }
            
            .o3h-leaderboard__list-member-score{
                flex-grow: 1;
                text-align: right;
            }
            
            .o3h-leaderboard__list-member-score-num{
                font: ${this[PrivateSymbol].styleConfig.listMember.score.size} ${this[PrivateSymbol].styleConfig.listMember.score.font};
                color: ${this[PrivateSymbol].styleConfig.listMember.score.color};
            }
            
            .o3h-leaderboard__list-member-score-pts{
                font: ${this[PrivateSymbol].styleConfig.listMember.points.size} ${this[PrivateSymbol].styleConfig.listMember.points.font};
                color: ${this[PrivateSymbol].styleConfig.listMember.points.color};
            }
            
            .o3h-leaderboard__list-spacer {
                height: 2vh;
            }
            
            .o3h-leaderboard__achievements-box {
                position: absolute;
                z-index: 1;
                left: 0;
                top: ${this[PrivateSymbol].styleConfig.listSection.topPositionPercent}vh;
                height: calc(100vh - ${this[PrivateSymbol].styleConfig.listSection.topPositionPercent}vh);
                width: 100%;
                display: flex;
                flex-direction: column;
                width: 100%;
                overflow: hidden;
            }
            
            .o3h-leaderboard__achievements-box_content,
            .o3h-leaderboard__rank-box_content {
                top: 7vh;
                position: absolute;
                width: 100%;
                height: 100%;
            }
            
            .o3h-leaderboard__rank-box_list {
                top: 20vh;
                position: absolute;
                width: 100%;
                height: 100%;
            }
            
            .o3h-leaderboard__rank-box_list .o3h-leaderboard__list-member {
                position: absolute;
                left: 0;
                right: 0;
            }
            
            .o3h-leaderboard__rank-box_list .o3h-leaderboard__list-member-wrapper#o3h-leaderboard__list-member--self {
                z-index: 1;
            }
            
            
            .o3h-leaderboard__achievements-box_achievement,
            .o3h-leaderboard__rank-box_announcement {
                position: absolute;
                left: 0;
                right: 0;
                text-align: center;
                color: ${this[PrivateSymbol].styleConfig.announcement.title.color};
                font-size: ${this[PrivateSymbol].styleConfig.announcement.title.size};
                font-family: ${this[PrivateSymbol].styleConfig.announcement.title.font};
            }
            
            .o3h-leaderboard__achievements-box_score,
            .o3h-leaderboard__rank-box_number {
                position: absolute;
                top: 5vh;
                left: 0;
                right: 0;
                text-align: center;
                color: ${this[PrivateSymbol].styleConfig.announcement.score.color};
                font-size: ${this[PrivateSymbol].styleConfig.announcement.score.size};
                font-family: ${this[PrivateSymbol].styleConfig.announcement.score.font};
            }
            
            .o3h-leaderboard__rank-box {
                position: absolute;
                z-index: 0;
                left: 0;
                top: ${this[PrivateSymbol].styleConfig.listSection.topPositionPercent}vh;
                width: 100%;
                height: calc(100vh - ${this[PrivateSymbol].styleConfig.listSection.topPositionPercent}vh);
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                overflow: hidden;
            
                background-size: contain;
                background-repeat: no-repeat;
                background-position: top;
            }
            
            .o3h-leadboard__rank-box .o3h-leaderboard__list-member {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
            }
        `;

        document.body.appendChild(styleNode);
    }
}
