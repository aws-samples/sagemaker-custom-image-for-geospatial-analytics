import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import path = require('path');
import { BuildSpec, Project, Source } from 'aws-cdk-lib/aws-codebuild';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export class CustomImageBuildPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Archive and upload build files in assets directory to S3 as a .zip file
    const buildFilesAsset = new Asset(this, "BuildFilesAsset", {
      path: path.join(__dirname, "/../../assets")
    });

    const bucket = Bucket.fromBucketName(this, 'BuildFilesBucket', buildFilesAsset.s3BucketName);

    const buildProjectRole = new iam.Role(this, 'BuildProjectRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
    });

    const repository = new ecr.Repository(this, 'GeospatialImageRepository', {
      imageScanOnPush: true
    });

    buildProjectRole.attachInlinePolicy(new iam.Policy(this, 'BuildProjectPolicy', {
      statements: [
        new iam.PolicyStatement({
            actions: [
              "ecr:BatchGetImage",
              "ecr:InitiateLayerUpload",
              "ecr:UploadLayerPart",
              "ecr:CompleteLayerUpload",
              "ecr:BatchCheckLayerAvailability",
              "ecr:GetDownloadUrlForLayer",
              "ecr:CreateRepository",
              "ecr:DescribeRepositories",
              "ecr:PutImage"
            ],
            resources: [repository.repositoryArn],
            effect: iam.Effect.ALLOW,
        }),
        // ecr:GetAuthorizationToken requires '*' resource, separated from all other ECR permissions
        // https://docs.aws.amazon.com/AmazonECR/latest/userguide/security_iam_id-based-policy-examples.html#security_iam_id-based-policy-examples-access-one-bucket
        new iam.PolicyStatement({
          actions: [
            "ecr:GetAuthorizationToken",
          ],
          resources: ["*"],
          effect: iam.Effect.ALLOW,
      })
      ]
    }))

    const buildProject = new Project(this, 'GeospatialImageBuildProject', {
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'bash ./build.sh',
            ],
          },
        },
      }),
      environment: {
        environmentVariables: {
          "ECR_REPO_NAME": {
            value: repository.repositoryName
          },
          "ECR_ACCOUNT_ID": {
            value: this.account
          },
          "ECR_REGION": {
            value: this.region
          },
        }
      },
      source: Source.s3({
        bucket: bucket,
        path: buildFilesAsset.s3ObjectKey,
      }),
      role: buildProjectRole,
    });
    
    new cdk.CfnOutput(this, 'CodeBuildProjectUrl', { value: `https://${this.region}.console.aws.amazon.com/codesuite/codebuild/${this.account}/projects/${buildProject.projectName}`});
  }
}
