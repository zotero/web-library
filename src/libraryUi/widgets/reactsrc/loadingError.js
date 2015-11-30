var LoadingError = React.createClass({
	render: function() {
		return (
			<p hidden={!this.props.errorLoading}>
				There was an error loading your items. Please try again in a few minutes.
			</p>
		);
	}
});
