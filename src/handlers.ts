import {
    Action,
    BaseResource,
    exceptions,
    handlerEvent,
    HandlerErrorCode,
    LoggerProxy,
    OperationStatus,
    Optional,
    ProgressEvent,
    ResourceHandlerRequest,
    SessionProxy,
} from '@amazon-web-services-cloudformation/cloudformation-cli-typescript-lib';
import { ResourceModel } from './models';
import fetch, { Response } from 'node-fetch';

interface CallbackContext extends Record<string, any> {}

interface Hook {
    readonly description: string;
    readonly url: string;
    readonly active: boolean;
    readonly events: string[];
}

interface HookCreationResponse extends Hook {
    // ...
    readonly uuid: string;
}

class Resource extends BaseResource<ResourceModel> {
    static readonly DEFAULT_HEADERS = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    static readonly DEFAULT_API_ENDPOINT = 'https://api.bitbucket.org';
    static readonly DEFAULT_API_VERSION = '2.0';
    static readonly DEFAULT_EVENTS = [
        "repo:push",
        "pullrequest:created",
        "pullrequest:updated",
    ];

    private async checkResponse(response: Response, logger: LoggerProxy, uid?: string): Promise<any> {
        const responseData = await response.text() || '{}';
        logger.log('HTTP response', responseData);

        if (response.status === 400) {
            throw new exceptions.InvalidRequest(this.typeName, HandlerErrorCode.InvalidRequest);
        }

        if (response.status === 401 || response.status === 403) {
            throw new exceptions.AccessDenied(response.statusText);
        } 

        if (response.status === 404) {
            throw new exceptions.NotFound(this.typeName, 'Workspace not found.');
        } 

        if (response.status > 400) {
            throw new exceptions.InternalFailure(
                `error ${response.status} ${response.statusText}`,
                HandlerErrorCode.InternalFailure,
            );
        }

        return JSON.parse(responseData);
    }

