'use strict'

const React = require('react');

module.exports = {
	UserContext: React.createContext({
		isKeyboardUser: false,
		isMouseUser: false,
		isTouchUser: false,
		userType: 'mouse'
	}),
	ViewportContext: React.createContext({
		xxs: false,
		xs: false,
		sm: false,
		md: false,
		lg: true,
	}),
};
