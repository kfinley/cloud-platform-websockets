import 'reflect-metadata';
import { Container, container } from 'inversify-props';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { bootstrapper as awsCommandsBootstrapper } from '@cloud-platform/aws-commands/src';
import { AuthorizeConnectionCommand, DeleteConnectionByUserIdCommand, DeleteConnectionCommand, GetConnectionByUserIdCommand, SaveConnectionCommand, SendMessageCommand } from './commands';
import { IMessageCommand } from './commands/messageCommand';
import { PingMessageCommand, PingMessageRequest, PingMessageResponse } from './commands/pingMessage';

export default function bootstrapper() {

  awsCommandsBootstrapper(container);

  if (!container.isBound("DynamoDBClient")) {
    container.bind<DynamoDBClient>("DynamoDBClient")
      .toDynamicValue(() => new DynamoDBClient({
        endpoint: "http://cloud-platform.dynamodb:8000"
      }));
  }

  if (!container.isBound("ApiGatewayManagementApiClient")) {
    container.bind<ApiGatewayManagementApiClient>("ApiGatewayManagementApiClient")
      .toDynamicValue(() => new ApiGatewayManagementApiClient({
        endpoint: "http://cloud-platform.sls:3001"
      }));
  }

  addTransientIfNeeded<AuthorizeConnectionCommand>(AuthorizeConnectionCommand, "AuthorizeConnectionCommand", container);
  addTransientIfNeeded<DeleteConnectionCommand>(DeleteConnectionCommand, "DeleteConnectionCommand", container);
  addTransientIfNeeded<DeleteConnectionByUserIdCommand>(DeleteConnectionByUserIdCommand, "DeleteConnectionByUserIdCommand", container);
  addTransientIfNeeded<GetConnectionByUserIdCommand>(GetConnectionByUserIdCommand, "GetConnectionByUserIdCommand", container);
  addTransientIfNeeded<SendMessageCommand>(SendMessageCommand, "SendMessageCommand", container);
  addTransientIfNeeded<SaveConnectionCommand>(SaveConnectionCommand, "SaveConnectionCommand", container);

  addTransientIfNeeded<IMessageCommand>(PingMessageCommand, "PingMessageCommand", container);
}

function addTransientIfNeeded<T>(constructor: any, id: string, container: Container) {
  if (!container.isBound(id)) {
    container.addTransient<T>(constructor, id);
  }
}

