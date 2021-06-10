# Robert::WebhookConfig::Repository

An example resource schema demonstrating some basic constructs and validation rules.

## Syntax

To declare this entity in your AWS CloudFormation template, use the following syntax:

### JSON

<pre>
{
    "Type" : "Robert::WebhookConfig::Repository",
    "Properties" : {
        "<a href="#serviceusername" title="ServiceUsername">ServiceUsername</a>" : <i>String</i>,
        "<a href="#serviceapppassword" title="ServiceAppPassword">ServiceAppPassword</a>" : <i>String</i>,
        "<a href="#workspace" title="Workspace">Workspace</a>" : <i>String</i>,
        "<a href="#repository" title="Repository">Repository</a>" : <i>String</i>,
        "<a href="#webhookurl" title="WebhookUrl">WebhookUrl</a>" : <i>String</i>
    }
}
</pre>

### YAML

<pre>
Type: Robert::WebhookConfig::Repository
Properties:
    <a href="#serviceusername" title="ServiceUsername">ServiceUsername</a>: <i>String</i>
    <a href="#serviceapppassword" title="ServiceAppPassword">ServiceAppPassword</a>: <i>String</i>
    <a href="#workspace" title="Workspace">Workspace</a>: <i>String</i>
    <a href="#repository" title="Repository">Repository</a>: <i>String</i>
    <a href="#webhookurl" title="WebhookUrl">WebhookUrl</a>: <i>String</i>
</pre>

## Properties

#### ServiceUsername

Bitbucket service username.

_Required_: Yes

_Type_: String

_Minimum_: <code>1</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### ServiceAppPassword

Bitbucket app password.

_Required_: Yes

_Type_: String

_Minimum_: <code>1</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Workspace

Bitbucket workspace slug in which the repository is located.

_Required_: Yes

_Type_: String

_Minimum_: <code>1</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### Repository

Repository slug for which the webhook needs to be configured.

_Required_: Yes

_Type_: String

_Minimum_: <code>1</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

#### WebhookUrl

The url to call when an event is triggered.

_Required_: Yes

_Type_: String

_Pattern_: <code>^https?://[^\s/$.?#].[^\s]*$</code>

_Update requires_: [No interruption](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-update-behaviors.html#update-no-interrupt)

## Return Values

### Ref

When you pass the logical ID of this resource to the intrinsic `Ref` function, Ref returns the Id.

### Fn::GetAtt

The `Fn::GetAtt` intrinsic function returns a value for a specified attribute of this type. The following are the available attributes and sample return values.

For more information about using the `Fn::GetAtt` intrinsic function, see [Fn::GetAtt](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-getatt.html).

#### Id

The id of the resource.

