'use strict';

import React from 'react';
import PropTypes from 'prop-types';

const SearchBackdrop = ({ triggerSearchMode }) => {
	const handleClick = () => {
		triggerSearchMode(false);
	}
	return <div onClick={ handleClick } className="search-backdrop" />;
}

SearchBackdrop.propTypes = {
	triggerSearchMode: PropTypes.func
};

export default SearchBackdrop;
