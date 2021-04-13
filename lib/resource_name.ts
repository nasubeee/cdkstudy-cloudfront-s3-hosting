import * as cdk from '@aws-cdk/core';

export class ResourceName {
    public readonly systemName: string;
    public readonly subSystemName: string;
    public readonly systemEnv: string;

    constructor(system_name: string, env: string) {
        this.systemName = system_name;
        this.systemEnv = env;
    }

    private generate(suffix: string): string {
        return `${this.systemName}-${this.systemEnv}-${suffix}`;
    }

    public stack_name(name: string): string {
        return this.generate(`${name}-stack`);
    }

    public bucket_name(name: string): string {
        return this.generate(`${name}-bukcet`).toLowerCase();
    }

    public role_name(name: string): string {
        return this.generate(`${name}-role`);
    }

    public ssm_param_name(name: string): string {
        return `/${this.systemName}/${this.systemEnv}/${name}`;
    }
}
