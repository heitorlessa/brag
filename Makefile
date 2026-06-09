.PHONY: help install watch dev build preview clean lint lint-fix fmt typecheck validate test test-watch db-generate
.DEFAULT_GOAL := help

COLOR_TITLE := \033[1;36m
COLOR_TARGET := \033[1;32m
COLOR_RESET := \033[0m

help: ## Show this help
	@printf "$(COLOR_TITLE)Brag — available commands$(COLOR_RESET)\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_TARGET)%-14s$(COLOR_RESET) %s\n", $$1, $$2}'

install: ## Install dependencies (pnpm)
	which pnpm > /dev/null || npm install -g pnpm@latest
	pnpm install

watch: ## Start the dev server with hot reload (http://localhost:3000)
	pnpm run dev

dev: watch ## Alias for watch

build: ## Build the production SPA
	pnpm run build

preview: build ## Preview the production build
	pnpm run preview

clean: ## Remove build artifacts
	rm -rf .nuxt .output dist coverage

lint: ## Run oxlint then ESLint
	pnpm run lint

lint-fix: ## Auto-fix lint issues
	pnpm run lint:fix

fmt: ## Format with oxfmt
	pnpm run fmt

typecheck: ## Type-check with vue-tsc
	pnpm run typecheck

validate: ## Lint + typecheck (the full quality gate)
	pnpm run validate

test: ## Run unit tests once
	pnpm run test:run

test-watch: ## Run unit tests in watch mode
	pnpm run test

db-generate: ## Generate + embed Drizzle migrations from schema.ts
	pnpm run db:migrations:generate