    /**
     * CloudFormation invokes this handler when the resource is initially created
     * during stack create operations.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Create)
    public async create(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        
        // Id is a read only property, which means that
        // it cannot be set during creation or update operations.
        if (model.id) {
            throw new exceptions.InvalidRequest('Read only property [Id] cannot be provided by the user.');
        }

        try {
             // Set or fallback to default values
            const creds = `${model.serviceUsername}:${model.serviceAppPassword}`;
            const credsBuff = Buffer.from(creds, 'ascii');
            const base64encCreds = credsBuff.toString('base64');

            const apiEndpoint = Resource.DEFAULT_API_ENDPOINT;
            const apiVersion = Resource.DEFAULT_API_VERSION;

            const createResponse: Response = await fetch(
                `${apiEndpoint}/${apiVersion}/repositories/${model.workspace}/${model.repository}/hooks`, 
                {
                    method: 'POST',
                    headers: {
                        ...Resource.DEFAULT_HEADERS,
                        'Authorization': `Basic ${base64encCreds}`,
                    },
                    body: JSON.stringify({
                        description: "AWS webhook",
                        url: model.webhookUrl,
                        active: true,
                        events: [
                            ...Resource.DEFAULT_EVENTS,
                        ]
                    } as Hook),
                }
            );

            const webhook: HookCreationResponse = await this.checkResponse(createResponse, logger, request.logicalResourceIdentifier);
            logger.log(webhook);
            model.id = webhook.uuid;
            // Setting Status to success will signal to CloudFormation that the operation is complete
            progress.status = OperationStatus.Success;
        } catch(err) {
            logger.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
        }
        return progress;
    }

    /**
     * CloudFormation invokes this handler when the resource is updated
     * as part of a stack update operation.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Update)
    public async update(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        const { id } = request.previousResourceState;

        if (!model.id) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        } else if (model.id !== id) {
            logger.log(this.typeName, `[NEW ${model.id}] [${request.logicalResourceIdentifier}] does not match identifier from saved resource [OLD ${id}].`);
            throw new exceptions.NotUpdatable('Read only property [Id] cannot be updated.');
        }

        const creds = `${model.serviceUsername}:${model.serviceAppPassword}`;
        const credsBuff = Buffer.from(creds, 'ascii');
        const base64encCreds = credsBuff.toString('base64');

        const apiEndpoint = Resource.DEFAULT_API_ENDPOINT;
        const apiVersion = Resource.DEFAULT_API_VERSION;

        try {
            const updateResponse: Response = await fetch(
                `${apiEndpoint}/${apiVersion}/repositories/${model.workspace}/${model.repository}/hooks/${model.id}`, 
                {
                    method: 'PUT',
                    headers: {
                        ...Resource.DEFAULT_HEADERS,
                        'Authorization': `Basic ${base64encCreds}`,
                    },
                    body: JSON.stringify({
                        description: "AWS webhook",
                        url: model.webhookUrl,
                        active: true,
                        events: [
                            ...Resource.DEFAULT_EVENTS,
                        ]
                    } as Hook),
                }
                );

            await this.checkResponse(updateResponse, logger, request.logicalResourceIdentifier);

        } catch(err) {
            logger.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
        }

        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>(model);
        progress.status = OperationStatus.Success;

        return progress;
    }

    /**
     * CloudFormation invokes this handler when the resource is deleted, either when
     * the resource is deleted from the stack as part of a stack update operation,
     * or the stack itself is deleted.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Delete)
    public async delete(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);
        const progress = ProgressEvent.progress<ProgressEvent<ResourceModel, CallbackContext>>();

        const creds = `${model.serviceUsername}:${model.serviceAppPassword}`;
        const credsBuff = Buffer.from(creds, 'ascii');
        const base64encCreds = credsBuff.toString('base64');

        const apiEndpoint = Resource.DEFAULT_API_ENDPOINT;
        const apiVersion = Resource.DEFAULT_API_VERSION;

        try {
            const deleteResponse: Response = await fetch(
                `${apiEndpoint}/${apiVersion}/repositories/${model.workspace}/${model.repository}/hooks/${model.id}`, 
                {
                    method: 'DELETE',
                    headers: {
                        ...Resource.DEFAULT_HEADERS,
                        'Authorization': `Basic ${base64encCreds}`,
                    },
                }
                );
            console.log(deleteResponse.body);
            await this.checkResponse(deleteResponse, logger, request.logicalResourceIdentifier);
        } catch(err) {
            logger.log(err);
            // exceptions module lets CloudFormation know the type of failure that occurred
            throw new exceptions.InternalFailure(err.message);
            // this can also be done by returning a failed progress event
            // return ProgressEvent.failed(HandlerErrorCode.InternalFailure, err.message);
        }

        progress.status = OperationStatus.Success;
        return progress;
    }

    /**
     * CloudFormation invokes this handler as part of a stack update operation when
     * detailed information about the resource's current state is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.Read)
    public async read(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        logger.log('request', request);
        const model = new ResourceModel(request.desiredResourceState);

        if (!model.id) {
            throw new exceptions.NotFound(this.typeName, request.logicalResourceIdentifier);
        }

        return ProgressEvent.success<ProgressEvent<ResourceModel, CallbackContext>>(model);
    }

    /**
     * CloudFormation invokes this handler when summary information about multiple
     * resources of this resource provider is required.
     *
     * @param session Current AWS session passed through from caller
     * @param request The request object for the provisioning request passed to the implementor
     * @param callbackContext Custom context object to allow the passing through of additional
     * state or metadata between subsequent retries
     * @param logger Logger to proxy requests to default publishers
     */
    @handlerEvent(Action.List)
    public async list(
        session: Optional<SessionProxy>,
        request: ResourceHandlerRequest<ResourceModel>,
        callbackContext: CallbackContext,
        logger: LoggerProxy
    ): Promise<ProgressEvent<ResourceModel, CallbackContext>> {
        const model = new ResourceModel(request.desiredResourceState);

        return ProgressEvent.builder<ProgressEvent<ResourceModel, CallbackContext>>()
            .status(OperationStatus.Success)
            .resourceModels([model])
            .build();
    }
}

export const resource = new Resource(ResourceModel.TYPE_NAME, ResourceModel);

// Entrypoint for production usage after registered in CloudFormation
export const entrypoint = resource.entrypoint;

// Entrypoint used for local testing
export const testEntrypoint = resource.testEntrypoint;
