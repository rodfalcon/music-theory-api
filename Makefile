ECR_BACKEND  := 659775407889.dkr.ecr.us-east-1.amazonaws.com/rodrigo-falcao-noteflow-backend
ECR_FRONTEND := 659775407889.dkr.ecr.us-east-1.amazonaws.com/rodrigo-falcao-noteflow-frontend
AWS_PROFILE  := rodrigo-falcao-sandbox
AWS_REGION   := us-east-1
CLUSTER      := rodrigo-falcao-noteflow
RDS_SG_NAME  := $(CLUSTER)-rds

.PHONY: build push deploy build-backend build-frontend ecr-login \
        deploy-backend-task dbm-open dbm-close

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

# After `terraform apply` adds a new task def revision, this points the
# backend service at that revision and force-redeploys it.
deploy-backend-task:
	$(eval TASK_DEF := $(shell aws ecs describe-task-definition \
		--task-definition $(CLUSTER)-backend \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'taskDefinition.taskDefinitionArn' --output text))
	aws ecs update-service --cluster $(CLUSTER) \
		--service $(CLUSTER)-backend \
		--task-definition $(TASK_DEF) \
		--force-new-deployment \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'service.deployments[0].{status:status,taskDef:taskDefinition}'

# Temporarily open port 5432 on the RDS SG so you can run dbm-setup.sql locally.
dbm-open:
	$(eval SG_ID := $(shell aws ec2 describe-security-groups \
		--filters "Name=group-name,Values=$(RDS_SG_NAME)" \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'SecurityGroups[0].GroupId' --output text))
	$(eval MY_IP := $(shell curl -s https://checkip.amazonaws.com))
	aws ec2 authorize-security-group-ingress \
		--group-id $(SG_ID) --protocol tcp --port 5432 --cidr $(MY_IP)/32 \
		--profile $(AWS_PROFILE) --region $(AWS_REGION)
	@echo "Port 5432 open for $(MY_IP). Run: psql -h \$$(cd terraform && terraform output -raw rds_endpoint) -U noteflow -d noteflow"
	@echo "When done: make dbm-close"

# Run the DBM setup SQL as a one-off Fargate task inside the VPC (no public RDS needed).
# Requires `terraform apply` to have created the migrate task definition first.
dbm-migrate:
	@SUBNET=$$(aws ec2 describe-subnets \
		--filters "Name=vpc-id,Values=$$(aws ec2 describe-vpcs \
			--filters 'Name=isDefault,Values=true' \
			--profile $(AWS_PROFILE) --region $(AWS_REGION) \
			--query 'Vpcs[0].VpcId' --output text)" \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'Subnets[0].SubnetId' --output text) && \
	SG=$$(aws ec2 describe-security-groups \
		--filters "Name=group-name,Values=$(CLUSTER)-backend" \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'SecurityGroups[0].GroupId' --output text) && \
	TASK_ARN=$$(aws ecs run-task \
		--cluster $(CLUSTER) \
		--task-definition $(CLUSTER)-migrate \
		--launch-type FARGATE \
		--network-configuration "awsvpcConfiguration={subnets=[$$SUBNET],securityGroups=[$$SG],assignPublicIp=ENABLED}" \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'tasks[0].taskArn' --output text) && \
	echo "Migration task: $$TASK_ARN" && \
	echo "Waiting for completion..." && \
	aws ecs wait tasks-stopped \
		--cluster $(CLUSTER) --tasks "$$TASK_ARN" \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) && \
	aws ecs describe-tasks \
		--cluster $(CLUSTER) --tasks "$$TASK_ARN" \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'tasks[0].containers[0].{exitCode:exitCode,reason:reason}'

# Remove the temporary RDS SG rule.
dbm-close:
	$(eval SG_ID := $(shell aws ec2 describe-security-groups \
		--filters "Name=group-name,Values=$(RDS_SG_NAME)" \
		--profile $(AWS_PROFILE) --region $(AWS_REGION) \
		--query 'SecurityGroups[0].GroupId' --output text))
	$(eval MY_IP := $(shell curl -s https://checkip.amazonaws.com))
	aws ec2 revoke-security-group-ingress \
		--group-id $(SG_ID) --protocol tcp --port 5432 --cidr $(MY_IP)/32 \
		--profile $(AWS_PROFILE) --region $(AWS_REGION)
	@echo "RDS port 5432 closed for $(MY_IP)."
