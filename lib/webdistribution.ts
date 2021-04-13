import * as cdk from '@aws-cdk/core';
import { ResourceName } from './resource_name';
import iam = require('@aws-cdk/aws-iam');
import s3 = require('@aws-cdk/aws-s3');
import cloudfront = require('@aws-cdk/aws-cloudfront');
import ssm = require('@aws-cdk/aws-ssm');

export interface WebDistributionStackProps extends cdk.StackProps {
  resourceName: ResourceName;
}
export class WebDistributionStack extends cdk.Stack {
  bucket: s3.Bucket;
  distribution: cloudfront.CloudFrontWebDistribution;
  distributionArn: ssm.StringParameter;

  constructor(scope: cdk.Construct, id: string, props: WebDistributionStackProps) {
    super(scope, id, props);

    // Create S3 bucket
    const bucketName = props.resourceName.bucket_name('host');
    this.bucket = new s3.Bucket(this, `host-bucket`, {
      bucketName: bucketName,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Create Cloudfront OriginAccessIdentity
    const oai = new cloudfront.OriginAccessIdentity(this, "cloudfront-oai");

    // Create bucket policy and attach to bucket
    const bucketPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject"],
      principals: [
        new iam.CanonicalUserPrincipal(
          oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
        ),
      ],
      resources: [this.bucket.bucketArn + "/*"],
    });
    this.bucket.addToResourcePolicy(bucketPolicy);

    // Create cloudfront web distribution
    this.distribution = new cloudfront.CloudFrontWebDistribution(
      this, "website-distribution", {
      viewerCertificate: {
        aliases: [],
        props: {
          cloudFrontDefaultCertificate: true,
        },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: this.bucket,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              minTtl: cdk.Duration.seconds(0),
              maxTtl: cdk.Duration.days(365),
              defaultTtl: cdk.Duration.days(1),
              pathPattern: "*",
            },
          ],
        },
      ],
      errorConfigurations: [
        {
          errorCode: 403,
          responsePagePath: "/index.html",
          responseCode: 200,
          errorCachingMinTtl: 0,
        },
        {
          errorCode: 404,
          responsePagePath: "/index.html",
          responseCode: 200,
          errorCachingMinTtl: 0,
        },
      ],
    });

    // Register cloudfront web distribution to ssm parameter store
    this.distributionArn = new ssm.StringParameter(this, `dist-arn`, {
      parameterName: props.resourceName.ssm_param_name(`distribution/arn`),
      stringValue: `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
      description: `CloudFront site distribtuion arn`,
    });
  }
}
