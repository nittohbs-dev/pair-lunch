.PHONY: docker-build docker-up docker-down docker-logs docker-shell docker-clean docker-prod-up docker-prod-down docker-test help

# Docker image name
IMAGE_NAME := pair-lunch
TAG := latest

help:
	@echo "Docker Commands:"
	@echo "  make docker-build        - ビルド開発用イメージをビルド"
	@echo "  make docker-up           - 開発用コンテナを起動"
	@echo "  make docker-down         - 開発用コンテナを停止"
	@echo "  make docker-logs         - コンテナのログを表示"
	@echo "  make docker-shell        - コンテナに接続"
	@echo "  make docker-clean        - イメージとコンテナをクリーンアップ"
	@echo "  make docker-prod-build   - 本番用イメージをビルド"
	@echo "  make docker-prod-up      - 本番用コンテナを起動"
	@echo "  make docker-prod-down    - 本番用コンテナを停止"
	@echo "  make docker-test         - イメージをテスト"

## Development
docker-build:
	@echo "Building development image..."
	docker build -t $(IMAGE_NAME):$(TAG) -f Dockerfile .
	@echo "Image built: $(IMAGE_NAME):$(TAG)"

docker-up:
	@echo "Starting development container..."
	docker-compose up -d
	@echo "App is running on http://localhost:3000"

docker-down:
	@echo "Stopping development container..."
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-shell:
	docker-compose exec app sh

docker-clean:
	@echo "Cleaning up..."
	docker-compose down -v
	docker rmi $(IMAGE_NAME):$(TAG)
	@echo "Cleanup complete"

## Production
docker-prod-build:
	@echo "Building production image..."
	docker build -t $(IMAGE_NAME):prod -f Dockerfile.prod .
	@echo "Image built: $(IMAGE_NAME):prod"

docker-prod-up:
	@echo "Starting production container..."
	docker-compose -f docker-compose.prod.yml up -d
	@echo "App is running on http://localhost:3000"

docker-prod-down:
	@echo "Stopping production container..."
	docker-compose -f docker-compose.prod.yml down

## Testing
docker-test: docker-build
	@echo "Testing image..."
	@docker run --rm -d --name $(IMAGE_NAME)-test -p 3001:3000 $(IMAGE_NAME):$(TAG)
	@echo "Waiting for container to start..."
	@sleep 5
	@echo "Running health check..."
	@docker exec $(IMAGE_NAME)-test wget --quiet --tries=1 --spider http://localhost:3000/ && \
		echo "✓ Health check passed" || \
		(echo "✗ Health check failed"; docker stop $(IMAGE_NAME)-test; exit 1)
	@docker stop $(IMAGE_NAME)-test
	@echo "Test completed successfully"

## Status
docker-status:
	@echo "=== Running Containers ==="
	docker ps | grep $(IMAGE_NAME) || echo "No containers running"
	@echo "\n=== Available Images ==="
	docker images | grep $(IMAGE_NAME) || echo "No images found"

docker-remove-image:
	docker rmi $(IMAGE_NAME):$(TAG)

docker-remove-all:
	docker rmi -f $(docker images --filter "reference=$(IMAGE_NAME)*" -q) 2>/dev/null || echo "No images to remove"
