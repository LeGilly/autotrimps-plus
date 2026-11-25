// AutoTrimps Plus — baseline settings: AutoTrimps' own "Recommended:" values for Universe 1, chosen by hand
// from docs/at-settings-catalogue.csv (AutoTrimps v7.2.8), plus the few that depend on progress.
// Multi-choice settings are given by the start of their label (e.g. 'Auto Abandon: Smart'); ATP.manage turns
// it into AutoTrimps' option number, so a reordered list in a new AutoTrimps can't pick the wrong option.
// Left out on purpose (for later versions): heirloom swapping and auto-keeping (needs heirloom choices),
// nature tokens and Fluffy evolution (AutoTrimps itself recommends off for now), the C² runner, recommendations
// without a usable value, and everything visual (Display tab, game options such as the theme).
(function () {
	'use strict';

	var ATP = window.ATP;

	ATP.BASELINE = [
		// Core
		['autoPerks', true], // Perky allocates perks on portal…
		['presetSwap', true], // …with the preset that suits the challenge and highest zone
		['autoHeirlooms', true], // spends Nullifium on carried and equipped heirlooms
		// Equipment
		['equipPortal', true],
		['equipZone', [999]],
		['equipPrestige', 'AE: Prestige: Trimple'],
		// Buildings
		['warpstation', true],
		['advancedNurseriesMapCap', 3],
		// Jobs: Gene Assist and its timers
		['geneAssist', true],
		['geneAssistTimer', 10],
		['geneAssistTimerBleedVoids', 6],
		['geneAssistTimerDaily', 2],
		['geneAssistTimerDailyHard', 2],
		// Combat
		['autoAbandon', 'Auto Abandon: Smart'],
		['ignoreCrits', 'Ignore Crits: Void Strength'],
		['autoLevelScryer', true],
		['scryerVoidMaps', true],
		['scryerVoidMapsDaily', true],
		['autoStanceScryer', true],
		['scryerMaxZone', 9999],
		['scryerMaxHits', 100],
		['scryerEssenceOnly', true],
		['scryerMaps', 'Scry Maps: Maybe'],
		['scryerSpire', 'Scry Spire: Maybe'],
		['scryerWorld', 'Scry World: Maybe'],
		['scryerCorrupted', 'Scry Corrupted: Maybe'],
		['scryerHealthy', 'Scry Healthy: Maybe'],
		['autoStanceWind', true],
		['windStackingRatio', 1000],
		['windStackingLiq', false],
		['autoStanceWindDaily', true],
		['windStackingRatioDaily', 1000],
		// Maps
		['autoMaps', 'Auto Maps: On'],
		['hitsSurvived', 1.5],
		['hitsSurvivedReset', 'Hits Survived Reset: S'],
		['mapBonusLevelType', true],
		['mapBonusRatio', 4],
		['mapBonusPrestige', true],
		['uniqueMapUnlocks', true],
		// Portal: helium per hour with voids before portaling (the planner picks the mode and challenge)
		['portalRespec', 'Portal: Refresh Respec On'],
		['heliumHrBuffer', 4],
		['heliumHrPortal', 'Portal: After Voids'],
		['heliumHrExitSpire', true],
		['autoPortalUniverseSwap', false], // Universe 1 only for now
		['dailyPortal', 'Daily Portal: He/Hr'],
		['dailyHeliumHrBuffer', 4],
		['dailyHeliumHrPortal', 'Daily Portal: After Voids'],
		['dailyHeliumHrExitSpire', true],
		['dailyPortalFiller', false],
		['dailyDontCap', false],
		// Challenges AutoTrimps has its own handling for
		['balance', true],
		['balanceImprobDestack', true],
		['decay', true],
		['decayStacksToPush', 150],
		['decayStacksToAbandon', 400],
		['life', true],
		['lifeZone', 100],
		['lifeStacks', 100],
		['experience', true],
		['experienceC2', true],
		['frigid', true],
		['mapology', true],
		['lead', true],
		// Dailies
		['bloodthirstVoidMax', true],
		['mapOddEvenIncrement', true],
		// Spire
		['spireHitsSurvived', 10],
		['spireHitsSurvivedOneOff', 10],
		['spireHitsSurvivedC2', 10],
		['spireHitsSurvivedDaily', 10],
		// Dimensional Generator and magmite
		['autoGen', true],
		['autoGenModeBefore', 'Start Gen Mode: Gain Mi'],
		['autoGenModeAfter', 'End Gen Mode: Gain Mi'],
		['magmiteAutoFuel', true],
		['magmiteMinimize', true],
		['magmiteSpending', 'Spend Magmite: Portal']
	];

	// Values that follow progress. AutoTrimps: wind stacking from "100 zones below portal zone".
	ATP.progressSettings = function () {
		var hze = game.global.highestLevelCleared + 1;
		var windZone = Math.max(hze - 100, 1);
		return [
			['windStackingZone', windZone],
			['windStackingZoneDaily', windZone]
		];
	};

	ATP.addTask('settings', 2000, function () {
		ATP.BASELINE.concat(ATP.progressSettings()).forEach(function (entry) {
			ATP.manage(entry[0], entry[1]);
		});
	});
})();
