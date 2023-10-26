import { DynamoDB, config } from 'aws-sdk';
import OrderQueue, {
  OrderQueueStatus,
  OrderWaitingTime,
} from '../core/entities/OrderQueue';
import IOrderQueueGateway from '../core/ports/IOrderQueueGateway';

export default class DynamoDBOrderQueueRepository
  implements IOrderQueueGateway
{
  private dynamodb: DynamoDB.DocumentClient;

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
      TableName: 'order_queue',
    };

    if (orderId) {
      params.FilterExpression = 'order_id = :order_id';
      params.ExpressionAttributeValues = { ':order_id': orderId };
    } else {
      params.FilterExpression = '#orderStatus <> :orderStatus';
      params.ExpressionAttributeValues = { ':orderStatus': 'Finalizado' };
      params.ExpressionAttributeNames = {
        '#orderStatus': 'status',
      };
    }

    const returnedValues = await this.dynamodb.scan(params).promise();
    const resultEntity: OrderQueue[] = [];
    returnedValues.Items?.forEach((element) => {
      resultEntity.push(
        new OrderQueue(
          element.order_id,
          element.status_queue,
          element.orderDate,
          element.waiting_time,
          element.id,
        ),
      );
    });
    return resultEntity;
  }

  async getOrderQueueStatus(orderId: number) {
    const params = {
      TableName: 'order_queue',
      Key: {
        orderId: orderId,
      },
      // ProjectionExpression: 'status_queue_enum_id, waiting_time',
    };

    const result = await this.dynamodb.get(params).promise();
    return result.Item;
  }

  async updateOrderQueue(
    orderId: number,
    status_queue_enum_id: number,
    waiting_time: number,
  ) {
    const format_time = this.formatWaitingTime(waiting_time);

    const params = {
      TableName: 'order_queue',
      Key: {
        order_id: orderId,
      },
      UpdateExpression:
        'SET status_queue_enum_id = :status, waiting_time = :time',
      ExpressionAttributeValues: {
        ':status': status_queue_enum_id,
        ':time': format_time,
      },
    };

    const result = await this.dynamodb.update(params).promise();
    return result;
  }

  async add(orderId: number) {
    const format_time = this.formatWaitingTime(OrderWaitingTime.TempoRecebido);

    const params = {
      TableName: 'order_queue',
      Item: {
        order_id: orderId,
        status_queue_enum_id: OrderQueueStatus.Recebido,
        waiting_time: format_time,
      },
    };

    const result = await this.dynamodb.put(params).promise();
    return result;
  }

  private formatWaitingTime(waiting_time: number): string {
    const format_time = '00:0' + waiting_time.toString() + ':00';
    return format_time;
  }
}
