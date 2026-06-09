ECR_BACKEND  := 659775407889.dkr.ecr.us-east-1.amazonaws.com/rodrigo-falcao-noteflow-backend
ECR_FRONTEND := 659775407889.dkr.ecr.us-east-1.amazonaws.com/rodrigo-falcao-noteflow-frontend
AWS_PROFILE  := rodrigo-falcao-sandbox
AWS_REGION   := us-east-1
CLUSTER      := rodrigo-falcao-noteflow

.PHONY: build push deploy build-backend build-frontend ecr-login

build: build-backend build-frontend

build-backend:
	mvn clean package -DskipTests -q
	docker build --platform linux/amd64 -t music-theory-api:0.1.0 .

build-frontend:
	cd music_streaming-entertainment-modern_react && \
		REACT_APP_DD_ENV=sandbox npm run build
	docker build --platform linux/amd64 \
		-t noteflow-frontend:latest \
		music_streaming-entertainment-modern_react

ecr-login:
	aws ecr get-login-password --region $(AWS_REGION) --profile $(AWS_PROFILE) \
		| docker login --username AWS --password-stdin $(ECR_BACKEND)

push: ecr-login
	docker tag music-theory-api:0.1.0 $(ECR_BACKEND):latest
	docker push $(ECR_BACKEND):latest
	docker tag noteflow-frontend:latest $(ECR_FRONTEND):latest
	docker push $(ECR_FRONTEND):latest

deploy:
	aws ecs update-service --cluster $(CLUSTER) \
		--service $(CLUSTER)-backend \
		--force-new-deployment \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'service.deployments[0].{status:status,failedTasks:failedTasks}'
	aws ecs update-service --cluster $(CLUSTER) \
		--service $(CLUSTER)-frontend \
		--force-new-deployment \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'service.deployments[0].{status:status,failedTasks:failedTasks}'

release: build push deploy
