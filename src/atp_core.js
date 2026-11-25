// AutoTrimps Plus — core: the ATP object and the helpers every other atp_ file uses.
// Rule: AutoTrimps' files are never edited. We read the game, write AutoTrimps' settings the way its own
// buttons do (setPageSetting), and add the actions AutoTrimps doesn't do.
(function () {
	'use strict';

	var ATP = (window.ATP = window.ATP || {});
	ATP.version = window.ATP_BOOT ? window.ATP_BOOT.version : 'dev';
	ATP.atVersion = atConfig.initialise.version;

	// Console only.
	ATP.log = function (text) {
		console.log('[AutoTrimps Plus] ' + text);
	};

	// The game's message log, the way AutoTrimps writes its own lines (debug() with no type).
	// AutoTrimps' debug() hides such lines while a time warp (offline time) runs, so they wait for its end.
	var waiting = [];
	ATP.say = function (text) {
		if (typeof usingRealTimeOffline !== 'undefined' && usingRealTimeOffline) {
			waiting.push(text);
			return;
		}
		debug(text);
	};
	setInterval(function () {
		if (!waiting.length || (typeof usingRealTimeOffline !== 'undefined' && usingRealTimeOffline)) return;
		waiting.splice(0).forEach(function (text) { debug(text); });
	}, 1000);

	// Change an AutoTrimps setting. Only writes when the value differs, so AutoTrimps saves only on change.
	// universe: 1 or 2 (settings that exist in both universes keep a separate value for each).
	ATP.setSetting = function (id, value, universe) {
		if (!autoTrimpSettings.hasOwnProperty(id)) {
			ATP.log('unknown AutoTrimps setting: ' + id);
			return false;
		}
		universe = universe || 1;
		if (JSON.stringify(getPageSetting(id, universe)) === JSON.stringify(value)) return false;
		setPageSetting(id, value, universe);
		return true;
	};

	ATP.getSetting = function (id, universe) {
		return getPageSetting(id, universe || 1);
	};

	ATP.ready = true;
	ATP.say('AutoTrimps Plus ' + ATP.version + ' is running (with AutoTrimps ' + ATP.atVersion + ').');
})();
