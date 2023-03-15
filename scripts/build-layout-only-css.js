import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import sass from 'sass';
import CSSOM from 'cssom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scssPath = join(__dirname, '..', 'src', 'scss', 'zotero-web-library.scss');
const layoutOnlyCSSPath = join(__dirname, '..', 'data', 'layout-only.css');
const css = sass.compile(scssPath).css;
const parsed = CSSOM.parse(css);

const targetResolutionWidth = 1280;

// styles that affect tab order (or, in my guess, may affect it in the future - https://github.com/w3c/csswg-drafts/issues/3377)
const propertyNames = ['display', 'visibility', 'flex', 'flex-direction', 'grid', 'float', 'position', 'order'];

const collectVisibilityRules = (rule, collected = []) => {
	if (rule.type === CSSOM.CSSRule.MEDIA_RULE) {
		const maxWidth = parseInt(rule.media.mediaText.match(/max-width:\s*(\d+)px/)?.[1]) || Infinity;
		const minWidth = parseInt(rule.media.mediaText.match(/min-width:\s*(\d+)px/)?.[1]) || 0;
		if (minWidth > targetResolutionWidth || maxWidth < targetResolutionWidth) {
			return;
		}
	}
	for(let property of propertyNames) {
		if (rule?.style?.[property]) {
			collected.push(rule);
			break;
		}
	}

	rule?.cssRules?.forEach(cssRule => {
		collectVisibilityRules(cssRule, collected);
	});

	return collected;
}

const layoutRules = collectVisibilityRules(parsed);
let propsDiscarded = 0;
layoutRules.forEach(rule => {
	for (let i = rule.style.length; i--;) {
		const propName = rule.style[i];
		if (!propertyNames.includes(propName)) {
			rule.style.removeProperty(propName);
			propsDiscarded++;
		}
	}
});
const newCSS = layoutRules.map(r => r.cssText).join('\n');
console.log(`layout-only.css has been generated. ${parsed.cssRules.length - layoutRules.length} rules and then ${propsDiscarded} properties were discarded`);
fs.outputFile(layoutOnlyCSSPath, newCSS);
