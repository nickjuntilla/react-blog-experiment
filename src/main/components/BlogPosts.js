import React from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import BlogPostsActions from '../state/blogposts';

import css from './BlogPosts.less';

//add some actions maybe
//const BlogPosts = ({ blogposts, actions }) => {

const BlogPosts = ({ blogposts }) => {

  return (
    <div class={css.component}>
      <p>{console.log('console render current blogposts: ' , blogposts)}</p>
      {blogposts.map((blogpost, i) => {
          return (

              <div key={i} class="article reg-post post-data">
                  <div class="post-top">
                      <h1>{blogpost.title}</h1>
                      <div class="author">
                          By: <span class="authorname">{blogpost.author}</span>
                          <span class="published-date">{blogpost.date}</span>
                      </div>
                      <div id="top_share_widget" class="top_share_widget">
                          <div class="top_share_fb"><a href="javascript:;;" class="btn btn-fbshare-xl"><i class="uproxx-facebook"></i> Facebook</a></div>
                          <div class="top_share_tw"><a href="javascript:;;" class="btn btn-twshare-xl"> <i class="uproxx-twitter"></i> Twitter</a></div>
                          <div class="top_share_em"><a href="javascript:;;" class="btn btn-emshare-xl email icon_embed_tw"><i class="uproxx-email"></i> EMAIL</a></div>
                          <div class="top_share_count"></div>
                          <div class="clear"></div>
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-xs-8">
                          <div id="post-" class="post-body">
                              <div class="ug_page">
                                  {blogpost.body}
                              </div>
                          </div>

                          <div class="uproxx-below-post hide-before-done">
                              <div class="post-tags">
                                  <div class="post-topics block-tags"><strong>TAGS</strong> {blogpost.tags}</div>
                              </div>
                          </div>
                      </div>
                      <div id="uproxx-sidebar" class="col-xs-4">
                          <div id="sticky-ads-1660255" class="uproxx-sidebar-sticky-advert">
                              <div class="ad-top-300x250">
                                  <div id="woven-top-rec">
                                    <div style="width: 300px; height: 250px; background: #efefef;">
                                      <div style="padding: 100px 75px;">AD 300x250</div>
                                    </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div id="sticky-stop-1660255"></div>
              </div>
          );
      })}


    </div>
  )
}

export default connect(
  // map state to props
  state => ({ blogposts: state.blogposts }),
  // map dispatch to props
  dispatch => ({ actions: bindActionCreators(BlogPostsActions, dispatch) })
)(BlogPosts);
