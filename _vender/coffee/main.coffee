$ () ->
  # generate static infomations
  nextProc () ->
    for section_name, section of static_data_set
      for data in section.data
        for link in data.links
          link.class = "inline-box"

      $(section.placeholder).handlebars
        template: section.template
        data: section.data
  # end

  my_user_name = "VoQn"

  twitter_api_url = "//api.twitter.com/1/statuses/user_timeline.json"
  request_tweet_count = 10

  modify_tweet_entry = (entry) ->
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

  if $("#tweets").length
    $tweets = $ "#tweets"
    nextProc $tweets.handlebars.bind($tweets),
      template: "#tweets-template"
      url: twitter_api_url
      queries:
        screen_name: my_user_name
        count: request_tweet_count
      modify: (data) ->
        for entry in data
          modify_tweet_entry entry

  return
