#!/bin/bash

set -e

SM_DIST_TYPE=cpu

while [ -z $ECR_ACCOUNT_ID ]; do
    echo "ECR_ACCOUNT_ID not set. Provide AWS account id for pushing ECR image:"
    read ECR_ACCOUNT_ID
done

while [ -z $ECR_REPO_NAME ]; do
    echo "ECR_REPO_NAME not set. Provide name for ECR repository id for pushing ECR image:"
    read ECR_REPO_NAME
done

while [ -z $ECR_REGION ]; do
    echo "ECR_REGION not set. Provide AWS region for pushing ECR image:"
    read ECR_REGION
done

echo "ECR_REPO_NAME: $ECR_REPO_NAME"
echo "ECR_ACCOUNT_ID: $ECR_ACCOUNT_ID"
echo "ECR_REGION: $ECR_REGION"

if [[ '[ "cpu", "gpu"]' =~ "\"$SM_DIST_TYPE\"" ]]; then
    TAG=${ECR_REPO_NAME}:latest-${SM_DIST_TYPE}
else
    >&2 echo "Invalid SM_DIST_TYPE '$SM_DIST_TYPE', aborting..."
    exit 1
fi

echo "IMAGE TAG: $TAG"
echo "ECR TARGET: ${ECR_ACCOUNT_ID}.dkr.ecr.${ECR_REGION}.amazonaws.com/${TAG}"

aws ecr get-login-password --region ${ECR_REGION} | docker login --username AWS --password-stdin ${ECR_ACCOUNT_ID}.dkr.ecr.${ECR_REGION}.amazonaws.com

# In this example, the ECR repository is created via CDK. The following code is validating if the desired ECR repository exists and will create it otherwise. 
# Uncomment the following code block if you intend to run the script standalone.

#RC=0
#aws ecr describe-repositories --repository-names $ECR_REPO_NAME --registry-id $ECR_ACCOUNT_ID --no-paginate >> /dev/null || RC=$?
#if [ $RC -ne 0 ]; then
#    echo "ECR repository '$ECR_REPO_NAME' seems not to exist, creating repository"
#    aws ecr create-repository --repository-name $ECR_REPO_NAME --registry-id $ECR_ACCOUNT_ID --no-paginate >> /dev/null
#fi

set -x
docker build -f Dockerfile --build-arg DISTRIBUTION_TYPE=$SM_DIST_TYPE -t $TAG .
set +x

docker tag $TAG ${ECR_ACCOUNT_ID}.dkr.ecr.${ECR_REGION}.amazonaws.com/${TAG}
docker push ${ECR_ACCOUNT_ID}.dkr.ecr.${ECR_REGION}.amazonaws.com/${TAG}

echo ""
echo "Created image pushed to ECR image URI: ${ECR_ACCOUNT_ID}.dkr.ecr.${ECR_REGION}.amazonaws.com/${TAG}"
echo ""
echo "Done"