# require jQuery, Handlebars
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
      self.removeClass "loading"
    .fail (xhr, error) ->
      console.log error
  else
    data = require.data
    rawHTML = compiled_templates[template] require.data
    self.html rawHTML
    self.removeClass "loading"

