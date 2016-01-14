var React = require('react');

var Search = React.createClass({

  getInitialState() {
    return { value: '' };
  },

  handleChange(event) {
    this.setState({value: event.target.value});
  },

  handleSubmit(event){
    
    event.preventDefault();
    
    // When the form is submitted, call the onSearch callback that is passed to the component
    
    // Calls the onSearch method from its parent -> MapApp
    // Gets the Search Result that the user passed in.
    // We want to recenter so thats why true is passed in.
    this.props.onSearch(this.state.value, null, true);

    // Unfocus the text input field
    this.getDOMNode().querySelector('input').blur();
  },

  render() {

    return (
      <form id="geocoding_form" className="form-horizontal" onSubmit={this.handleSubmit}>
        <div className="form-group">
          <div className="col-xs-12 col-md-6 col-md-offset-3">
            <div className="input-group">
              <input type="text" className="form-control" id="address" placeholder="Find a location..." 
              value={this.state.value} onChange={this.handleChange} />
              <span className="input-group-btn">
                <span className="glyphicon glyphicon-search" aria-hidden="true"></span>
              </span>
            </div>
          </div>
        </div>
      </form>
    );

  }
});

module.exports = Search;
