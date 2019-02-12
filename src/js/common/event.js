'use strict';


const isTriggerEvent = (ev, shouldIgnoreButtonClickEvents = false) => ev && (ev.type === 'click' ||
	(!shouldIgnoreButtonClickEvents || ev.target.tagName !== 'BUTTON') && ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' '));

const ifTriggerEvent = (handler, ...args) => ev => {
	if(isTriggerEvent(ev)) { handler(...args, ev) }
}

module.exports = {
	isTriggerEvent,
	ifTriggerEvent
}
