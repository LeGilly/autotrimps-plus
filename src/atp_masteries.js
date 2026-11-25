// AutoTrimps Plus — Masteries (game.talents). AutoTrimps never buys them.
// Every Mastery costs the same at a given point (10 × 3^owned Dark Essence, ×6 per Mastery after 25), so only
// the order matters. A tier opens once the tier below holds 2, and allows one fewer than that tier holds (all
// of it once the tier below is full): getAllowedTalentTiers in main.js.
// Order: the players' recommended order (owner's screenshot of the Trimps community list for tiers 1–9, the
// Helium-spec order of the "Full Mastery / Dark Essence" guide for tier 10; docs/GAME_NOTES.md).
// Rushed: Headstart I–II and Hyperspeed I–II are bought as early as the tiers allow, buying only what they need
// below them (in the same order); everything else fills tier by tier. Empty ATP.MASTERY_RUSH to go strictly
// tier by tier.
(function () {
	'use strict';

	var ATP = window.ATP;

	ATP.MASTERY_ORDER = [
		// Tier 1: Bounty Hunter, Portal Generator / Turkimp Tamer I, Bionic Magnet I / Explorer Aura I, Home Detector
		'bounty', 'portal', 'turkimp', 'bionic', 'explorers', 'housing',
		// Tier 2: Headstart I, Herbalist, Scryhard I, Void Power I, Heirnuum I, Metallic Coat
		'headstart', 'herbalist', 'scry', 'voidPower', 'heirloom', 'pierce',
		// Tier 3: Headstart II, Legs for Days, Void Power II, Map Reducer I, King of Bones I, Safe Mapping
		'headstart2', 'daily', 'voidPower2', 'mapLoot', 'skeletimp', 'mapHealth',
		// Tier 4: Hyperspeed I, Randimp, Blacksmithery I, Map Battery / Turkimp Tamer II, Headstart III
		'hyperspeed', 'magimp', 'blacksmith', 'mapBattery', 'turkimp2', 'headstart3',
		// Tier 5: Expert Gen, Magma Flow, Hyperspeed II, Blacksmithery II, Explorer Aura II / King of Bones II
		'quickGen', 'magmaFlow', 'hyperspeed2', 'blacksmith2', 'explorers2', 'skeletimp2',
		// Tier 6: Scryhard II, Void Power III, Liquification I, Blacksmithery III, Heirnuum II, Map at Zonier
		'scry2', 'voidPower3', 'liquification', 'blacksmith3', 'heirloom2', 'maz',
		// Tier 7: Still Rowing I, Magmamancermancy, Patience, Map Reducer II / Kerfluffle, Natural Diplomacy I
		'stillRowing', 'magmamancer', 'patience', 'mapLoot2', 'kerfluffle', 'nature',
		// Tier 8: Void Specialization I, Strength in Health I, Still Rowing II, Amalgagreater / Liquification II, Natural Diplomacy II
		'voidSpecial', 'healthStrength', 'stillRowing2', 'amalg', 'liquification2', 'nature2',
		// Tier 9: Void Specialization II, Flufffocus, Flufffinity, Bionic Magnet II, Excessive / Charged Crits
		'voidSpecial2', 'fluffyExp', 'fluffyAbility', 'bionic2', 'overkill', 'crit',
		// Tier 10 (guide): Mesmer, Strength in Health II, Master of the Void, Still Magmamancing, Liquification III, Angelic
		'mesmer', 'healthStrength2', 'voidMastery', 'stillMagmamancer', 'liquification3', 'angelic'
	];

	ATP.MASTERY_RUSH = ['headstart', 'headstart2', 'hyperspeed', 'hyperspeed2'];

	function requirementsMet(id) {
		var talent = game.talents[id];
		var requires = talent.requires === undefined ? [] : [].concat(talent.requires);
		return requires.every(function (r) { return game.talents[r] && game.talents[r].purchased; });
	}

	function canBuy(id, allowed) {
		var talent = game.talents[id];
		return !!talent && !talent.purchased && allowed[talent.tier - 1] > 0 && requirementsMet(id);
	}

	function orderedIds() {
		// Any Mastery a future game version adds comes last.
		return ATP.MASTERY_ORDER.concat(Object.keys(game.talents).filter(function (id) { return ATP.MASTERY_ORDER.indexOf(id) === -1; }));
	}

	// The best Mastery to buy in one tier (this file's order), or null.
	function bestInTier(tier, allowed) {
		var ids = orderedIds();
		for (var i = 0; i < ids.length; i++) if (game.talents[ids[i]] && game.talents[ids[i]].tier === tier && canBuy(ids[i], allowed)) return ids[i];
		return null;
	}

	ATP.nextMastery = function () {
		var allowed = getAllowedTalentTiers();
		// A rushed Mastery: buy it if possible, otherwise the best one in the highest tier below it that can take
		// one (each purchase there opens a slot one tier up).
		for (var r = 0; r < ATP.MASTERY_RUSH.length; r++) {
			var target = ATP.MASTERY_RUSH[r];
			if (!game.talents[target] || game.talents[target].purchased || !requirementsMet(target)) continue;
			if (canBuy(target, allowed)) return target;
			for (var tier = game.talents[target].tier - 1; tier >= 1; tier--) {
				var step = bestInTier(tier, allowed);
				if (step) return step;
			}
		}
		// Otherwise: the lowest tier first, in this file's order.
		for (var t = 1; t <= getHighestTalentTier(); t++) {
			var id = bestInTier(t, allowed);
			if (id) return id;
		}
		return null;
	};

	ATP.addTask('masteries', 3000, function () {
		for (var guard = 0; guard < 60; guard++) {
			var cost = getNextTalentCost();
			if (cost < 0 || game.global.essence < cost) break;
			var id = ATP.nextMastery();
			if (!id) break;
			completeTalentPurchase(game.talents[id]);
			if (!game.talents[id].purchased) break;
			ATP.say('AT+: bought the Mastery ' + game.talents[id].name + '.');
		}
		ATP.status.nextMastery = ATP.nextMastery();
	});
})();
