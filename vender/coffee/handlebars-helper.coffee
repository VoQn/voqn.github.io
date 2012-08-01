
#
# Handlebars.js helper
#

helpers =
  link: (text, options) ->
    attrs = for property, value of options.hash
      "#{property}=\"#{value}\""
    new Handlebars.SafeString "<a #{attrs.join " "}>#{text}</a>"

  list: (items, options) ->
    entries = for item in items
      "<li>#{options.fn item}</li>"
    "<ul>#{entries.join " "}</ul>"

  date: (date_expr, options) ->
    format_expr = (t) -> if t < 10 then "0#{t}" else "#{t}"

    date =
      if date_expr instanceof Date
      then date_expr
      else new Date date_expr

    offset = date.getTimezoneOffset()
    locale = new Date date.getTime() - offset * 6000
    yy = locale.getFullYear()
    mm = locale.getMonth() + 1
    dd = locale.getDate()
    hh = locale.getHours()
    mi = locale.getMinutes()

    new Handlebars.SafeString(
      "#{yy}/#{format_expr mm}/#{format_expr dd}  #{format_expr hh}:#{format_expr mi}"
    )

  tweet_entry: (post, options) ->
    new Handlebars.SafeString post

for name, func of helpers
  Handlebars.registerHelper name, func
