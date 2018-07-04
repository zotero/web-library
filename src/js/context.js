'use strict'

const React = require('react');

module.exports = {
	UserTypeContext: React.createContext('mouse'),
	ViewportContext: React.createContext({
		xs: false,
		sm: false,
		md: false,
		lg: true,
	}),
};
