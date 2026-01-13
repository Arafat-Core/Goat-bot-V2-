'use strict';

var utils = require('../utils');

module.exports = function (defaultFuncs, api, ctx) {
  return function changeCover(image, callback) {
    var cb;
    var rt = new Promise(function (resolve, reject) {
      cb = (error, url) => error ? reject(error) : resolve(url);
    });

    if (typeof image == 'function') {
      callback = image;
      image = null;
    }
    if (typeof callback == 'function') cb = callback;
    if (!utils.isReadableStream(image)) {
      var error = 'image should be a readable stream, not ' + utils.getType(image);
      utils.error('changeCover', error);
      cb(error);
    }
    else {
      defaultFuncs
        .postFormData('https://www.facebook.com/profile/picture/upload/', ctx.jar, {
          profile_id: ctx.userID,
          photo_source: 57,
          av: ctx.userID,
          file: image
        })
        .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
        .then(function (res) {
          if (res.error || res.errors || !res.payload) 
            throw res;

          var vari = {
            input: {
              attribution_id_v2: `ProfileCometCollectionRoot.react,comet.profile.collection.photos_by,unexpected,${Date.now()},770083,,;ProfileCometCollectionRoot.react,comet.profile.collection.photos_albums,unexpected,${Date.now()},470774,,;ProfileCometCollectionRoot.react,comet.profile.collection.photos,unexpected,${Date.now()},94740,,;ProfileCometCollectionRoot.react,comet.profile.collection.saved_reels_on_profile,unexpected,${Date.now()},89669,,;ProfileCometCollectionRoot.react,comet.profile.collection.reels_tab,unexpected,${Date.now()},152201,,`,
              cover_photo_id: res.payload.fbid,
              focus: {
                x: 0.5,
                y: 1
              },
              target_user_id: ctx.userID,
              actor_id: ctx.userID, 
              client_mutation_id: Math.round(Math.random() * 19).toString()
            },
            scale: 1,
            contextualProfileContext: null
          }
          return defaultFuncs
            .post('https://www.facebook.com/api/graphql', ctx.jar, {
              doc_id: 8247793861913071,
              server_timestamps: true,
              fb_api_req_friendly_name: 'ProfileCometCoverPhotoUpdateMutation',
              variables: JSON.stringify(vari)
            })
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs));
        })
        .then(function (res) {
          if (res.errors) 
            throw res;
          return cb(null, res.data.user_update_cover_photo.user.cover_photo.photo.url);
        })
        .catch(function (err) {
          utils.error('changeCover', err);
          return cb(err);
        });
    }

    return rt;
  }
}
