
import { DynamoDBClient, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { Command } from '@cloud-platform/commands/src';
import { Inject } from 'inversify-props';
import { DeleteConnectionRequest, DeleteConnectionResponse } from '../models';

const CONNECTION_TABLE = process.env.WEBSOCKETS_CONNECTION_TABLE as string;

export class DeleteConnectionCommand implements Command<DeleteConnectionRequest, DeleteConnectionResponse> {

  @Inject("DynamoDBClient")
  private ddbClient!: DynamoDBClient;

  async runAsync(params: DeleteConnectionRequest): Promise<DeleteConnectionResponse> {

    let { userId, connectionId } = params;

    if (!userId || !connectionId) {

      console.log('Looking up userId');

      const response = await this.ddbClient.send(new ScanCommand({
        TableName: CONNECTION_TABLE,
        ExpressionAttributeValues: {
          ':connectionId': { S: params.connectionId as string }
        },
        ProjectionExpression: 'userId, connectionId',
        FilterExpression: 'connectionId = :connectionId'
      }));
      if (response.$metadata.httpStatusCode !== 200) {
        throw new Error("Unexpected response in DeleteConnection");
      }

      if (response.Items) {
        const item = response.Items[0]
        userId = item.userId.S;
        connectionId = item.connectionId.S;
      } else {
        return {
          success: false
        };
      }
    }

    console.log('Deleting user connection');
    
    var response = await this.ddbClient.send(new DeleteItemCommand({
      TableName: CONNECTION_TABLE,
      Key: {
        userId: {
          S: userId as string
        },
        connectionId: {
          S: connectionId as string
        }
      }
    }));

    if (response.$metadata.httpStatusCode !== 200) {
      throw new Error("Unexpected response in DeleteConnection");
    }

    console.log('deleted websocket connection');

    return {
      success: true
    };
  }
}
