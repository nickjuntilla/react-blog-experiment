import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import css from './BlogPosts.less';

const BlogPost = ({ blogpost, actions }) => {
  return (
    <div class={css.component}>

      <div>A blog post</div>

    </div>
  )
}

export default connect(
  // map state to props
  state => ({ blogpost: state.blogpost }),
  // map dispatch to props
  dispatch => ({ actions: bindActionCreators(BlogPost, dispatch) })
)(BlogPost);
