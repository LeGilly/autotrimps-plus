// AutoTrimps Plus — core: the ATP object and the helpers every other atp_ file uses.
// Rule: AutoTrimps' files are never edited. We read the game, write AutoTrimps' settings the way its own
// buttons do (setPageSetting), and add the actions AutoTrimps doesn't do.
(function () {
	'use strict';

	var ATP = (window.ATP = window.ATP || {});
	ATP.version = window.ATP_BOOT ? window.ATP_BOOT.version : 'dev';
	ATP.atVersion = atConfig.initialise.version;
	ATP.status = {}; // what each part is doing, for the tests and later the display
	ATP.managed = {}; // AutoTrimps settings under AT+ control: id -> value

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

	// Small saved state of our own (postponed challenges and the like), separate from AutoTrimps' settings.
	ATP.state = (function () {
		try { return JSON.parse(localStorage.getItem('atpState')) || {}; } catch (e) { return {}; }
	})();
	ATP.saveState = function () {
		try { localStorage.setItem('atpState', JSON.stringify(ATP.state)); } catch (e) { /* storage full or blocked */ }
	};

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

	// A multi-choice setting's option number from the start of its label ('Auto Maps: On' -> 1).
	ATP.optionIndex = function (id, label) {
		var names = autoTrimpSettings[id] && autoTrimpSettings[id].name();
		if (!Array.isArray(names)) return -1;
		for (var i = 0; i < names.length; i++) if (String(names[i]).indexOf(label) === 0) return i;
		return -1;
	};

	// Keep an AutoTrimps setting (Universe 1) at a value while AT+ is on. A hand change is put back.
	ATP.manage = function (id, value) {
		if (!ATP.isActive()) return false;
		var setting = autoTrimpSettings[id];
		if (!setting) {
			if (!ATP.managed[id]) ATP.log('unknown AutoTrimps setting: ' + id);
			ATP.managed[id] = value;
			return false;
		}
		if (setting.type === 'multitoggle' && typeof value === 'string') {
			var index = ATP.optionIndex(id, value);
			if (index < 0) {
				if (ATP.managed[id] !== value) ATP.log('no option "' + value + '" in ' + id);
				ATP.managed[id] = value;
				return false;
			}
			value = index;
		}
		ATP.managed[id] = value;
		markManaged(id);
		return ATP.setSetting(id, value, 1);
	};

	// The AT+ switch: an AutoTrimps setting of its own at the top of the Core tab, saved with AutoTrimps'.
	createSetting(
		'atpEnabled',
		function () { return 'AutoTrimps Plus'; },
		function () {
			return '<p>On: AutoTrimps Plus plays Universe 1 for you. It picks each run (challenges to unlock, Dailies, ' +
				'the best helium challenge), buys Masteries and keeps the AutoTrimps settings it manages (outlined) at ' +
				'their recommended values: a change you make to one of those is put back.</p>' +
				'<p>Off: AutoTrimps Plus does nothing and AutoTrimps is yours again, with the settings as they are now.</p>';
		},
		'boolean', true, null, [0], null, 'Core'
	);
	(function moveSwitchToTop() {
		var parent = document.getElementById('atpEnabledParent');
		var core = document.getElementById('Core');
		if (parent && core && core.children[1]) core.insertBefore(parent, core.children[1]);
	})();

	ATP.isEnabled = function () {
		return !!(autoTrimpSettings.atpEnabled && autoTrimpSettings.atpEnabled.enabled);
	};
	// Universe 1 only for now: in Universe 2 (or with the portal set to it) AT+ waits.
	ATP.isActive = function () {
		return ATP.isEnabled() && game.global.universe === 1 && portalUniverse === 1;
	};

	// Outline the settings AT+ manages in AutoTrimps' window.
	var style = document.createElement('style');
	style.textContent = '._settingBtnParent.atpManaged > ._settingBtn { box-shadow: inset 0 0 0 2px #46b8da; }';
	document.head.appendChild(style);
	function markManaged(id) {
		var parent = document.getElementById(id + 'Parent');
		if (parent && !parent.classList.contains('atpManaged')) parent.classList.add('atpManaged');
	}
	function unmarkAll() {
		Array.prototype.forEach.call(document.querySelectorAll('.atpManaged'), function (el) { el.classList.remove('atpManaged'); });
	}

	// Periodic work. An error is logged once per task instead of stopping it.
	var tasks = [];
	ATP.addTask = function (name, intervalMs, fn) {
		var task = { name: name, fn: fn, failed: false };
		tasks.push(task);
		setInterval(function () {
			if (!ATP.isActive()) return;
			try {
				fn();
			} catch (e) {
				if (!task.failed) console.error('[AutoTrimps Plus] ' + name + ':', e);
				task.failed = true;
			}
		}, intervalMs);
	};
	ATP.runAll = function () { // for the tests: run every task once, now
		tasks.forEach(function (task) { if (ATP.isActive()) task.fn(); });
	};

	var wasActive = null;
	setInterval(function () {
		var active = ATP.isActive();
		if (active === wasActive) return;
		if (wasActive !== null || !active) {
			if (!active) unmarkAll();
			ATP.say(active ? 'AutoTrimps Plus is on.' : ATP.isEnabled() ? 'AutoTrimps Plus waits: it only plays Universe 1 for now.' : 'AutoTrimps Plus is off: AutoTrimps is all yours.');
		}
		wasActive = active;
	}, 1000);

	ATP.say('AutoTrimps Plus ' + ATP.version + ' is running (with AutoTrimps ' + ATP.atVersion + ').');
})();
