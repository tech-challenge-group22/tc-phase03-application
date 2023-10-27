import { DynamoDB, config } from 'aws-sdk';
import OrderQueue, { statusName } from '../core/entities/OrderQueue';
import IOrderQueueGateway from '../core/ports/IOrderQueueGateway';

export default class DynamoDBOrderQueueRepository
  implements IOrderQueueGateway
{
  private dynamodb: DynamoDB.DocumentClient;
  private tableName = 'order_queue';

  constructor() {
    config.update({
      accessKeyId: process.env.DYNAMODB_ACCESS_KEY,
      secretAccessKey: process.env.DYNAMODB_SECRET,
      region: process.env.AWS_REGION,
    });
    this.dynamodb = new DynamoDB.DocumentClient();
  }

  beginTransaction(): void {
    // DynamoDB does not support transactions in the same way as MySQL, so this method can be empty.
  }

  commit(): void {
    // DynamoDB does not support transactions in the same way as MySQL, so this method can be empty.
  }

  rollback(): void {
    // DynamoDB does not support transactions in the same way as MySQL, so this method can be empty.
  }

  async getOrderQueue(orderId?: number): Promise<OrderQueue[]> {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableName,
    };

    if (orderId) {
      params.FilterExpression = 'order_id = :order_id';
      params.ExpressionAttributeValues = { ':order_id': orderId };
    } else {
      params.FilterExpression = '#orderStatus <> :orderStatus';
      params.ExpressionAttributeValues = { ':orderStatus': statusName[4] };
      params.ExpressionAttributeNames = {
        '#orderStatus': 'status',
      };
    }

    const returnedValues = await this.dynamodb.scan(params).promise();
    const resultEntity: OrderQueue[] = this.parseToEntity(returnedValues);
    return resultEntity;
  }

  async getOrderQueueStatus(orderId: number): Promise<OrderQueue[]> {
    const params: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableName,
      FilterExpression: 'order_id = :order_id',
      ExpressionAttributeValues: { ':order_id': orderId },
    };

    const returnedValues = await this.dynamodb.scan(params).promise();
    const result = this.parseToEntity(returnedValues);
    return result;
  }

  async updateOrderQueue(
    id: string,
    status_queue_enum_id: number,
    waiting_time: number,
  ) {
    const format_time = this.formatWaitingTime(waiting_time);
    const status: string = statusName[status_queue_enum_id];

    const updateParams = {
      TableName: this.tableName,
      Key: {
        id: id,
      },
      UpdateExpression: 'SET status_queue = :status, waiting_time = :time',
      ExpressionAttributeValues: {
        ':status': status,
        ':time': format_time,
      },
    };

    const returnedValues = await this.dynamodb.update(updateParams).promise();
    const result = this.parseToEntity(returnedValues);
    return result;
  }

  async add(orderId: number) {
    const queue = new OrderQueue(orderId);

    const params = {
      TableName: this.tableName,
      Item: {
        id: queue.id,
        status_queue: queue.status_queue,
        waiting_time: queue.waiting_time,
        orderDate: queue.orderDate,
        order_id: queue.order_id,
      },
    };

    const result = await this.dynamodb.put(params).promise();
    return result;
  }

  private formatWaitingTime(waiting_time: number): string {
    const format_time = '00:0' + waiting_time.toString() + ':00';
    return format_time;
  }

  private parseToEntity(returnedValues: any): OrderQueue[] {
    const resultEntity: OrderQueue[] = [];
    returnedValues.Items?.forEach(
      (element: {
        order_id: number;
        status_queue: string;
        orderDate: string;
        waiting_time: string | undefined;
        id: string | undefined;
      }) => {
        resultEntity.push(
          new OrderQueue(
            element.order_id,
            element.status_queue,
            element.orderDate,
            element.waiting_time,
            element.id,
          ),
        );
      },
    );
    return resultEntity;
  }
}
