# Robert::WebhookConfig::Repository

The project is a repository that contains an implementation of an AWS Cloudformation resource type.

# Overview

This Cloudformation resource type is used to configure the webhook url for your Bitbucket repository in order for your AWS resources to respond to pull requests and push events.

By using this type of configuration approach you will be able to manage the lifecycle of the webhook in the same place where you manage the CI/CD infrastructure.

# Getting Started

## Step 0: Prerequisites
- An [AWS account](https://aws.amazon.com/)
- A [Bitbucket account](https://bitbucket.org/product/)
- The [AWS CLI](https://aws.amazon.com/cli/) installed and configured on your system
## Step 1: Bitbucket setup
- [Enable MFA](https://support.atlassian.com/bitbucket-cloud/docs/enable-two-step-verification/)
- [Generate an app password](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/) with the following permissions:
    - Pull requests: Read and write
    - Repositories: Read and write
    - Webhooks: Read and write
- [Create a workspace](https://support.atlassian.com/bitbucket-cloud/docs/create-your-workspace/) or choose one that you already have
- [Create a repository](https://support.atlassian.com/bitbucket-cloud/docs/create-a-git-repository/) in the chosen workspace or chose an existent one

## Step 2: Create the resource
    (env)$ aws cloudformation create-stack \
    --template-body file://deployment/example.yml \
    --stack-name my-webhook-config \
    --parameters ParameterKey=ServiceUsername,ParameterValue=<MY_SERVICE_USERNAME> \
                ParameterKey=ServiceAppPassword,ParameterValue=<MY_SERVICE_APP_PASSWORD> \
                ParameterKey=Workspace,ParameterValue=<MY_WORKSPACE> \
                ParameterKey=Repository,ParameterValue=<MY_REPOSITORY> \
                ParameterKey=WebhookUrl,ParameterValue=<MY_WEBHOOK_URL>

## Step 3: Update the resource
    (env)$ aws cloudformation update-stack \
    --use-previous-template \
    --stack-name my-webhook-config \
    --parameters ParameterKey=ServiceUsername,ParameterValue=<MY_SERVICE_USERNAME> \
                ParameterKey=ServiceAppPassword,ParameterValue=<MY_SERVICE_APP_PASSWORD> \
                ParameterKey=Workspace,ParameterValue=<MY_WORKSPACE> \
                ParameterKey=Repository,ParameterValue=<MY_REPOSITORY> \
                ParameterKey=WebhookUrl,ParameterValue=<MY_NEW_WEBHOOK_URL>
## Step 4: Delete the resource
    (env)$ aws cloudformation delete-stack --stack-name my-webhook-config
