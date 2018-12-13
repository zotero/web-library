'use strict';


const isTriggerEvent = (ev, shouldIgnoreButtonClickEvents = false) => ev && (ev.type === 'click' ||
	(!shouldIgnoreButtonClickEvents || ev.target.tagName !== 'BUTTON') && ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' '));

module.exports = {
	isTriggerEvent
}
