import { GetOrderQueueUseCase } from '../usecases/getOrderQueue/GetOrderQueue';
import MySqlOrderQueueRepository from '../gateways/OrderQueueRepository';
import { GetOrderQueueInputDTO } from '../usecases/getOrderQueue/GetOrderQueueDTO';
import { MoveNextInputDTO } from '../usecases/moveNext/MoveNextDTO';
import { MoveNextUseCase } from '../usecases/moveNext/MoveNext';
import DynamoDBOrderQueueRepository from '../gateways/DynamoDBOrderQueueRepository';

export class OrderQueueController {
  static async getOrderQueue(orderId?: number): Promise<any> {
    const orderQueueGateway = new DynamoDBOrderQueueRepository();
    const input: GetOrderQueueInputDTO = {
      id: orderId,
    };
    return await GetOrderQueueUseCase.execute(input, orderQueueGateway);
  }

  static async moveNext(orderId: number): Promise<any> {
    const orderQueueGateway = new MySqlOrderQueueRepository();
    const input: MoveNextInputDTO = {
      id: orderId,
    };
    return await MoveNextUseCase.execute(input, orderQueueGateway);
  }
}
