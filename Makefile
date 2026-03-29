.PHONY: development build preview lint lint-fix install

# Local Docker backend (nginx on port 8889)
API_BASE_URL ?= http://localhost:8889

development:
	API_BASE_URL=$(API_BASE_URL) npm run dev

build:
	API_BASE_URL=$(API_BASE_URL) npm run build

preview:
	npm run preview

lint:
	npm run lint

lint-fix:
	npm run lint:fix

install:
	npm install
