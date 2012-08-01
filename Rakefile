task :default => :generate

desc 'Launch preview jekyll'
task :preview => [:assets, :quickrun]

desc 'Pushing repository to Github'
task :release do
  message = "Site updated at #{Time.now.strftime '%Y-%m-%d'}"
  sh "git add ."
  sh "git commit -m \"#{message}\""
  sh "git push origin master"
end

desc 'Compile and distination *.coffee & *.less'
task :assets do
  temp_dir = "_temp"
  sh "rm -rf #{temp_dir}"
  sh "mkdir #{temp_dir}"
  sh "cat ./vender/coffee/*.coffee > #{temp_dir}/script.coffee"
  sh "coffee -c -o ./js #{temp_dir}/script.coffee"
  sh "lessc ./vender/less/style.less > ./css/style.css"
end

desc 'Launch preview jekyll server'
task :quickrun do
  sh "jekyll --server --auto"
end
