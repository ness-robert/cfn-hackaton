// This is a generated file. Modifications will be overwritten.
import { BaseModel, Dict, integer, Integer, Optional, transformValue } from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { Exclude, Expose, Type, Transform } from 'class-transformer';

export class ResourceModel extends BaseModel {
    ['constructor']: typeof ResourceModel;

    @Exclude()
    public static readonly TYPE_NAME: string = 'Robert::WebhookConfig::Repository';

    @Exclude()
    protected readonly IDENTIFIER_KEY_ID: string = '/properties/Id';

    @Expose({ name: 'Id' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'id', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    id?: Optional<string>;
    @Expose({ name: 'ServiceUsername' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'serviceUsername', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    serviceUsername?: Optional<string>;
    @Expose({ name: 'ServiceAppPassword' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'serviceAppPassword', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    serviceAppPassword?: Optional<string>;
    @Expose({ name: 'Workspace' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'workspace', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    workspace?: Optional<string>;
    @Expose({ name: 'Repository' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'repository', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    repository?: Optional<string>;
    @Expose({ name: 'WebhookUrl' })
    @Transform(
        (value: any, obj: any) =>
            transformValue(String, 'webhookUrl', value, obj, []),
        {
            toClassOnly: true,
        }
    )
    webhookUrl?: Optional<string>;

    @Exclude()
    public getPrimaryIdentifier(): Dict {
        const identifier: Dict = {};
        if (this.id != null) {
            identifier[this.IDENTIFIER_KEY_ID] = this.id;
        }

        // only return the identifier if it can be used, i.e. if all components are present
        return Object.keys(identifier).length === 1 ? identifier : null;
    }

    @Exclude()
    public getAdditionalIdentifiers(): Array<Dict> {
        const identifiers: Array<Dict> = new Array<Dict>();
        // only return the identifiers if any can be used
        return identifiers.length === 0 ? null : identifiers;
    }
}

