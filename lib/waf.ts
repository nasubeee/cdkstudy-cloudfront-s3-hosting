import * as cdk from '@aws-cdk/core';
import { ResourceName } from './resource_name';
import ssm = require('@aws-cdk/aws-ssm');
import wafv2 = require('@aws-cdk/aws-wafv2');

export interface WafStackProps extends cdk.StackProps {
  resourceName: ResourceName;
  allowedIps: string[];
}
export class WafStack extends cdk.Stack {
  wafIpSet: wafv2.CfnIPSet;
  wafAcl: wafv2.CfnWebACL;

  constructor(scope: cdk.Construct, id: string, props: WafStackProps) {
    super(scope, id, props);

    // Create WAF to restrict access
    this.wafIpSet = new wafv2.CfnIPSet(this, 'waf-ipset', {
      name: `allowed-ipset`,
      description: `allow cloudfront access from specific ip only.`,
      ipAddressVersion: "IPV4",
      scope: "CLOUDFRONT",
      addresses: props.allowedIps,
    });

    this.wafAcl = new wafv2.CfnWebACL(this, "waf-acl", {
      defaultAction: { block: {} },
      name: `ipRestriction`,
      description: `allow cloudfront access from specific ip only.`,
      scope: "CLOUDFRONT",
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: "S3CloudfrontAcl",
      },
      rules: [
        {
          name: "AllowFromSpecificIp",
          priority: 1,
          action: { allow: {} },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "S3CloudFrontAclIpSetRule"
          },
          statement: {
            ipSetReferenceStatement: {
              arn: this.wafIpSet.attrArn,
            }
          }
        }
      ],
    });

    new ssm.StringParameter(this, `acl-arn`, {
      parameterName: props.resourceName.ssm_param_name(`distribution/acl/arn`),
      stringValue: this.wafAcl.attrArn,
      description: `WAF ACL Arn for Cloudfront access control.`,
    });

  }
}
