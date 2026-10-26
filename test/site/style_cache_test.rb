require 'minitest/autorun'
require 'tmpdir'
require 'fileutils'
require 'jekyll'
require 'jekyll-cache-bust'

plugin = File.expand_path('../../_plugins/site_style_cache.rb', __dir__)
require plugin if File.exist?(plugin)

class SiteStyleCacheTest < Minitest::Test
  def setup
    @source = Dir.mktmpdir('site-style-cache-')
    FileUtils.mkdir_p(File.join(@source, 'assets/_sass'))
    FileUtils.mkdir_p(File.join(@source, 'assets/css'))
    FileUtils.mkdir_p(File.join(@source, '_sass'))
    File.write(File.join(@source, 'assets/_sass/theme.scss'), 'body { color: black; }')
    File.write(File.join(@source, 'assets/css/main.scss'), '@use "site";')
    File.write(File.join(@source, '_sass/_site.scss'), '.cv li { list-style: disc; }')
  end

  def teardown
    FileUtils.remove_entry(@source)
  end

  def stylesheet_url
    site = Struct.new(:source).new(@source)
    Dir.chdir(@source) do
      Liquid::Template.parse("{{ '/assets/css/main.css' | bust_css_cache }}").render!({}, registers: { site: site })
    end
  end

  def test_changing_personal_styles_invalidates_the_cached_stylesheet
    before = stylesheet_url
    File.write(File.join(@source, '_sass/_site.scss'), '.cv li { list-style: none; }')
    refute_equal before, stylesheet_url
  end

  def test_changing_theme_styles_still_invalidates_the_cached_stylesheet
    before = stylesheet_url
    File.write(File.join(@source, 'assets/_sass/theme.scss'), 'body { color: white; }')
    refute_equal before, stylesheet_url
  end

  def test_unchanged_styles_keep_a_stable_cache_key
    assert_equal stylesheet_url, stylesheet_url
  end
end
