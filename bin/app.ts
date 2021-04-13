#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { WebDistributionStack } from '../lib/webdistribution';
import { WafStack } from '../lib/waf';
import { ResourceName } from '../lib/resource_name';
import { env } from 'process';

const app = new cdk.App();

// Get Context
const systemName = app.node.tryGetContext("system_name");
const systemEnv = app.node.tryGetContext("env");
const allowedIps = app.node.tryGetContext("allowd_ips");
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
new WafStack(app, '02-waf', {
  stackName: resourceName.stack_name(`waf`),
  description: `CloudFront to S3 Test Stack 02 - WAF`,
  env: {
    account: stackEnv.account,
    region: "us-east-1",
  },
  resourceName: resourceName,
  allowedIps: allowedIps,
  webDistributionRegion: stackEnv.region as string,
});
