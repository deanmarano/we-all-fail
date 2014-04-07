window.Fail = Ember.Application.create();

Fail.Router.map(function() {
  this.resource('failures', { path: '/' });
  this.route('about', { path: '/about' });
});

Fail.FailuresRoute = Ember.Route.extend({
  model: function() {
    return this.store.find("failure");
  }
});

Fail.FailuresController = Ember.ArrayController.extend({
  needs: ['application'],
  sortProperties: ['at'],
  sortAscending: false,

  actions : {
    meToo: function(model) {
      if(!this.get('user')) { return; }
      var meToos = model.get('meToos');
      if(meToos.indexOf(this.get('user.id')) == -1) {
        meToos.push(this.get('user.id'));
        model.set('meToos', meToos);
        model.save();
      }
    }
  },
  user: function() {
    return this.get('controllers.application.user');
  }.property('controllers.application')
});

Fail.ApplicationController = Ember.Controller.extend({
  user: Ember.computed.alias('model'),
  actions: {
    logIn: function() {
      var email = this.get('email'),
          password = this.get('password'),
          controller = this;

        this.set('email', 'Logging in...');
        this.set('password', '');
        this.get('auth').login('password', {email: email, password: password}, function() {
          controller.set('email', '');
        });
    },
    signUp: function() {
      var email = this.get('email'),
          password = this.get('password'),
          controller = this;

      this.set({email: 'Signing up...', password: ''});
      this.get('auth').createUser(email, password, function(error, user) {
        controller.set('email', '');
        if (error) {
          console.log(error);
          } else {
          controller.get('auth').login('password', {email: email, password: password});
          console.log(user);
          }
      });
    },

    logout: function() {
      this.get('auth').logout();
      this.set('signingUp', false);
    },

    addFailure: function() {
      if(this.get('charsRemaining') <= 0) { return; }
      var newFailure = this.store.createRecord('failure', {
        text: 'I ' + this.get('newFailure'),
        userId: this.get('model.id'),
        meToos: [this.get('model.id')],
        at: Firebase.ServerValue.TIMESTAMP});
      newFailure.save();
      this.set('newFailure', "");
      this.set('addFailureShown', false);
    },
    passwordEnter: function() {
      if(this.get('signingUp')) {
        this._actions.signUp.apply(this);
      } else {
        this._actions.logIn.apply(this);
      }
    }
  },

  charsRemaining: function() {
    return 158 - (this.get('newFailure') || '').length;
  }.property('newFailure'),

  init: function() {
    var controller = this;
    var db = new Firebase('crackling-fire-6829.firebaseIO.com');
    var auth = new FirebaseSimpleLogin(db, function(error, userData) {
    if (error) {
        console.log('auth error');
        console.log(error);
      } else if (userData) {
        var user = controller.store.createRecord('user', userData);
        controller.set('model', user);
      } else {
        controller.set('model', undefined);
      }
    });
    this.set('auth', auth);
  }
});

Fail.Failure = DS.Model.extend({
  at: DS.attr(),
  meToos: DS.attr(),
  userId: DS.attr(),
  text: DS.attr(),
  prettyAt: function() {
    return moment(this.get('at')).fromNow();
  }.property('at'),
  meTooCount: function() {
    return this.get('meToos').length;
  }.property('meToos'),
  humans: function() {
    return this.get('meTooCount') == 1 ? 'human' : 'humans';
  }.property('meTooCount')
});

Fail.User = DS.Model.extend({
  email: DS.attr(),
  md5_hash: DS.attr()
});


Fail.ApplicationAdapter = DS.FirebaseAdapter.extend({
  firebase: new Firebase("https://crackling-fire-6829.firebaseio.com")
});

Fail.RawTransform = DS.Transform.extend({
  deserialize: function(serialized) {
    return serialized;
  },
  serialize: function(deserialized) {
    return deserialized;
  }
});

$(function() {
  $.fn.isOnScreen = function(){

    var win = $(window);

    var viewport = {
      top : win.scrollTop(),
  left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();

    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
  };

  window.showNext = function() {
    var hiddenFailures = $('.failure:not(.shown)');
    var visible = hiddenFailures.filter(function(_, e) { return $(e).isOnScreen(); });


    if(visible.length > 0) {
      var failure = $(visible[Math.floor(Math.random() * hiddenFailures.length)]);
    } else if(hiddenFailures.length > 0) {
      var failure = $(hiddenFailures[Math.floor(Math.random() * hiddenFailures.length)]);
    }
    if(failure) failure.addClass('shown');
    window.setTimeout(window.showNext, 1500);
  }

  window.setTimeout(window.showNext, 1000);
});

/*
 * TODO:
 * 1. Limit intial load
 * 2. Check if updating works across browsers
 * 3. escape key to make add go away
 */
