export const PREFS_STORAGE_KEY = 'glendale-ready:display'

/** Applies stored display preferences before first paint to avoid a flash of default sizing. */
export const preferencesBootScript = `(function(){try{var p=JSON.parse(localStorage.getItem('${PREFS_STORAGE_KEY}')||'{}');var e=document.documentElement;if(p.locale)e.lang=p.locale;if(p.textSize)e.dataset.textSize=p.textSize;if(p.contrast)e.dataset.contrast=p.contrast;if(p.motion)e.dataset.motion=p.motion;}catch(_){}})();`
