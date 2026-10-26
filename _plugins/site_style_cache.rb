require 'digest/sha2'
require 'jekyll-cache-bust'

module SiteStyleCache
  def bust_css_cache(file_name)
    url = super
    site = @context.registers[:site]
    return url unless site

    sources = [File.join(site.source, 'assets/css/main.scss')]
    sources.concat(Dir.glob(File.join(site.source, '_sass/**/*.{scss,sass}')))
    sources.select! { |path| File.file?(path) }
    return url if sources.empty?

    fingerprint = Digest::SHA256.hexdigest(sources.sort.map { |path| File.read(path) }.join("\0"))
    "#{url}&site=#{fingerprint[0, 16]}"
  end
end

Jekyll::CacheBust.prepend(SiteStyleCache)
