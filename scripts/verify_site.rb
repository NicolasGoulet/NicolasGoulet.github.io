# frozen_string_literal: true

require "nokogiri"
require "pathname"
require "uri"

site_dir = Pathname(__dir__).join("..", "_site").expand_path

def fail_check(message)
  warn "Site verification failed: #{message}"
  exit 1
end

def document_at(site_dir, relative_path)
  path = site_dir.join(relative_path)
  fail_check("missing #{relative_path}") unless path.file?

  Nokogiri::HTML(path.read)
end

def nav_hrefs(document)
  document.css("#site-nav a[href]").map do |link|
    URI.parse(link["href"]).path
  rescue URI::InvalidURIError
    link["href"]
  end
end

english = document_at(site_dir, "index.html")
french = document_at(site_dir, "french/index.html")

{
  "English" => {
    document: english,
    visible: ["/academic-interests/", "/blog/"],
    hidden: ["/books/", "/music/"]
  },
  "French" => {
    document: french,
    visible: ["/french/academic-interests/", "/french/blog/"],
    hidden: ["/french/books/", "/french/music/"]
  }
}.each do |language, expectations|
  hrefs = nav_hrefs(expectations[:document])

  expectations[:visible].each do |href|
    fail_check("#{language} navigation is missing #{href}") unless hrefs.include?(href)
  end

  expectations[:hidden].each do |href|
    fail_check("#{language} navigation still exposes #{href}") if hrefs.include?(href)
  end
end

%w[
  academic-interests/index.html
  blog/index.html
  books/index.html
  music/index.html
  french/academic-interests/index.html
  french/blog/index.html
  french/books/index.html
  french/music/index.html
].each do |relative_path|
  fail_check("missing retained page #{relative_path}") unless site_dir.join(relative_path).file?
end

fail_check("English home styling hook is missing") if english.at_css(".home-profile").nil?
fail_check("French home styling hook is missing") if french.at_css(".home-profile").nil?
fail_check("compiled stylesheet is missing") unless site_dir.join("assets/css/main.css").file?

puts "Site verification passed: active tabs render, hidden tabs stay hidden, and retained pages still build."
