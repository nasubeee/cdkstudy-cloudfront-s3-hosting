import * as cdk from '@aws-cdk/core';
import { ResourceName } from './resource_name';
import { SSMParameterReader } from './ssm_parameter_reader';
import wafv2 = require('@aws-cdk/aws-wafv2');

export interface WafStackProps extends cdk.StackProps {
  resourceName: ResourceName;
  allowedIps: string[];
  webDistributionRegion: string;
}
export class WafStack extends cdk.Stack {
  wafIpSet: wafv2.CfnIPSet;
  wafAcl: wafv2.CfnWebACL;
  wafAssociation: wafv2.CfnWebACLAssociation;

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
      name: `ip-restriction`,
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

    const distributionArnReader = new SSMParameterReader(this, 'distributionArnReader', {
      parameterName: props.resourceName.ssm_param_name(`distribution/arn`),
      region: props.webDistributionRegion as string,
    });
    const distributionArn: string = distributionArnReader.getParameterValue();
    // const webAclArn: string = `arn:aws:wafv2:${this.region}:${this.account}:global/webacl/eval/${this.wafAcl.name}`;
    this.wafAssociation = new wafv2.CfnWebACLAssociation(this, 'WebAclAssociation', {
      resourceArn: distributionArn,
      webAclArn: this.wafAcl.attrArn
    });
  }
}
