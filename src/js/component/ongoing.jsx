import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';

import Spinner from './ui/spinner';

const getMessage = ongoing => {
	// we currently only support one ongoing kind - upload
	return `Uploading ${ongoing.count} Files`;
}

const Ongoing = () => {
	const processes = useSelector(state => state.ongoing);

	return (
		<div className="ongoing hidden-touch hidden-sm-down">
			{ processes.length > 1 ? (
				<React.Fragment>
					<div className="label">Multiple Ongoing Operations</div>
					<Spinner className="small" />
				</React.Fragment>
			) : null }
			{ processes.length === 1 ? (
				<React.Fragment>
					<div className="label">{ getMessage(processes[0]) }</div>
					<Spinner className="small" />
				</React.Fragment>
			) : null }
		</div>
	);
}


export default Ongoing;
