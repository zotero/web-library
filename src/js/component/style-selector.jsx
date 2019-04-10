'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Select from './form/select';
import { citationStylesCount } from '../../../data/citation-styles-data.json';

class StyleSelector extends React.PureComponent {
	render() {
		const { className, citationStyle, citationStyles,
			onStyleChange } = this.props;
		return (
			<div className={ cx('style-selector', className ) }>
				<Select
					clearable={ false }
					searchable={ false}
					value={ citationStyle }
					tabIndex={ 0 }
					options={ [
						...citationStyles.map(cs => ({
							value: cs.name,
							label: cs.title
						})),
						{
							value: 'install',
							label: `${(Math.floor(citationStylesCount / 100) * 100).toLocaleString()}+ other styles available…`
						}
					] }
					onChange={ () => true /* commit on change */ }
					onCommit={ onStyleChange }
				/>
			</div>
		);
	}

	static propTypes = {
		className: PropTypes.string,
		citationStyle: PropTypes.string,
		citationStyles: PropTypes.array,
		onStyleChange: PropTypes.func
	}
}


export default StyleSelector;
