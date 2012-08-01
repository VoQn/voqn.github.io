
footer =
  template: "#footer-template"
  placeholder: "#footer-links"
  data: []

footer.data.push
  header: "Projects"
  links: [
      text: "VoQn/Macchiato"
      url: "//voqn.github.com/macchiato"
      title: "Random Test Framework for JavaScript"
    ,
      text: "VoQn/ZeroFixFramework"
      url: "//github.com/VoQn/ZeroFixFramework"
      title: "User Script Framework for NicoNicoDouga-Zero"
    ,
      text: "rosylilly/QueenCheck"
      url: "//rosylilly.github.com/QueenCheck"
      title: "Random Test Framework for Ruby"
    ,
      text: "yaakaito/NLTQuickCheck"
      url: "//github.com/yaakaito/NLTQuickCheck"
      title: "Random Test Framework for Objective-C"
    ]

footer.data.push
  header: "Publishes"
  links: [
      text: "Blog"
      url: "//voqn.blogspot.com"
      title: "Coding as Drawing"
    ,
      text: "Slideshare"
      url: "//www.slideshare.com/VoQn"
      title: "Uploaded Slides"
    ,
      text: "Qiita - Coding Tips"
      url: "//qiita.com/users/VoQn"
      title: "Coding Tips (Japanese)"
    ,
      text: "Gist"
      url: "//gist.github.com/VoQn"
      title: "Code Snippets"
    ]

footer.data.push
  header: "Social Network"
  links: [
      text: "Twitter"
      url: "//twitter.com/VoQn"
      title: "twitter/VoQn"
    ,
      text: "Tumblr"
      url: "//voqn.tumblr.com"
      title: "VoQnumblr"
    ,
      text: "Facebook"
      url: "//facebook.com/VoQn.km"
      title: "Facebook profile"
    ,
      text: "Google+"
      url: "//plus.google.com/101037793437801252008/about"
      title: "Google+ Profile"
    ]

@static_data_set =
  footer: footer

