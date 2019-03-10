'use strict';

const React = require('react');
const PropTypes = require('prop-types');

const Spinner = require('./ui/spinner');
const Icon = require('./ui/icon');
const Button = require('./ui/button');

class Relations extends React.PureComponent {

	handleDelete(item) {
		this.props.onRelatedItemDelete(item);
	}

	handleSelect(item) {
		this.props.onRelatedItemSelect(item);
	}

	render() {
		return (
			<div className="details-list relations">
				<nav>
					<ul className="nav list">
						{
							this.props.relations.map(item => {
								return item && (
									<li
										className="item"
										key={ item.key }
									>
										<Icon type={ '16/document' } width="16" height="16" />
										<a onClick={ this.handleSelect.bind(this, item) }>
											{ item.title }
										</a>
										<Button onClick={ this.handleDelete.bind(this, item) }>
											<Icon type={ '16/trash' } width="16" height="16" />
										</Button>
									</li>
								);
							})
						}
					</ul>
				</nav>
				{
					this.props.relations.some(item => typeof item === 'undefined') && (
						<Spinner />
					)
				}
			</div>
		);
	}

	static propTypes = {

	}

	static defaultProps = {
		relations: []
	};
}

module.exports = Relations;
