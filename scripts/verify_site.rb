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

def alternate_hrefs(document)
  document.css('link[rel="alternate"][hreflang]').to_h do |link|
    [link["hreflang"], href_path(link["href"])]
  end
end

def assert_language_pair(site_dir, english_path, french_path)
  english_file = english_path == "/" ? "index.html" : "#{english_path.delete_prefix('/')}index.html"
  french_file = "#{french_path.delete_prefix('/')}index.html"
  english = document_at(site_dir, english_file)
  french = document_at(site_dir, french_file)

  fail_check("#{english_path} does not declare English") unless english.at_css('html[lang="en"]')
  fail_check("#{french_path} does not declare French") unless french.at_css('html[lang="fr"]')

  english_toggle = english.at_css('#language-toggle a[href]')
  french_toggle = french.at_css('#language-toggle a[href]')
  fail_check("#{english_path} has no language toggle") if english_toggle.nil?
  fail_check("#{french_path} has no language toggle") if french_toggle.nil?
  fail_check("#{english_path} points to the wrong French page") unless href_path(english_toggle["href"]) == french_path
  fail_check("#{french_path} points to the wrong English page") unless href_path(french_toggle["href"]) == english_path

  english_alternates = alternate_hrefs(english)
  french_alternates = alternate_hrefs(french)
  fail_check("#{english_path} is missing its French hreflang") unless english_alternates["fr-CA"] == french_path
  fail_check("#{french_path} is missing its English hreflang") unless french_alternates["en"] == english_path
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

language_pairs = {
  "/" => "/french/",
  "/academic-interests/" => "/french/academic-interests/",
  "/academic-interests/harnad-years/" => "/french/academic-interests/annees-harnad/",
  "/academic-interests/mila-years/" => "/french/academic-interests/annees-mila/",
  "/blog/" => "/french/blog/",
  "/blog/rereading/" => "/french/blog/relecture/",
  "/blog/rewatching/" => "/french/blog/revisionnage/",
  "/blog/replaying/" => "/french/blog/rejeu/",
  "/blog/rethinking/" => "/french/blog/repensee/",
  "/books/" => "/french/books/",
  "/music/" => "/french/music/",
  "/blog/rereading-julie-ou-la-nouvelle-heloise/" => "/french/blog/relecture-julie-ou-la-nouvelle-heloise/",
  "/blog/rereading-la-valeur-dun-film-philosophie-du-beau-au-cinema/" => "/french/blog/relecture-la-valeur-dun-film-philosophie-du-beau-au-cinema/",
  "/blog/rereading-don-quichotte/" => "/french/blog/relecture-don-quichotte/",
  "/blog/rereading-don-quichotte-2/" => "/french/blog/relecture-don-quichotte-2/"
}

language_pairs.each do |english_path, french_path|
  assert_language_pair(site_dir, english_path, french_path)
end

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

french_rereading = document_at(site_dir, "french/blog/relecture/index.html")
french_don_quichotte_paths = french_rereading.css("#don-quichotte .reading-entry").map { |entry| href_path(entry["href"]) }
expected_french_don_quichotte_paths = [
  "/french/blog/relecture-don-quichotte/",
  "/french/blog/relecture-don-quichotte-2/"
]

unless french_don_quichotte_paths == expected_french_don_quichotte_paths
  fail_check("French Don Quichotte entries are incomplete or out of order: #{french_don_quichotte_paths.inspect}")
end

french_entry_two = document_at(site_dir, "french/blog/relecture-don-quichotte-2/index.html")
french_entry_two_text = french_entry_two.text
fail_check("French Entry 2 did not render its translated content") unless french_entry_two_text.include?("Dédicace, prologue et poèmes liminaires")
fail_check("French Entry 2 still renders an English work status") if french_entry_two_text.include?("Work in progress")
fail_check("French Entry 2 still renders an English date") if french_entry_two_text.include?("August 14, 2026")
fail_check("French Entry 2 did not render its localized date") unless french_entry_two_text.include?("14 août 2026")

[french, french_rereading, french_entry_two].each do |document|
  fail_check("French page is missing the Anglais toggle") unless document.at_css("#language-toggle")&.text&.include?("Anglais")
  fail_check("French page still labels the theme control in English") if document.at_css("#theme-toggle a")&.[]("aria-label") == "Toggle theme"
  fail_check("French page has the wrong Open Graph locale") unless document.at_css('meta[property="og:locale"]')&.[]("content") == "fr_CA"
  fail_check("French page still uses the English site-title suffix") if document.at_css("title")&.text&.include?("Home Page")
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

puts "Site verification passed: navigation, paired translations, localized metadata, Don Quichotte entries, and bilingual map themes all build."
