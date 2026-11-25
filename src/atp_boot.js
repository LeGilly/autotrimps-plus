// AutoTrimps Plus — runs right after AutoTrimps2.js, while AutoTrimps waits for its first module.
// AutoTrimps would fetch jQuery, select2 and two add-ons (graphs, void map clarifier) from outside sites.
// mods.js already loaded our local jQuery and select2, so all four are marked as loaded here and skipped,
// and the select2 stylesheet from the CDN is skipped the same way (ours is in lib/).
// Then, once AutoTrimps is running, our own files are loaded (ATP_BOOT.scripts), and ATP.ready set after the last.
(function () {
	'use strict';

	var boot = window.ATP_BOOT;
	var mods = atConfig.modules;
	var skip = mods.installedExternal.slice();
	skip.push('https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css');
	skip.forEach(function (url) {
		if (mods.loadedExternal.indexOf(url) === -1) mods.loadedExternal.push(url);
	});
	boot.skippedExternal = skip;

	function loadNext(i) {
		if (i >= boot.scripts.length) {
			if (window.ATP) window.ATP.ready = true; // every AT+ file is in
			return;
		}
		var script = document.createElement('script');
		script.src = boot.base + boot.scripts[i];
		script.onload = function () { loadNext(i + 1); };
		script.onerror = function () { console.error('AutoTrimps Plus: could not load ' + boot.scripts[i]); };
		document.head.appendChild(script);
	}

	var waited = 0;
	(function waitForAutoTrimps() {
		if (atConfig.initialise.loaded) return loadNext(0);
		waited += 250;
		if (waited > 120000) return console.error('AutoTrimps Plus: AutoTrimps did not finish loading after 2 minutes.');
		setTimeout(waitForAutoTrimps, 250);
	})();
})();
