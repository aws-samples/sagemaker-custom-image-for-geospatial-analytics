# Custom Geospatial SageMaker Image based on Amazon SageMaker Distribution

This project demonstrates how to extend the [Amazon SageMaker Distribution](https://github.com/aws/sagemaker-distribution) with custom libraries and packages to create a custom container image which can be used within SageMaker. While the example provided focuses on geospatial data science, the methodology presented can be applied to any kind of custom image based on the SageMaker Distribution. The project includes Infrastructure as Code (IaC) components that automate the deployment of an AWS CodeBuild project to construct the custom image, along with an Amazon Elastic Container Registry (ECR) repository for hosting the created image.

The SageMaker Distribution enables machine learning practitioners to get started quickly with their ML development. The pre-built docker  container includes deep learning frameworks such as PyTorch, TensorFlow, and Keras; popular Python packages like numpy, scikit-learn, and pandas; and IDEs such as Jupyter Lab. All included libraries and packages are mutually compatible and updated to their latest compatible versions.

Custom images based on the SageMaker Distribution can serve as an interactive JupyterLab notebook environment in SageMaker Studio UI and also be used in non-interactive workflows like SageMaker Processing or Training jobs. This allows the same runtime to be used across Studio notebooks and SageMaker training, facilitating a seamless transition from local experimentation to batch execution.

## Architecture & Solution Overview

Building a custom image and using it in SageMaker involves the following steps:

1. Create a Dockerfile that extends from the SageMaker Distribution and includes the required geospatial libraries
2. Build the custom image from the Dockerfile
3. Push the custom image to an ECR repository
4. Attach the image to your Amazon SageMaker domain
5. Access the image from your JupyterLab space

This solution uses AWS CodeBuild to have a repeatable way to build the custom image and automatically register the new image versions in the  ECR repository. The solution includes a CDK stack to package the [build assets](assets) as a zip file, upload them to S3 and establishes both a CodeBuild project and an ECR repository.

![Solution Overview](images/solution_overview.png)

## Prerequisites & Deployment

### Deploy Container Build Pipeline using CDK

The initial infrastructure can be deployed via the CDK stack in this repository. Follow the steps below to deploy the necessary infrastructure:

1. Clone this repository
2. Navigate to the cloned repository (`cd <path to repository>`)
3. Configure [CLI credentials for your AWS account](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)
4. If you have not done so already, [boostrap your environment for CDK deployment](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html#bootstrapping-env) by running `cdk bootstrap aws://ACCOUNT-NUMBER-1/REGION-1`
5. Run the CDK deployment by running `cd deployment && cdk deploy`
6. Wait until the `CustomImageBuildPipelineStack` been marked as `CREATE COMPLETE`
7. Copy the Output value for `CustomImageBuildPipelineStack.CodeBuildProjectUrl`

### Run Build Pipeline

The build pipeline will build the Dockerfile and pushes the created image to the ECR repository which has been created by the CDK scripts in the previous step.

1. In a browser, navigate to the URL displayed in  `CustomImageBuildPipelineStack.CodeBuildProjectUrl`
2. Click on **Start Build**
![CodeBuild Start Build](images/codebuild_start.png)
3. Wait until the build is complete
4. Copy the value of the image URI on ECR from the build logs
![Build Output](images/build_output.png)

You can also find the image URI by navigating to the [ECR console](https://console.aws.amazon.com/ecr), and search for `customimagebuildpipelinestack-geospatialimagerepository` in the repositories. Click on the `latest-cpu` image tag. The image URI is shown in the **Details** section.  

### Setup SageMaker Domain (optional)

If you don't already have a SageMaker Studio Domain created, please follow this [Quickstart guide](https://docs.aws.amazon.com/sagemaker/latest/dg/onboard-quick-start.html) to setup a domain.

### Attach Custom Image to SageMaker Domain

After the image has been pushed to the ECR repository, you need to attach it to the SageMaker domain to be able to use within SageMaker Studio.

1. Open the [SageMaker console](https://console.aws.amazon.com/sagemaker)
2. Under **Admin configurations**, choose **Domains**
3. Select the domain to which you want to attach the image
4. Open the **Environment** tab
5. In the section **Custom images for personal Studio apps**, click on **Attach image**
![CodeBuild Start Build](images/studio_attach_image.png)
6. Enter the **ECR image URI** from the build pipeline output and click on **Next**
7. Provide an **Image name** and **Image display name**
![Attach Image](images/attach_image_01.png)
8. Select **JupyterLab image** as application type and click on **Submit**
![Attach Image](images/attach_image_02.png)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

