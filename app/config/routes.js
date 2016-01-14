var React = require('react');
var Main = require('../components/Main');
var Home = require('../components/Home');
var Login = require('../components/Login');
var Signup = require('../components/Signup');
var Router = require('react-router');
var Route = Router.Route;
var IndexRoute = Router.IndexRoute;
var MapApp = require('../components/MapApp');
    // <IndexRoute component={Home} />


module.exports = (
  <Route path="/" component={Main}>
    // Map App has the signUp page on their
    <IndexRoute component={MapApp} />
    <Route name="login" path="login" component={Login} />
    <Route name="home" path="home" component={Home} />
    <Route name="map" path="map" component={MapApp} />
    <Route name="signup" path="signup" component={Signup} />
  </Route>
);
