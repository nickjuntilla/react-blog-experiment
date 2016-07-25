import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { Provider } from 'react-redux';

import './global/javascript/utils.js';
import './global/javascript/wp.js';

import './global/styles/style.css';
import './global/styles/style2.css';

// Import application store
import { store } from './store';

// Import main application component
import App from './components/App';
import BlogPosts from './components/BlogPosts';
//import default as blog from './state/blogposts';

// Render the application's root component to DOM element
ReactDOM.render(
  <Provider store={store}>
        <Router history={browserHistory}>

            <Route component={App}>

                <Route path="/" component={BlogPosts} />

            </Route>

        </Router>
    </Provider>
  , document.getElementById('root'));
