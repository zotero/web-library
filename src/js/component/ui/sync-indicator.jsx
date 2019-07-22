'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './spinner';
import Button from './button';
import Icon from './icon';
import { noop } from '../../utils';

class SyncIndicator extends React.PureComponent {
	handleResyncClick = () => {
		const { isSynced, libraryKey } = this.props;
		if(isSynced) {
			return;
		}
		this.props.resetLibrary(libraryKey);
	}

	handleKeyDown = ev => {
		const { onFocusNext, onFocusPrev } = this.props;
		if(ev.target !== ev.currentTarget) {
			return;
		}

		if(ev.key === 'ArrowRight') {
			onFocusNext(ev);
		} else if(ev.key === 'ArrowLeft') {
			onFocusPrev(ev);
		}
	}

	render() {
		const { isSynced, requestsPending, tabIndex } = this.props;
		const isSyncError = !isSynced;

		return (isSyncError || requestsPending > 0) ? (
			<Button
				icon
				tabIndex={ tabIndex }
				type="button"
				onClick={ this.handleResyncClick }
				onKeyDown={ this.handleKeyDown }
			>
				{ requestsPending > 0 ?
					<Spinner tabIndex={ tabIndex } className="small" /> :
					<Icon
						type="16/library"
						color="orange"
						width="16"
						height="16"
					/>
				}
			</Button>
		) : null;
	}
	static propTypes = {
		isSynced: PropTypes.bool,
		requestsPending: PropTypes.number,
		tabIndex: PropTypes.number,
		onFocusNext: PropTypes.func.isRequired,
		onFocusPrev: PropTypes.func.isRequired,
		libraryKey: PropTypes.string,
		resetLibrary: PropTypes.func.isRequired,
	}
	static defaultProps = {
		onFocusNext: noop,
		onFocusPrev: noop,
		resetLibrary: noop,
	}
}

export default SyncIndicator;
