#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WebDistributionStack } from '../lib/webdistribution';
import { ResourceName } from '../lib/resource_name';

const app = new cdk.App();

// Get Context
const systemName = app.node.tryGetContext("system_name");
const systemEnv = app.node.tryGetContext("env");
const resourceName = new ResourceName(systemName, systemEnv);

// Define stack env
const stackEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

// Create web distribution stack
new WebDistributionStack(app, '01-web-dist', {
  stackName: resourceName.stack_name(`webdist`),
  description: `CloudFront to S3 Test Stack 01 - S3 bucket + Cloudfront distribution.`,
  env: stackEnv,
  resourceName: resourceName,
});

// Create waf stack to us-east-1 region

