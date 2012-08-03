# require jQuery, Handlebars
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

capital_letter = (str) ->
  str.replace /^[a-z]/i, (c) ->
    c.toUpperCase()

commits_template =
  """
  <table class="commits">
    <tbody>
      {{#each commits}}
      <tr>
        <td class="data-key">{{sha1_limit sha}}</td>
        <td>{{message}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
  """

expr_commits = (payload) ->
  commits = payload.commits.slice()
  payload.commits = commits.slice 0, 3
  hb commits_template, payload

github_html_link = (repo_name) ->
  simple_link "//github.com/#{repo_name}", repo_name

parser_by_event = {}

parser_by_event.push = (act, next) ->
  ref = act.payload.ref.replace /^refs\/heads\//, ""
  header = "Pushed to #{ref} at #{github_html_link act.repo.name}"
  next make_entry header, expr_commits act.payload

parser_by_event.create = (act, next) ->
  payload = act.payload
  repo = act.repo
  ref = payload.ref
  ref_type = payload.ref_type
  repo_url = "//github.com/#{repo.name}"
  repo_link = github_html_link repo.name
  path = switch ref_type
    when "branch" then "tree"
    when "tag" then "tag"
    else "" # case of create repository
  ref_link = simple_link "#{repo_url}/#{path}/#{ref}", ref
  header = "Create #{ref_type}"
  if ref.length
    header += " #{ref_link} at #{repo_link}"
    more_info_link = simple_link "#{repo_url}/compare/#{ref}",
      "jump github page",
      "Compare #{ref} #{ref_type} with master"
    body =
      "<p>New #{ref_type} is #{ref_link}<br>#{more_info_link}</p>"
  else
    header += " #{repo_link}"
    body = payload.description
  next make_entry header, body

parser_by_event.fork = (act, next) ->
  origin = act.repo
  forked = act.payload.forkee
  next make_entry "Forked #{github_html_link origin.name}",
    "<p>#{forked.description}<br>
    Forked repository is at #{github_html_link forked.full_name}"

parser_by_event.pullRequest = (act, next) ->
  action = act.payload.action
  repo_link = github_html_link act.repo.name
  pull_request = act.payload.pull_request
  req_link = simple_link pull_request.html_url,
    pull_request.title,
    "pull request #{pull_request.number}"
  header = "#{capital_letter action} #{req_link} on #{repo_link}"
  body = "<h5>#{pull_request.title}</h5>"
  if pull_request.body
    body += "<blockquote>#{pull_request.body}</blockquote>"
  next make_entry header, body

parser_by_event.gist = (act, next) ->
  gist = act.payload.gist
  gist_link = simple_link gist.html_url,
    gist.description,
    "gist: #{gist.id}"
  header = "#{capital_letter act.payload.action} #{gist_link}"
  next make_entry header, gist.description

parser_by_event.issue = (act, next) ->
  issue = act.payload.issue
  issue_link = simple_link issue.html_url,
    issue.title,
    "issue ##{issue.number}"
  repo_link = github_html_link act.repo.name
  action = capital_letter act.payload.action
  header = "#{action} #{issue_link} on #{repo_link}"

  next make_entry header,
    "<h5>#{issue.title}</h5><p>#{issue.body}</p>"

parser_by_event.watch = (act, next) ->
  $.ajax
    url: act.repo.url
    cache: no
    dataType: "jsonp"
  .done (response) ->
    repo = response.data
    description = repo.description
    repo_link = simple_link repo.html_url, repo.full_name
    next make_entry "Started watching #{repo_link}", description

parser_by_event.follow = (act, next) ->
  target = act.payload.target
  user = target.login
  user_link = simple_link target.html_url,
    "#{user}'s github profile",
    user
  header_template =
    """
    {{login}} has {{public_repos}} public repos and {{followers}} followers
    """
  user_info = hb header_template, target
  next make_entry "Followed #{user_link}", user_info

parser_by_event.choose_parser = (active_type) ->
  t = active_type
      .replace(/Event$/i, '')
      .replace /^[A-Z]/i, (cap) ->
        cap.toLowerCase()
  if @[t]
    @[t]
  else (act, next) ->
    console.log active_type
    next make_entry "have not been implemented yet: #{active_type}"

github_api_response_render = (activities, next) ->
  c = 0
  i = 0
  l = activities.data.length
  results = []

  iteration = (activity, parser, index) ->
    parser activity, (parsed) ->
      c += 1
      results[index] = parsed
      if c >= l
        res = {}
        res.data = results
        next res

  for act in activities.data
    p = parser_by_event.choose_parser act.type
    iteration act, p, i
    i += 1

my_user_name = "VoQn"

github_api_domain = "https://api.github.com"

github_api =
  repos: "#{github_api_domain}/users/#{my_user_name}/repos"
  user_events: "#{github_api_domain}/users/#{my_user_name}/events"

$ () ->
  $repo = $ "#repositories"
  if $repo
    nextProc $repo.handlebars.bind($repo),
      template: "#repositories-template"
      url: github_api.repos

  $activity = $ "#github-activity"
  if $activity
    nextProc () ->
      $.ajax
        type: "GET"
        url: github_api.user_events
        cache: no
        dataType: "jsonp"
      .done (response) ->
        data = response.data.slice 0, 15
        response.data = data
        github_api_response_render response, (activity) ->
          template =
            """
            {{#each data}}
            {{github_act this}}
            {{/each}}
            """
          $activity.html hb template, activity
          $activity.removeClass "loading"

  return

