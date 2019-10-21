import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';

import Spinner from './ui/spinner';

const getMessage = ongoing => {
	// we currently only support one ongoing kind - upload
	return `Uploading ${ongoing.count} files`;
}

const Ongoing = () => {
	const processes = useSelector(state => state.ongoing);

	return (
		<div className="ongoing-pane hidden-touch hidden-sm-down">
			{ processes.length > 1 ? (
				<div className="process">
					<Spinner className="small" />
					<div className="ongoing-text">Multiple ongoing operations …</div>
				</div>
			) : null }
			{ processes.length === 1 ? (
				<div className="process">
					<Spinner className="small" />
					<div className="ongoing-text">{ getMessage(processes[0]) }</div>
				</div>
			) : null }
		</div>
	);
}


export default Ongoing;
