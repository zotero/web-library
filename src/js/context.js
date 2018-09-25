'use strict'

const React = require('react');

module.exports = {
	UserTypeContext: React.createContext('mouse'),
	ViewportContext: React.createContext({
		xxs: false,
		xs: false,
		sm: false,
		md: false,
		lg: true,
		isLg: () => this.lg
	}),
};
