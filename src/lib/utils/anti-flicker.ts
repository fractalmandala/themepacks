import { ALL_THEME_SETS, getForStylerThemes } from '../canonical/index.js';

const STYLER_THEME_SETS = ALL_THEME_SETS.filter((themeSet) => themeSet.group === 'styler');
type ThemeGroupName = (typeof STYLER_THEME_SETS)[number]['id'];
const STYLER_THEMES = getForStylerThemes();
const THEME_MODES = Object.fromEntries(
	STYLER_THEMES.filter((theme) => theme.mode !== null).map((theme) => [theme.id, theme.mode])
);

/**
 * Generates an inline, zero-dependency JavaScript string to be placed in the <head> of app.html
 * to prevent Flash of Unstyled Content (FOUC) or mode flicker before Svelte hydrates.
 */
export function getAntiFlickerScript(
	defaultTheme = 'theme-light-default',
	defaultGroupName: ThemeGroupName = ALL_THEME_SETS[0].id
): string {
	return `(function(){try{var themeModes=${JSON.stringify(THEME_MODES)};var savedTheme=localStorage.getItem('theme')||'${defaultTheme}';var savedGroupName=localStorage.getItem('groupName')||'${defaultGroupName}';var mode=themeModes[savedTheme]||'light';var root=document.documentElement;root.classList.add(savedTheme);root.setAttribute('data-theme',mode);root.setAttribute('data-mode',mode);root.setAttribute('data-theme-id',savedTheme);root.setAttribute('data-theme-family',savedTheme);root.setAttribute('data-theme-group',savedGroupName);root.style.colorScheme=mode;var customTokens=localStorage.getItem('customTokens');if(customTokens){try{var parsed=JSON.parse(customTokens);for(var k in parsed){root.style.setProperty('--'+k,parsed[k]);}}catch(e){}}var useAccent=localStorage.getItem('useCustomAccent');if(useAccent==='true'){var acc=localStorage.getItem('customAccentColor');var accAlt=localStorage.getItem('customAccentAltColor');if(acc){root.style.setProperty('--theme-color',acc);}if(accAlt){root.style.setProperty('--theme-color-alt',accAlt);}}}catch(e){}})();`;
}
