// AutoTrimps Plus — loader. The Steam version of Trimps runs Trimps\mods\mods.js after the game itself.
// This file starts AutoTrimps (SadAugust's fork, unmodified, see vendor/autotrimps/) and then AutoTrimps Plus,
// all from the autotrimps-plus folder next to it. Nothing is downloaded.
// tools/build.mjs copies it into the release as-is; keep the version line below in this exact form.
(function () {
	'use strict';

	var ATP_LOADER = { version: '0.2.0' };

	var here = document.currentScript && document.currentScript.src ? document.currentScript.src : 'mods/mods.js';
	var base = here.replace(/[^/]*$/, '') + 'autotrimps-plus/';

	window.ATP_BOOT = {
		version: ATP_LOADER.version,
		base: base,
		// Our own files, loaded in this order once AutoTrimps has finished starting.
		scripts: ['atp/atp_core.js', 'atp/atp_settings.js', 'atp/atp_planner.js', 'atp/atp_masteries.js']
	};

	// As AutoTrimps' own mods.js does: hold offline progress until AutoTrimps is running (it restores the limit).
	window.offlineTimeSpeed = game.global.timeWarpLimit;
	game.global.timeWarpLimit = 0;

	function addCss(href) {
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = href;
		document.head.appendChild(link);
	}

	function addScript(src) {
		var script = document.createElement('script');
		script.src = src;
		script.async = false; // run in the order added
		document.head.appendChild(script);
	}

	addCss(base + 'lib/select2.min.css');
	addScript(base + 'lib/jquery.min.js');
	addScript(base + 'lib/select2.min.js');
	addScript(base + 'at/AutoTrimps2.js');
	// Must run right after AutoTrimps2.js, before it fetches its outside scripts (see atp_boot.js).
	addScript(base + 'atp/atp_boot.js');
})();
