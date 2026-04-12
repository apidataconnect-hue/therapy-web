.PHONY: development build preview lint lint-fix install deploy deploy-prod

# Local Docker backend (nginx on port 8889)
API_BASE_URL ?= http://localhost:8889

# Production API
PROD_API_URL ?= https://api.apidataconnect.com

# Production server
PROD_HOST  ?= root@46.101.132.64
PROD_DIR   ?= /var/www/therapy_web_prod

development:
	API_BASE_URL=$(API_BASE_URL) npm run dev

build:
	API_BASE_URL=$(API_BASE_URL) npm run build

deploy: build
	tar -czf therapy-web.tar.gz .output
	scp therapy-web.tar.gz $(PROD_HOST):$(PROD_DIR)/
	ssh $(PROD_HOST) "\
		cd $(PROD_DIR) && \
		tar -xzf therapy-web.tar.gz && \
		rm -f therapy-web.tar.gz && \
		pm2 restart therapy-web || pm2 start .output/server/index.mjs --name therapy-web && \
		pm2 save"
	rm -f therapy-web.tar.gz
	@echo "✓ Deployed to production"

deploy-prod:
	API_BASE_URL=$(PROD_API_URL) $(MAKE) deploy

preview:
	npm run preview

lint:
	npm run lint

lint-fix:
	npm run lint:fix

install:
	npm install
