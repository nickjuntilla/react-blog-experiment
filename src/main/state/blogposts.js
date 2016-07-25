import mapActionToReducer from 'redux-action-reducer-mapper';


// var userInitialState = {
//     blogposts: ['initial', 'state']
// };

// export default function(state = userInitialState, action) {
// }
// define available actions
// export default {
//   updateBlogPosts(blogposts) {
//     fetch('https://public-api.wordpress.com/rest/v1.1/sites/60970621/posts', {
//       method: 'get'
//     }).then(function(response) {
//       blogposts = response;
//
//     }).catch(function(err) {
//       console.log(err);
//     });
//   }
// }

// renamed optimistic action creator - this won't be called directly
// by the React components anymore, but from our async thunk function
export function updateBlogPostsSync(blogposts) {
  return { type: 'UPDATE_BLOG_POSTS', payload: blogposts };
}

// the async action creator uses the name of the old action creator, so
// it will get called by the existing code when a new todo item should
//  be added
export default function updateBlogPostsAsync() {
  // we return a thunk function, not an action object!
  // the thunk function needs to dispatch some actions to change the
  // Store status, so it receives the "dispatch" function as its first parameter
  console.log('update blog async')
  return function(dispatch) {
    // here starts the code that actually gets executed when the addTodo action
    // creator is dispatched

    // first of all, let's do the optimistic UI update - we need to
    // dispatch the old synchronous action object, using the renamed
    // action creator
    //dispatch(updateBlogPostsSync());

    // now that the Store has been notified of the new todo item, we
    // should also notify our server - we'll use here ES6 fetch function
    // to post the data
    fetch('https://public-api.wordpress.com/rest/v1.1/sites/60970621/posts', {
      method: 'get'
      // body: JSON.stringify({
      //   text
      // })
    }).then(response => {

      return response.json();
      //dispatch(updateBlogPostsSync(response.json()));
      // you should probably get a real id for your new todo item here,
      // and update your store, but we'll leave that to you
    }).then(data => {
      console.log('response from fetch ',  data);
      dispatch(updateBlogPostsSync(data.posts));
    }).catch(err => {
    // Error: handle it the way you like, undoing the optimistic update,
    //  showing a "out of sync" message, etc.
    console.log('simple error handling : ', err)
    });
  // what you return here gets returned by the dispatch function that used
  // this action creator
  return null;
  }
}

// define reducer that knows how to deal with the actions defined above
/*
export const reducer = (state = 'Hello, world!', action) => {
  switch(action.type) {
    case 'CHANGE_TITLE':
      return action.payload;
    default:
      return state;
  }
}
*/

// define reducer that knows how to deal with the actions defined above
// but using redux-action-reducer-mapper which allows to keep the complexity
// of the reducer on a predictibly low level
export const reducer = mapActionToReducer({
  'default': ['initialData','data'],
  'UPDATE_BLOG_POSTS': (state, action) => action.payload
});
