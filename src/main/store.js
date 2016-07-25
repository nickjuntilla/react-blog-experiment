import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import { reducer as blogposts } from './state/blogposts';
import updateBlogPostsAsync from './state/blogposts';

const reducer = combineReducers({blogposts});

let middleware = applyMiddleware(thunk);

if (window.devToolsExtension) {
  middleware = compose(middleware, window.devToolsExtension())
}

export const store = createStore(reducer, {}, middleware);

updateBlogPostsAsync()(store.dispatch);
