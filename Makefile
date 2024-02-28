local-run:
	bundle exec jekyll serve --watch
prod-run:
	JEKYLL_ENV=production \
	bundle exec jekyll serve --watch