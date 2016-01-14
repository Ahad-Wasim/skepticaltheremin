var React = require('react');

var Search = require('./Search');
var Map = require('./Map');
var CurrentLocation = require('./CurrentLocation');
var LocationList = require('./LocationList');
var SearchUser = require('./SearchUser');
var helpers = require('../utils/helpers');
var Signup = require('./Signup');


var MapApp = React.createClass({

  getInitialState(){

    // Extract the favorite locations from local storage

    var favorites = [];

    return {
      user: '',
      loggedin: false,
      //This gets passed to the LocationList
      favorites: favorites,
      // On initial Page load Map is centerd with Hack Reactors Coordinates
      // Once the user adds something on the search bar, these values will begin to change
      currentAddress: 'Hack Reactor',
      mapCoordinates: {
        lat: 37.7836966,
        lng: -122.4089664
      },
      center: {
        lat: 37.7836966,
        lng: -122.4089664
      }
    };
  },

  loginUser(username){
    console.log("logged in:", username);
    this.setState({user: username, loggedin: true}); 

    // Makes a request to our server which grabs all the breadCrumbs according to a specific username.
    helpers.getAllBreadCrumbs(username, function(data){
      // Once a breadCrumb is found we will LOAD ALL THE FAVORITES it to favorites state
      if(data){
        this.setState({favorites: data.pins});
      }
    }.bind(this));

  },

  componentDidMount(){
  },

  // Adds a new breadCrumb to the database
  addToFavBreadCrumbs(id, lat, lng, timestamp, details, location) {
    var favorites = this.state.favorites;
    var breadcrumb = {
      id: id,
      lat: lat,
      lng: lng,
      timestamp: timestamp,
      details: details,
      address: this.state.currentAddress,
      location: location
    };
    favorites.push(breadcrumb);

    this.setState({
      favorites: favorites
    });

    // ADDS THE BREADCRUMB TO OUR DATABASE
    helpers.addBreadCrumb(this.state.user, breadcrumb, function(data){
      console.log(data);
    });
    localStorage.favorites = JSON.stringify(favorites);

  },

  // Whenever a user searches something from the Search Component, it will call this function
  searchForAddress(address, cb, recenter){
    var self = this;
    console.log("search called", address);

    // We will use GMaps' geocode functionality,
    // which is built on top of the Google Maps API

    // This will grab our latitude and longitude and attach it to the state
    GMaps.geocode({
      address: address,
      callback: function(results, status) {

        if (status !== 'OK') return;

        var latlng = results[0].geometry.location;

        // Coordinages based off the searchResults
        self.setState({
          currentAddress: results[0].formatted_address,
          mapCoordinates: {
            lat: latlng.lat(),
            lng: latlng.lng()
          }
        });


        // THIS IS ONLY GIVING THE DATA TO CENTER THE MAP!. This is not acutally centering the map
        if(recenter){
          self.setState({
            center: {
              lat: latlng.lat(),
              lng: latlng.lng()
            }
          });
        }

        if(cb){
          cb(results[0].formatted_address); 
        }

      }
    });

  },

  render(){
    // If the user is logged In throw the map template at them
    // else we will throw the signup template to them
    if(this.state.loggedin){
      return (

        <div>
          <h1 className="col-xs-12 col-md-6 col-md-offset-3">My Breadcrumbs</h1>
          
          // The search results are extracted from this component and passed to the searchForAddress.
          // The search Address only updates the current Coordinates.
          <Search onSearch={this.searchForAddress} />

          // On Initial Page load everything points to Hack Reactors Coordinates

          // Once a user searches for some location on the Search Componennt our Map component state will update its coordinates based off their search Results.
          // Everything on this components state is passed in as a property to the Map Component

          <Map lat={this.state.mapCoordinates.lat}
            lng={this.state.mapCoordinates.lng}
            favorites={this.state.favorites}
            onFavoriteToggle={this.toggleFavorite}
            onAddToFavBcs={this.addToFavBreadCrumbs}
            searchAddress={this.searchForAddress}
            address={this.state.currentAddress} 
            center={this.state.center} 
            loginUser={this.loginUser}
            user={this.state.user} />

          // Favorites is passed in to LocationList
          <LocationList locations={this.state.favorites}
            activeLocationAddress={this.state.currentAddress} 
            onClick={this.searchForAddress} />

        </div>

      );
    } else {
      // If the user is not signed in We will throw this template at them
      return <Signup loginUser={this.loginUser}/>
    }
  }

});

module.exports = MapApp;
