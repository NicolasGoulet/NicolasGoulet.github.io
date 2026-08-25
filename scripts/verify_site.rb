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

def href_path(href)
  URI.parse(href).path
rescue URI::InvalidURIError
  href
end

def nav_hrefs(document)
  document.css("#site-nav a[href]").map { |link| href_path(link["href"]) }
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

rereading = document_at(site_dir, "blog/rereading/index.html")
don_quichotte_entries = rereading.css("#don-quichotte .reading-entry")
don_quichotte_paths = don_quichotte_entries.map { |entry| href_path(entry["href"]) }
expected_don_quichotte_paths = [
  "/blog/rereading-don-quichotte/",
  "/blog/rereading-don-quichotte-2/"
]

unless don_quichotte_paths == expected_don_quichotte_paths
  fail_check("Don Quichotte entries are incomplete or out of order: #{don_quichotte_paths.inspect}")
end

{
  "English" => ["blog/rereading-don-quichotte/index.html", "lang=en"],
  "French" => ["french/blog/relecture-don-quichotte/index.html", "lang=fr"]
}.each do |language, (relative_path, language_query)|
  document = document_at(site_dir, relative_path)
  frame = document.at_css("#cervantes-life-map-frame")
  fail_check("#{language} Cervantes map is missing") if frame.nil?
  fail_check("#{language} Cervantes map has the wrong language") unless frame["src"].include?(language_query)
end

map_html = site_dir.join("assets/maps/cervantes-life-map.html").read
map_css = site_dir.join("assets/css/cervantes-life-map-embed.css").read
fail_check("Cervantes map is missing its French translation") unless map_html.include?("Lancer le voyage")
fail_check("Cervantes map is missing its light palette") unless map_css.include?("--cvm-map-sea: #e7ecea")
fail_check("Cervantes map is missing its dark palette") unless map_css.include?("--cvm-map-sea: #070303")

puts "Site verification passed: navigation, retained pages, Don Quichotte entries, and bilingual map themes all build."
