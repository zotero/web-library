'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { pick } from '../common/immutable';
import withItemsActions from '../enhancers/with-items-actions';
import TouchFooter from '../component/touch-footer';


class TouchFooterContainer extends React.PureComponent {
	render() {
		return <TouchFooter { ...this.props } />
	}
}

const mapStateToProps = state => {
	const { libraryKey } = state.current;
	const { isReadOnly } = (state.config.libraries.find(l => l.key === libraryKey) || {});
	return { isReadOnly, ...pick(state.current, ['itemKeys', 'itemsSource']) }
}


export default withItemsActions(
	connect(mapStateToProps)(TouchFooterContainer)
);
