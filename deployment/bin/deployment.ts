#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CustomImageBuildPipelineStack } from '../lib/custom-image-build-pipeline';

const app = new cdk.App();
new CustomImageBuildPipelineStack(app, 'CustomImageBuildPipelineStack', {});