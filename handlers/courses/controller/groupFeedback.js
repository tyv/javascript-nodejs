const countries = require('countries');
const ImgurImage = require('imgur').ImgurImage;
const CourseFeedback = require('../models/courseFeedback')
const _ = require('lodash');

exports.all = function*() {

  var group = this.locals.group = this.groupBySlug;

  this.locals.title = "Отзыв\n" + group.title;

  var participant = this.locals.participant = group.getParticipantByUserId(this.user._id);
  this.locals.countries = countries.all;

  var courseFeedback = yield CourseFeedback.findOne({
    participant: participant._id
  }).exec();

  if (!courseFeedback) {
    courseFeedback = new CourseFeedback({
      recommend:  true,
      isPublic:   true,
      country:    participant.country,
      photo:      participant.photo,
      aboutLink:  participant.aboutLink,
      city:       participant.city,
      occupation: participant.occupation
    });
  }

  if (this.method == 'POST') {
    var feedbackData = _.pick(this.request.body,
      'stars content country city isPublic recommend aboutLink occupation'.split(' ')
    );

    feedbackData.participant = participant._id;
    feedbackData.courseGroup = group._id;
    feedbackData.recommend = Boolean(+feedbackData.recommend);
    feedbackData.isPublic = Boolean(+feedbackData.isPublic);

    //console.log(this.request.body.photoId, feedbackData.photo, '!!!');

    _.assign(courseFeedback, feedbackData);

    if (this.request.body.photoId) {
      var photo = yield ImgurImage.findOne({imgurId: this.request.body.photoId}).exec();
      courseFeedback.photo = photo.link;
    }

    try {
      yield courseFeedback.persist();
    } catch (e) {
      var errors = {};
      for (var key in e.errors) {
        errors[key] = e.errors[key].message;
      }

      this.body = this.render('groupFeedback/feedback', {
        errors: errors,
        form:   courseFeedback
      });

      return;
    }

    this.redirect(`/courses/groups/${group.slug}/feedback`);
    return;


  } else if (this.method == 'GET') {

    this.locals.form = courseFeedback;

    this.body = this.render('groupFeedback/feedback');
  }

};

exports.post = function*() {

};
