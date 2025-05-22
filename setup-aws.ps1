# Create S3 bucket for deployments
aws s3api create-bucket --bucket wordle-deployment --region us-east-1

# Create DynamoDB table
aws dynamodb create-table \
    --table-name wordle-game-data \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=gameId,AttributeType=N \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=gameId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

# Create IAM role for Elastic Beanstalk
$policy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:*"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:*:table/wordle-game-data"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::wordle-deployment",
                "arn:aws:s3:::wordle-deployment/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": "*"
        }
    ]
}
"@

aws iam create-role \
    --role-name wordle-eb-role \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam put-role-policy \
    --role-name wordle-eb-role \
    --policy-name wordle-eb-policy \
    --policy-document $policy
