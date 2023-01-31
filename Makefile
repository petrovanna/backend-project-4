install:
	npm ci
publish:
	npm publish --dry-run
lint:
	npx eslint .
test:
	DEBUG=page-loader npx jest
test-coverage:
	npx jest --coverage
test-watch:
	DEBUG=page-loader npx jest --watch