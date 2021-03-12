import * as AWS from 'aws-sdk';
import config from './config'

interface AWS_CREDS {
    region: string,
    accessKeyId: string,
    secretAccessKey: string
}

class AmazonController {
    private awsCreds: AWS_CREDS = {
        region: config.region,
        accessKeyId: config.aws_id,
        secretAccessKey: config.aws_secret,
    }
    ec2: any = new AWS.EC2(this.awsCreds)
    spotInstanceRequests: string[] = [];

    async cancelSpotRequest(): Promise<void> {
        const params = {
            SpotInstanceRequestIds: this.spotInstanceRequests
        }
        this.ec2.cancelSpotInstanceRequests(params, (err, data) => {
            if (err) {
                console.log('ERRROR cancelSpotInstanceRequests', err)
            } else {
                console.log('CANCEL', data)
            }

        })
    }

    async requestSpot(InstanceCount: number = 1, instanceType: string = 't2.micro', BlockDurationMinutes: number = 60): Promise<void> {
        return new Promise((resolve: any, reject: any): void => {
            const params: any = {
                InstanceCount,
                InstanceInterruptionBehavior: 'terminate',
              //  BlockDurationMinutes,
                LaunchSpecification: {
                    IamInstanceProfile: {
                        Arn: config.bot_server_iam
                    },
                    ImageId: config.bot_instance_ami,
                    InstanceType: instanceType,
                    KeyName: config.bot_server_key,
                    SecurityGroupIds: config.security_group_ids
                },
                //  SpotPrice: "0.020", 
                Type: "one-time",
            };
            this.ec2.requestSpotInstances(params, (err: any, data: any): void => {
                if (err) reject(err, err.stack); // an error occurred
                else {
                    data.SpotInstanceRequests.forEach(r => this.spotInstanceRequests.push(r.SpotInstanceRequestId))
                    resolve(data);

                }

            });
        })
    }
}

export = new AmazonController();