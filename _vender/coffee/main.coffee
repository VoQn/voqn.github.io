$ () ->
  compiled_templates = {}

  $.fn.handlebars = (require) ->
    self = @

    template = $(require.template).html()
    compiled_templates[template] = Handlebars.compile template

    if require.url # template refer to Ajax
      $.ajax
        type: "GET"
        url: require.url
        cache: no
        dataType: "jsonp"
        data: require.queries or {}
      .done (response) ->
          data =
            if require.modify
            then require.modify response
            else response

          rawHTML = compiled_templates[template] data
          self.html rawHTML
      .fail (xhr, error) ->
        console.log error
    else
      data = require.data
      rawHTML = compiled_templates[template] require.data
      self.html rawHTML

  for section_name, section of static_data_set
    for data in section.data
      for link in data.links
        link.class = "inline-box"

    $(section.placeholder).handlebars
      template: section.template
      data: section.data

  my_user_name = "VoQn"

  github_api = (() ->
    domain = "https://api.github.com"
    urls =
      repos: "#{domain}/users/#{my_user_name}/repos"
      user_events: "#{domain}/users/#{my_user_name}/events"
  )()

  hb = (tpl_str, obj) ->
    template = Handlebars.compile tpl_str
    template obj

  simple_link = (url, title, text = title) ->
    hb "{{{link text href=url title=title}}}",
      url: url
      title: title
      text: text

  make_entry = (header_text, body_text = "") ->
    header: "<h4>#{header_text}</h4>"
    body: "<div>#{body_text}</div>"

  capital_letter = (str) -> str.replace /^[a-z]/i, (c) -> c.toUpperCase()

  expr_commits = (payload) ->
    tpl = """
          <table class="commits">
            <tbody>
            {{#each commits}}
            <tr><td class="data-key">{{sha1_limit sha}}</td><td>{{message}}</td></tr>
            {{/each}}
            </tbody>
          </table>
          """
    commits = payload.commits.slice()
    payload.commits = commits.slice 0, 3
    hb tpl, payload

  expr_push_event = (act, next) ->
    ref = act.payload.ref.replace /^refs\/heads\//, ""
    repo = act.repo
    repo_link = simple_link "//github.com/#{repo.name}", repo.name
    next make_entry "Pushed to #{ref} at #{repo_link}",
      expr_commits act.payload

  expr_create_event = (act, next) ->
    payload = act.payload
    repo = act.repo
    repo_url = "//github.com/#{repo.name}"
    repo_link = simple_link "//github.com/#{repo.name}", repo.name
    path = switch payload.ref_type
      when "branch" then "tree"
      when "tag" then "tag"
      else "" # case of create repository

    ref = act.payload.ref
    ref_type = act.payload.ref_type
    ref_link = simple_link "//github.com/#{repo.name}/#{path}/#{ref}", ref
    header = "Create #{ref_type}"
    if payload.ref.length
      header += " #{ref_link} at #{repo_link}"
      more_info_link = simple_link "#{repo_url}/compare/#{ref}",
        "jump github page",
        "\u21F1 Compare #{ref} #{ref_type} with master"
      body = "<p>New #{ref_type} is #{ref_link}</p><p>#{more_info_link}</p>"
    else
      header += " #{repo_link}"
      body = payload.description
    next make_entry header, body

  expr_pull_request_event = (act, next) ->
    action = act.payload.action
    repo_link = simple_link "//github.com/#{act.repo.name}", act.repo.name
    pull_request = act.payload.pull_request
    req_link = simple_link pull_request.html_url,
      pull_request.title,
      "pull request #{pull_request.number}"
    console.log req_link
    header = "#{capital_letter action} #{req_link} on #{repo_link}"
    body = "<h5>#{pull_request.title}</h5>"
    if pull_request.body
      body += "<blockquote>#{pull_request.body}</blockquote>"
    next make_entry header, body

  expr_gist_event = (act, next) ->
    gist = act.payload.gist
    gist_link = simple_link gist.html_url, gist.description, "gist: #{gist.id}"
    next make_entry "#{capital_letter act.payload.action} #{gist_link}", gist.description

  expr_issue_event = (act, next) ->
    repo = act.repo
    issue = act.payload.issue
    issue_link = simple_link issue.html_url, issue.title, "issue ##{issue.number}"
    repo_link = simple_link "//github.com/#{repo.name}", repo.name
    next make_entry "#{capital_letter act.payload.action} #{issue_link} on #{repo_link}",
      "<h5>#{issue.title}</h5><p>#{issue.body}</p>"

  expr_watch_event = (act, next) ->
    $.ajax
      url: act.repo.url
      cache: no
      dataType: "jsonp"
    .done (response) ->
      repo = response.data
      description = repo.description
      repo_link = simple_link repo.html_url, repo.full_name
      next make_entry "Started watching #{repo_link}", description

  expr_follow_event = (act, next) ->
    target = act.payload.target
    user = target.login
    user_link = simple_link target.html_url,
      "#{user}'s github profile",
      user
    user_info = hb "{{login}} has {{public_repos}} public repos and {{followers}} followers", target
    next make_entry "Followed #{user_link}", user_info

  choose_parser = (active_type) ->
    parser = switch active_type
      when "PushEvent" then expr_push_event
      when "CreateEvent" then expr_create_event
      when "PullRequestEvent" then expr_pull_request_event
      when "GistEvent" then expr_gist_event
      when "IssuesEvent" then expr_issue_event
      when "WatchEvent" then expr_watch_event
      when "FollowEvent" then expr_follow_event
      else (act, next) ->
        console.log act.type
        next make_entry "have not been implemented yet"

  github_api_response_render = (activities, next) ->
    c = 0
    i = 0
    l = activities.data.length
    results = []
    for act in activities.data
      parser = choose_parser act.type
      ((index) ->
        parser act, (parsed) ->
          c += 1
          results[index] = parsed
          if c >= l
            res = {}
            res.data = results
            next res
      )(i)
      i += 1

  helpers =
    sha1_limit: (sha1, options) ->
      lim = options.limit or 7
      sha1.substring 0, lim

    github_act: (activity, options) ->
      new Handlebars.SafeString "<li class=\"activity\">#{activity.header}#{activity.body}</li>"

  for name, helper of helpers
    Handlebars.registerHelper name, helper

  github_api_render_callback = (activity) ->
    $("#github-activity").html hb "{{#each data}}{{github_act this}}{{/each}}", activity

  setTimeout (() ->
    $.ajax
      type: "GET"
      url: github_api.user_events
      cache: no
      dataType: "jsonp"
    .done (response) ->
      data = response.data.slice 0, 15
      response.data = data
      github_api_response_render response, github_api_render_callback
  ), 1

  twitter_api_url = "//api.twitter.com/1/statuses/user_timeline.json"
  request_tweet_count = 10

  if $("#repositories").length
    setTimeout (() ->
      $("#repositories").handlebars
        template: "#repositories-template"
        url: github_api.repos
    ), 1

  if $("#tweets").length
    setTimeout (() ->
      $("#tweets").handlebars
        template: "#tweets-template"
        url: twitter_api_url
        queries:
          screen_name: my_user_name
          count: request_tweet_count
        modify: (data) ->
          for entry in data
            modified = entry
            date_template = Handlebars.compile "{{date this}}"
            modified.created_at = date_template entry.created_at

            modified.permlink = "//twitter.com/#{my_user_name}/status/#{entry.id_str}"

            modified.text = entry.text
              .replace(
                /http(s)?:(\/\/)([-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/gi,
                "<a href=\"\/\/$3\">$3</a>"
              ).replace(
                /\@([_a-zA-Z0-9]+)/gi,
                "<a href=\"//twitter.com/$1/status/#{entry.in_reply_to_status_id_str}\">@$1</a>"
              ).replace(
                /#([_a-zA-Z0-9]+)/gi,
                "<a href=\"//twitter.com/search/%23$1\">#$1</a>"
              )
            modified
    ), 1

  return
