'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Toolbar } from '../../ui/toolbars';
import ColumnSelector from './column-selector';
import ItemsActionsContainer from '../../../container/items-actions';
import SyncIndicatorContainer from '../../../container/sync-indicator';
import withFocusManager from '../../../enhancers/with-focus-manager';
import { pick } from '../../../common/immutable';

class ItemsTableToolbar extends React.PureComponent {
	render() {
		const { onFocus, onBlur, preferences, registerFocusRoot } = this.props;
		return (
			<header className="hidden-sm-down">
				<Toolbar
					className="hidden-touch hidden-sm-down"
					onFocus={ onFocus }
					onBlur={ onBlur }
					tabIndex={ 0 }
					ref={ ref => registerFocusRoot(ref) }
				>
					<div className="toolbar-left">
						<ItemsActionsContainer { ...pick(this.props, ['onFocusNext', 'onFocusPrev']) } />
					</div>
					<div className="toolbar-right">
						<SyncIndicatorContainer tabIndex={ -2 } />
						<ColumnSelector
							tabIndex={ -2 }
							columns = { preferences.columns }
							{ ...pick(this.props, ['itemFields', 'onColumnVisibilityChange',
								'onFocusNext', 'onFocusPrev'])
							}
					/>
					</div>
				</Toolbar>
			</header>
		);
	}

	static propTypes = {
		onBlur: PropTypes.func.isRequired,
		onFocus: PropTypes.func.isRequired,
		preferences: PropTypes.object,
		registerFocusRoot: PropTypes.func.isRequired,
	}

	static defaultProps = {

	}
}

export default withFocusManager(ItemsTableToolbar);
