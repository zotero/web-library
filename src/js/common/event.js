'use strict';


const isTriggerEvent = ev => ev.type === 'click' ||
	(ev.type === 'keydown' && (ev.key === 'Enter' || ev.key === ' '));

export {
	isTriggerEvent
};
