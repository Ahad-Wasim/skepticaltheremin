var React = require('react');
var helpers = require('../utils/helpers');

var Map = React.createClass({
  getInitialState(){
    return {
      // Connected to the location input
      location: '',
      breadcrumbs: [],
      lat: this.props.lat,
      lng: this.props.lng,
      previousMarker: null,
      currentMarker: null,
      lastMarkerTimeStamp: null,
      map: null
    }
  },
  
  // Change event from the location input
  handleLocationChange(e) {
    this.setState({location: e.target.value});  
  },
  
  // Grabs the comments from the comment textarea
  handleCommentChange(e) {
    this.setState({comment: e.target.value});
  },

  matchBreadCrumb(timestamp){
    var breadcrumbs = this.props.favorites;
    for(var i = breadcrumbs.length - 1; i >= 0; i--){
      var breadcrumb = breadcrumbs[i];
      if(breadcrumb.timestamp === timestamp){
        this.setState({location: breadcrumb.location, comment: breadcrumb.details.note})
        return;
      }
    }

  },

  toggleFavorite(address){
    this.props.onFavoriteToggle(address);
  },

  addFavBreadCrumb(id, lat, lng, timestamp, details, infoWindow, location) {
    this.props.onAddToFavBcs(id, lat, lng, timestamp, details, infoWindow, location);
  },

  updateCurrentLocation(){
    if(this.state.previousMarker){
      this.state.previousMarker.setIcon({
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        strokeColor: "red",
        scale: 5
      });
    }
    this.state.currentMarker.setIcon({
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      strokeColor: "green",
      scale: 5
    });
    this.state.previousMarker = this.state.currentMarker;
  },

  componentDidMount(){

    // Only componentDidMount is called when the component is first added to
    // the page. This is why we are calling the following method manually. 
    // This makes sure that our map initialization code is run the first time.


    // CREATES A GOOGLE MAP

    // this.componentDidUpdate();
    var self = this;
    // WE ARE CREATING A GOOGLE MAP AND ATTACHING TO THE SCREEN
    var map = new GMaps({
      el: '#map',
      // Grabbing the latitude and longitude from the MapApp Componenet
      lat: this.props.lat,
      lng: this.props.lng,
      // The style for the map
      styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}]

    });

    // Map is set to the new state
    this.setState({map: map});

    //Right Click Menu
    map.setContextMenu({
      control: 'map',
      options: [{
        title: 'Add Bread Crumb',
        name: 'add_bread_crumb',
        action: function(e) {
          // Grabs the latitude & longitude and converts it into a string
          var addressString = e.latLng.lat().toString() + " " +  e.latLng.lng().toString();

          // Given where they clicked were passing in the longititude and latitude
          // Calls the searchAddress method on this componenents parent
          self.props.searchAddress(addressString, function(newLocation){

            // By updating the location the inputs change automatically
            self.setState({location: newLocation, comment: "Add comments here and save breadcrumb"});
          });

          var id = self.props.favorites.length;
          var time = Date.now();
          self.setState({lastMarkerTimeStamp: time});
          var marker = this.addMarker({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
            title: 'New marker',
            id: id,
            timestamp: time,

            // The color for the google maps
            icon: {
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              strokeColor: "green",
              scale: 5
            },
            // infoWindow: {
            //   content: '<p style="height:200px; width: 800px;">HTML Content </p>'
            // },
            click: function(e) {
              self.setState({currentMarker: this});
              self.updateCurrentLocation();
              self.matchBreadCrumb(e.timestamp);
              // this.setMap(null);
            }
          });
          self.setState({currentMarker: marker});
          self.updateCurrentLocation();
          // self.addFavBreadCrumb(id, e.latLng.lat(), e.latLng.lng(), Date.now(), {note: "I LOVE this place."}, {content: '<p>Dat info dohhh</p>'});
        }
      }, {
        title: 'Center here',
        name: 'center_here',
        action: function(e) {
          this.setCenter(e.latLng.lat(), e.latLng.lng());
        }
      }]
    });

    console.log("favorites", this.props.favorites);
    
    // FETCHES ALL THE BREADCRUMBS PERTAINING TO A USER

    // map.addMarkers(this.props.favorites); //no longer used
    // Were going to get all the breadcrumbs pertaining to a user
    // And then add that to the breadcrumbs array

    helpers.getAllBreadCrumbs(this.props.user, function(data){
      if(!data){
        return;
      }
      self.setState({breadcrumbs: data.pins});
      self.state.breadcrumbs.forEach(function(favorite, index){
        map.addMarker({
          lat: favorite.lat,
          lng: favorite.lng,
          title: 'New marker',
          id: index,
          timestamp: favorite.timestamp,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            strokeColor: "red",
            scale: 5
          },
          click: function(e) {
            self.setState({currentMarker: this});
            self.updateCurrentLocation();
            self.matchBreadCrumb(e.timestamp);
            // self.state.currentMarker.setMap(null);
          }
        });

      });
    });

  },



  // this method is called once the state has been updated
  componentDidUpdate(){
    if(this.props.favorites.length !== this.state.breadcrumbs.length){
      this.setState({breadcrumbs: this.props.favorites});
      return;
    }
    if(this.lastLat == this.props.center.lat && this.lastLng == this.props.center.lng){

      // The map has already been initialized at this address.
      // Return from this method so that we don't reinitialize it
      // (and cause it to flicker).

      return;
    }

    this.state.map.setCenter(this.props.center.lat, this.props.center.lng);
    this.lastLat = this.props.center.lat;
    this.lastLng = this.props.center.lng

    // var map = new GMaps({
    //   el: '#map',
    //   lat: this.props.lat,
    //   lng: this.props.lng,
    //   click: function(e) {
    //     var addressString = e.latLng.lat().toString() + " " +  e.latLng.lng().toString();
    //     // self.searchForAddress(addressString);
    //     self.props.searchAddress(addressString);
    //     map.addMarker({
    //       address: e.latLng.lat().toString() + e.latLng.lng().toString(),
    //       lat: e.latLng.lat(),
    //       lng: e.latLng.lng(),
    //       details: {
    //         note: "I LOVE this place."
    //       },
    //       infoWindow: {
    //         content: '<p>Dat info dohhh</p>'
    //       }
    //     });
    //     bindContext.addFavBreadCrumb(e.latLng.lat(), e.latLng.lng(), Date.now(), {note: "I LOVE this place."}, {content: '<p>Dat info dohhh</p>'});
    //   },
    //   styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}]

    // });

    // map.setContextMenu({
    //   control: 'map',
    //   options: [{
    //     title: 'Add Bread Crumb',
    //     name: 'add_bread_crumb',
    //     action: function(e) {
    //       var addressString = e.latLng.lat().toString() + " " +  e.latLng.lng().toString();
    //       console.log("rightclick")
    //       self.searchAddress(addressString);
    //       this.addMarker({
    //         lat: e.latLng.lat(),
    //         lng: e.latLng.lng(),
    //         title: 'New marker',
    //         // infoWindow: {
    //         //   content: '<p>HTML Content</p>'
    //         // },
    //         click: function(e) {
    //           console.log(e);
    //         }
    //       });
    //     }
    //   }, {
    //     title: 'Center here',
    //     name: 'center_here',
    //     action: function(e) {
    //       this.setCenter(e.latLng.lat(), e.latLng.lng());
    //     }
    //   }]
    // });

    // Adding a marker to the location we are showing
    
    // map.addMarker({
    //   lat: this.props.lat,
    //   lng: this.props.lng
    //   // icon: '/'
    // });

    // map.addMarkers(this.props.favorites);

  },

  // Handles breadCrumb submission
  // Submit when their is data
  handleSubmit(e) {
    e.preventDefault();
    var id = this.props.favorites.length;
    var timestamp = this.state.lastMarkerTimeStamp;

    // Adding a NEW FAVORITE BREADCRUMB
    this.addFavBreadCrumb(id, this.props.lat, this.props.lng, timestamp, {note: this.state.comment}, this.state.location);
    // this.state.currentMarker.setMap(null);

    //  Clears out the inputs here
    this.setState({location: '', comment: ''});
  },

  render(){

    return (
      <div>
      <div className="map-holder">
        <p>Loading......</p>
        // This is our google map
        <div id="map"></div>
      </div>
      // BY SUBMITTING THIS FORM WE ARE ESSENTIALY ADDING A NEW BREADCRUMB TO OUR DATABASE
      <form  onSubmit={this.handleSubmit} className="form-group list-group col-xs-12 col-md-6 col-md-offset-3" >
        <label htmlFor="location">Location:</label>
        // Updates the text state
        <input type="text" className="form-control" id="location" onChange={this.handleLocationChange} value={this.state.location} placeholder="Location" />
        <label htmlFor="comment">Comment:</label>
        // Updates the comment state
        <textarea value={this.state.comment} onChange={this.handleCommentChange} className="form-control" rows="10" id="comment"></textarea>
        <div>
          <input type="submit" className="btn btn-primary" value="Save Breadcrumb" />
        </div>
      </form>
      </div>
    );
  }

});

module.exports = Map;
