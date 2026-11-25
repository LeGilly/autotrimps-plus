// AutoTrimps Plus — run planner (Universe 1). Decides how the current run ends and what the next run is,
// and writes it into AutoTrimps' portal settings, which AutoTrimps reads when it portals.
//   - Unlock runs: a challenge whose reward isn't owned yet, as soon as it can be picked. The run ends as soon
//     as the challenge is completed (AutoTrimps' "Helium Challenges" mode; AutoTrimps runs the completion map).
//   - Dailies: every Daily still open in the last 7 days. One about to expire goes first; otherwise after the
//     unlock runs. Their reward is at least +100% helium for the run, so they always beat a normal run.
//   - Normal runs: "Helium Per Hour" with voids before portaling, inside the best repeatable helium challenge
//     your total helium allows (players' thresholds).
// Facts behind the lists: docs/GAME_NOTES.md (game.challenges in config.js, 5.10.1).
(function () {
	'use strict';

	var ATP = window.ATP;

	// In order of when they open. done(): the game's own test (main.js, challenge list): the perk the challenge
	// `unlocks` is owned, or the challenge's flag. complete: the zone the challenge ends at (its description);
	// it is only started once the highest zone is ATP.UNLOCK_MARGIN past it, so it can be completed in good time.
	ATP.UNLOCK_RUNS = [
		{ name: 'Discipline', complete: 20, reward: 'the Range perk' }, // Dimension of Anger
		{ name: 'Metal', complete: 20, reward: 'the Artisanistry perk' }, // Dimension of Anger
		{ name: 'Size', complete: 20, reward: 'the Carpentry perk' }, // Dimension of Anger
		{ name: 'Scientist', complete: 11, reward: 'the next Scientist level', done: function () { return game.global.sLevel >= 5; } }, // The Block
		{ name: 'Meditate', complete: 33, reward: 'the Meditation perk' }, // Trimple Of Doom
		{ name: 'Decay', complete: 55, reward: 'Gardens maps', done: function () { return game.global.decayDone; } },
		{ name: 'Trimp', complete: 11, reward: 'the Resilience perk' }, // The Block
		{ name: 'Trapper', complete: 33, reward: 'the Anticipation perk' }, // Trimple Of Doom
		{ name: 'Frugal', complete: 20, reward: 'better MegaBooks', done: function () { return game.global.frugalDone; } }, // Dimension of Anger
		{ name: 'Mapocalypse', complete: 80, reward: 'the Siphonology perk' }, // The Prison
		{ name: 'Coordinate', complete: 20, reward: 'the Coordinated perk' }, // Dimension of Anger
		{ name: 'Slow', complete: 120, reward: 'Arbalest and Gambeson', done: function () { return game.global.slowDone; } },
		{ name: 'Mapology', complete: 100, reward: 'the Resourceful perk' },
		{ name: 'Devastation', complete: 170, reward: 'the Overkill perk' } // Imploding Star
	];
	ATP.UNLOCK_MARGIN = 10;

	// Repeatable helium challenges, best first: the bonus applies to all helium up to their zone, so the highest
	// one you can run wins. Players move up by total helium earned (Steam discussion "Recommended Helium thresholds
	// and farming strategies", 2022; docs/GAME_NOTES.md): Lead also wants the Headstart I Mastery (until then
	// Toxicity pays more). Each also needs the highest zone past its zone (Balance, with no helium threshold:
	// ATP.HELIUM_MARGIN past). Watch is left out: Lead pays more (300% vs 200%) at the same zone.
	ATP.HELIUM_RUNS = [
		{ name: 'Domination', zone: 215, bonus: 100, helium: 500e6 },
		{ name: 'Corrupted', zone: 190, bonus: 200, helium: 150e6 },
		{ name: 'Lead', zone: 180, bonus: 300, helium: 80e6, needs: function () { return game.talents.headstart.purchased; } },
		{ name: 'Toxicity', zone: 165, bonus: 400, helium: 35e6 },
		{ name: 'Nom', zone: 145, bonus: 450, helium: 10e6 },
		{ name: 'Crushed', zone: 124, bonus: 400, helium: 3e6 },
		{ name: 'Life', zone: 110, bonus: 400, helium: 1e6 },
		{ name: 'Electricity', zone: 79, bonus: 200, helium: 100e3 },
		{ name: 'Balance', zone: 40, bonus: 100, helium: 0 }
	];
	ATP.HELIUM_MARGIN = 10;
	ATP.STALL_MS = 2 * 3600 * 1000; // an unlock run with no new zone for 2 hours is given up for now

	function hze() {
		return game.global.highestLevelCleared;
	}

	function canPick(name) {
		var challenge = game.challenges[name];
		return !!challenge && challenge.filter() === true;
	}

	function isDone(run) {
		if (run.done) return run.done();
		var perk = game.challenges[run.name].unlocks;
		return !!perk && isPerkUnlocked(perk);
	}

	function postponed(name) {
		var until = (ATP.state.postponed || {})[name];
		return until !== undefined && hze() < until;
	}

	// The unlock run to do next. `current` (the challenge being run now) counts as done: by the time AutoTrimps
	// portals, it is.
	ATP.nextUnlock = function (current) {
		for (var i = 0; i < ATP.UNLOCK_RUNS.length; i++) {
			var run = ATP.UNLOCK_RUNS[i];
			if (run.name === current || isDone(run) || postponed(run.name) || !canPick(run.name)) continue;
			if (hze() < run.complete + ATP.UNLOCK_MARGIN) continue;
			return run;
		}
		return null;
	};

	ATP.bestHeliumRun = function () {
		var helium = game.global.totalHeliumEarned;
		for (var i = 0; i < ATP.HELIUM_RUNS.length; i++) {
			var run = ATP.HELIUM_RUNS[i];
			var zoneNeeded = run.helium > 0 ? run.zone : run.zone + ATP.HELIUM_MARGIN;
			if (helium >= run.helium && hze() >= zoneNeeded && (!run.needs || run.needs()) && canPick(run.name)) return run;
		}
		return null;
	};

	// Dailies still open: day offsets -6 (oldest, expires next) to 0 (today), as the game names them.
	ATP.openDailies = function () {
		if (!canPick('Daily')) return [];
		checkCompleteDailies();
		var open = [];
		for (var day = -6; day <= 0; day++) {
			if (game.global.recentDailies.indexOf(getDailyTimeString(day)) === -1) open.push(day);
		}
		return open;
	};

	function unlockRunning() {
		var current = game.global.challengeActive;
		for (var i = 0; i < ATP.UNLOCK_RUNS.length; i++) if (ATP.UNLOCK_RUNS[i].name === current) return ATP.UNLOCK_RUNS[i];
		return null;
	}

	function heliumRunning() {
		var current = game.global.challengeActive;
		for (var i = 0; i < ATP.HELIUM_RUNS.length; i++) if (ATP.HELIUM_RUNS[i].name === current) return ATP.HELIUM_RUNS[i];
		return null;
	}

	// Stall watch for unlock runs: when the zone stops moving, the challenge waits until the highest zone has
	// grown by 10, and this run ends as a normal run.
	var watch = { portals: -1, zone: -1, since: 0, gaveUp: false };
	function stalled(run) {
		if (watch.portals !== game.global.totalPortals) watch = { portals: game.global.totalPortals, zone: -1, since: 0, gaveUp: false };
		if (game.global.world !== watch.zone) {
			watch.zone = game.global.world;
			watch.since = Date.now();
		}
		if (!watch.gaveUp && run && Date.now() - watch.since > ATP.STALL_MS) {
			watch.gaveUp = true;
			ATP.state.postponed = ATP.state.postponed || {};
			ATP.state.postponed[run.name] = hze() + 10;
			ATP.saveState();
			ATP.say('AT+: ' + run.name + ' is stuck at zone ' + game.global.world + ', so this run ends as a normal run. ' + run.name + ' waits until zone ' + (hze() + 10) + '.');
		}
		return watch.gaveUp;
	}

	// The plan: { thisRun, endMode, next, nextChallenge, daily }.
	ATP.plan = function () {
		var unlockNow = unlockRunning();
		var current = unlockNow ? unlockNow.name : null;
		var unlock = ATP.nextUnlock(current);
		var dailies = ATP.openDailies();
		var expiring = dailies.length && dailies[0] === -6;
		var helium = ATP.bestHeliumRun();

		var thisRun;
		if (game.global.challengeActive === 'Daily') thisRun = 'a Daily';
		else if (unlockNow && !isDone(unlockNow)) thisRun = unlockNow.name + ' (for ' + unlockNow.reward + ')';
		else if (game.global.challengeActive) thisRun = game.global.challengeActive;
		else thisRun = 'a run without challenge';

		var unlockMode = !!unlockNow && !isDone(unlockNow) && !stalled(unlockNow);
		var nextRun = helium ? helium.name : null; // what a normal run would be
		var daily = !!dailies.length && (expiring || !unlock);
		var next;
		if (daily) next = 'a Daily (' + dailies.length + ' open)';
		else if (unlock) next = unlock.name + ' (for ' + unlock.reward + ')';
		else next = helium ? helium.name + ' (+' + helium.bonus + '% helium up to zone ' + helium.zone + ')' : 'a run without challenge';
		// With a Daily next, AutoTrimps picks the Daily itself; the challenge is the fallback if none is left.
		var nextChallenge = unlock ? unlock.name : nextRun;

		return {
			thisRun: thisRun,
			endMode: unlockMode ? 'Helium Challenges' : 'Helium Per Hour',
			next: next,
			nextChallenge: nextChallenge,
			daily: daily
		};
	};

	var lastSaid = '';
	ATP.addTask('planner', 1000, function () {
		var plan = ATP.plan();
		ATP.status.plan = plan;
		ATP.manage('autoPortal', plan.endMode);
		// "Helium Challenges" only portals for a named challenge; 'Off' makes AutoTrimps portal without one.
		ATP.manage('heliumChallenge', plan.nextChallenge || 'Off');
		ATP.manage('heliumHourChallenge', plan.nextChallenge || 'None');
		ATP.manage('dailyPortalStart', plan.daily);
		// Don't portal before a helium challenge pays out.
		var helium = heliumRunning();
		ATP.manage('heliumHrDontPortalBefore', helium ? helium.zone + 1 : -1);

		var text = 'AT+: this run is ' + plan.thisRun + (plan.endMode === 'Helium Challenges' ? ', ending when completed' : ', ending when helium per hour drops (after voids)') + '. Next run: ' + plan.next + '.';
		if (text !== lastSaid) {
			lastSaid = text;
			ATP.say(text);
		}
	});
})();
