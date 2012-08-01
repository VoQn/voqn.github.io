(function() {
  var footer, func, helpers, name;

  footer = {
    template: "#footer-template",
    placeholder: "#footer-links",
    data: []
  };

  footer.data.push({
    header: "Projects",
    links: [
      {
        text: "VoQn/Macchiato",
        url: "//voqn.github.com/macchiato",
        title: "Random Test Framework for JavaScript"
      }, {
        text: "VoQn/ZeroFixFramework",
        url: "//github.com/VoQn/ZeroFixFramework",
        title: "User Script Framework for NicoNicoDouga-Zero"
      }, {
        text: "rosylilly/QueenCheck",
        url: "//rosylilly.github.com/QueenCheck",
        title: "Random Test Framework for Ruby"
      }, {
        text: "yaakaito/NLTQuickCheck",
        url: "//github.com/yaakaito/NLTQuickCheck",
        title: "Random Test Framework for Objective-C"
      }
    ]
  });

  footer.data.push({
    header: "Publishes",
    links: [
      {
        text: "Blog",
        url: "//voqn.blogspot.com",
        title: "Coding as Drawing"
      }, {
        text: "Slideshare",
        url: "//www.slideshare.com/VoQn",
        title: "Uploaded Slides"
      }, {
        text: "Qiita - Coding Tips",
        url: "//qiita.com/users/VoQn",
        title: "Coding Tips (Japanese)"
      }, {
        text: "Gist",
        url: "//gist.github.com/VoQn",
        title: "Code Snippets"
      }
    ]
  });

  footer.data.push({
    header: "Social Network",
    links: [
      {
        text: "Twitter",
        url: "//twitter.com/VoQn",
        title: "twitter/VoQn"
      }, {
        text: "Tumblr",
        url: "//voqn.tumblr.com",
        title: "VoQnumblr"
      }, {
        text: "Facebook",
        url: "//facebook.com/VoQn.km",
        title: "Facebook profile"
      }, {
        text: "Google+",
        url: "//plus.google.com/101037793437801252008/about",
        title: "Google+ Profile"
      }
    ]
  });

  this.static_data_set = {
    footer: footer
  };

  helpers = {
    link: function(text, options) {
      var attrs, property, value;
      attrs = (function() {
        var _ref, _results;
        _ref = options.hash;
        _results = [];
        for (property in _ref) {
          value = _ref[property];
          _results.push("" + property + "=\"" + value + "\"");
        }
        return _results;
      })();
      return new Handlebars.SafeString("<a " + (attrs.join(" ")) + ">" + text + "</a>");
    },
    list: function(items, options) {
      var entries, item;
      entries = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          _results.push("<li>" + (options.fn(item)) + "</li>");
        }
        return _results;
      })();
      return "<ul>" + (entries.join(" ")) + "</ul>";
    },
    date: function(date_expr, options) {
      var date, dd, format_expr, hh, locale, mi, mm, offset, yy;
      format_expr = function(t) {
        if (t < 10) {
          return "0" + t;
        } else {
          return "" + t;
        }
      };
      date = date_expr instanceof Date ? date_expr : new Date(date_expr);
      offset = date.getTimezoneOffset();
      locale = new Date(date.getTime() - offset * 6000);
      yy = locale.getFullYear();
      mm = locale.getMonth() + 1;
      dd = locale.getDate();
      hh = locale.getHours();
      mi = locale.getMinutes();
      return new Handlebars.SafeString("" + yy + "/" + (format_expr(mm)) + "/" + (format_expr(dd)) + "  " + (format_expr(hh)) + ":" + (format_expr(mi)));
    },
    tweet_entry: function(post, options) {
      return new Handlebars.SafeString(post);
    }
  };

  for (name in helpers) {
    func = helpers[name];
    Handlebars.registerHelper(name, func);
  }

  $(function() {
    var capital_letter, choose_parser, compiled_templates, data, expr_commits, expr_create_event, expr_follow_event, expr_gist_event, expr_issue_event, expr_pull_request_event, expr_push_event, expr_watch_event, github_api, github_api_render_callback, github_api_response_render, hb, helper, link, make_entry, my_user_name, name, request_tweet_count, section, section_name, simple_link, twitter_api_url, _i, _j, _len, _len2, _ref, _ref2;
    compiled_templates = {};
    $.fn.handlebars = function(require) {
      var data, rawHTML, self, template;
      self = this;
      template = $(require.template).html();
      compiled_templates[template] = Handlebars.compile(template);
      if (require.url) {
        return $.ajax({
          type: "GET",
          url: require.url,
          cache: false,
          dataType: "jsonp",
          data: require.queries || {}
        }).done(function(response) {
          var data, rawHTML;
          data = require.modify ? require.modify(response) : response;
          rawHTML = compiled_templates[template](data);
          return self.html(rawHTML);
        }).fail(function(xhr, error) {
          return console.log(error);
        });
      } else {
        data = require.data;
        rawHTML = compiled_templates[template](require.data);
        return self.html(rawHTML);
      }
    };
    for (section_name in static_data_set) {
      section = static_data_set[section_name];
      _ref = section.data;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        _ref2 = data.links;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          link = _ref2[_j];
          link["class"] = "inline-box";
        }
      }
      $(section.placeholder).handlebars({
        template: section.template,
        data: section.data
      });
    }
    my_user_name = "VoQn";
    github_api = (function() {
      var domain, urls;
      domain = "https://api.github.com";
      return urls = {
        repos: "" + domain + "/users/" + my_user_name + "/repos",
        user_events: "" + domain + "/users/" + my_user_name + "/events"
      };
    })();
    hb = function(tpl_str, obj) {
      var template;
      template = Handlebars.compile(tpl_str);
      return template(obj);
    };
    simple_link = function(url, title, text) {
      if (text == null) text = title;
      return hb("{{{link text href=url title=title}}}", {
        url: url,
        title: title,
        text: text
      });
    };
    make_entry = function(header_text, body_text) {
      if (body_text == null) body_text = "";
      return {
        header: "<h4>" + header_text + "</h4>",
        body: "<div>" + body_text + "</div>"
      };
    };
    capital_letter = function(str) {
      return str.replace(/^[a-z]/i, function(c) {
        return c.toUpperCase();
      });
    };
    expr_commits = function(payload) {
      var commits, tpl;
      tpl = "<table class=\"commits\">\n  <tbody>\n  {{#each commits}}\n  <tr><td class=\"data-key\">{{sha1_limit sha}}</td><td>{{message}}</td></tr>\n  {{/each}}\n  </tbody>\n</table>";
      commits = payload.commits.slice();
      payload.commits = commits.slice(0, 3);
      return hb(tpl, payload);
    };
    expr_push_event = function(act, next) {
      var ref, repo, repo_link;
      ref = act.payload.ref.replace(/^refs\/heads\//, "");
      repo = act.repo;
      repo_link = simple_link("//github.com/" + repo.name, repo.name);
      return next(make_entry("Pushed to " + ref + " at " + repo_link, expr_commits(act.payload)));
    };
    expr_create_event = function(act, next) {
      var body, header, more_info_link, path, payload, ref, ref_link, ref_type, repo, repo_link, repo_url;
      payload = act.payload;
      repo = act.repo;
      repo_url = "//github.com/" + repo.name;
      repo_link = simple_link("//github.com/" + repo.name, repo.name);
      path = (function() {
        switch (payload.ref_type) {
          case "branch":
            return "tree";
          case "tag":
            return "tag";
          default:
            return "";
        }
      })();
      ref = act.payload.ref;
      ref_type = act.payload.ref_type;
      ref_link = simple_link("//github.com/" + repo.name + "/" + path + "/" + ref, ref);
      header = "Create " + ref_type;
      if (payload.ref.length) {
        header += " " + ref_link + " at " + repo_link;
        more_info_link = simple_link("" + repo_url + "/compare/" + ref, "jump github page", "\u21F1 Compare " + ref + " " + ref_type + " with master");
        body = "<p>New " + ref_type + " is " + ref_link + "</p><p>" + more_info_link + "</p>";
      } else {
        header += " " + repo_link;
        body = payload.description;
      }
      return next(make_entry(header, body));
    };
    expr_pull_request_event = function(act, next) {
      var action, body, header, pull_request, repo_link, req_link;
      action = act.payload.action;
      repo_link = simple_link("//github.com/" + act.repo.name, act.repo.name);
      pull_request = act.payload.pull_request;
      req_link = simple_link(pull_request.html_url, pull_request.title, "pull request " + pull_request.number);
      console.log(req_link);
      header = "" + (capital_letter(action)) + " " + req_link + " on " + repo_link;
      body = "<h5>" + pull_request.title + "</h5>";
      if (pull_request.body) {
        body += "<blockquote>" + pull_request.body + "</blockquote>";
      }
      return next(make_entry(header, body));
    };
    expr_gist_event = function(act, next) {
      var gist, gist_link;
      gist = act.payload.gist;
      gist_link = simple_link(gist.html_url, gist.description, "gist: " + gist.id);
      return next(make_entry("" + (capital_letter(act.payload.action)) + " " + gist_link, gist.description));
    };
    expr_issue_event = function(act, next) {
      var issue, issue_link, repo, repo_link;
      repo = act.repo;
      issue = act.payload.issue;
      issue_link = simple_link(issue.html_url, issue.title, "issue #" + issue.number);
      repo_link = simple_link("//github.com/" + repo.name, repo.name);
      return next(make_entry("" + (capital_letter(act.payload.action)) + " " + issue_link + " on " + repo_link, "<h5>" + issue.title + "</h5><p>" + issue.body + "</p>"));
    };
    expr_watch_event = function(act, next) {
      return $.ajax({
        url: act.repo.url,
        cache: false,
        dataType: "jsonp"
      }).done(function(response) {
        var description, repo, repo_link;
        repo = response.data;
        description = repo.description;
        repo_link = simple_link(repo.html_url, repo.full_name);
        return next(make_entry("Started watching " + repo_link, description));
      });
    };
    expr_follow_event = function(act, next) {
      var target, user, user_info, user_link;
      target = act.payload.target;
      user = target.login;
      user_link = simple_link(target.html_url, "" + user + "'s github profile", user);
      user_info = hb("{{login}} has {{public_repos}} public repos and {{followers}} followers", target);
      return next(make_entry("Followed " + user_link, user_info));
    };
    choose_parser = function(active_type) {
      var parser;
      return parser = (function() {
        switch (active_type) {
          case "PushEvent":
            return expr_push_event;
          case "CreateEvent":
            return expr_create_event;
          case "PullRequestEvent":
            return expr_pull_request_event;
          case "GistEvent":
            return expr_gist_event;
          case "IssuesEvent":
            return expr_issue_event;
          case "WatchEvent":
            return expr_watch_event;
          case "FollowEvent":
            return expr_follow_event;
          default:
            return function(act, next) {
              console.log(act.type);
              return next(make_entry("have not been implemented yet"));
            };
        }
      })();
    };
    github_api_response_render = function(activities, next) {
      var act, c, i, l, parser, results, _fn, _k, _len3, _ref3, _results;
      c = 0;
      i = 0;
      l = activities.data.length;
      results = [];
      _ref3 = activities.data;
      _fn = function(index) {
        return parser(act, function(parsed) {
          var res;
          c += 1;
          results[index] = parsed;
          if (c >= l) {
            res = {};
            res.data = results;
            return next(res);
          }
        });
      };
      _results = [];
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        act = _ref3[_k];
        parser = choose_parser(act.type);
        _fn(i);
        _results.push(i += 1);
      }
      return _results;
    };
    helpers = {
      sha1_limit: function(sha1, options) {
        var lim;
        lim = options.limit || 7;
        return sha1.substring(0, lim);
      },
      github_act: function(activity, options) {
        return new Handlebars.SafeString("<li class=\"activity\">" + activity.header + activity.body + "</li>");
      }
    };
    for (name in helpers) {
      helper = helpers[name];
      Handlebars.registerHelper(name, helper);
    }
    github_api_render_callback = function(activity) {
      return $("#github-activity").html(hb("{{#each data}}{{github_act this}}{{/each}}", activity));
    };
    $.ajax({
      type: "GET",
      url: github_api.user_events,
      cache: false,
      dataType: "jsonp"
    }).done(function(response) {
      data = response.data.slice(0, 15);
      response.data = data;
      return github_api_response_render(response, github_api_render_callback);
    });
    twitter_api_url = "//api.twitter.com/1/statuses/user_timeline.json";
    request_tweet_count = 10;
    if ($("#repositories").length) {
      $("#repositories").handlebars({
        template: "#repositories-template",
        url: github_api.repos
      });
    }
    if ($("#tweets").length) {
      $("#tweets").handlebars({
        template: "#tweets-template",
        url: twitter_api_url,
        queries: {
          screen_name: my_user_name,
          count: request_tweet_count
        },
        modify: function(data) {
          var date_template, entry, modified, _k, _len3, _results;
          _results = [];
          for (_k = 0, _len3 = data.length; _k < _len3; _k++) {
            entry = data[_k];
            modified = entry;
            date_template = Handlebars.compile("{{date this}}");
            modified.created_at = date_template(entry.created_at);
            modified.permlink = "//twitter.com/" + my_user_name + "/status/" + entry.id_str;
            modified.text = entry.text.replace(/http(s)?:(\/\/)([-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/gi, "<a href=\"\/\/$3\">$3</a>").replace(/\@([_a-zA-Z0-9]+)/gi, "<a href=\"//twitter.com/$1/status/" + entry.in_reply_to_status_id_str + "\">@$1</a>").replace(/#([_a-zA-Z0-9]+)/gi, "<a href=\"//twitter.com/search/%23$1\">#$1</a>");
            _results.push(modified);
          }
          return _results;
        }
      });
    }
  });

}).call(this);
