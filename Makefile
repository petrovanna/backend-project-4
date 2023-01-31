install:
	npm ci
publish:
	npm publish --dry-run
lint:
	npx eslint .
test:
	DEBUG=page-loader npx jest
test-watch:
	DEBUG=page-loader npx jest --watch
test-coverage:
	npx jest --coverage
