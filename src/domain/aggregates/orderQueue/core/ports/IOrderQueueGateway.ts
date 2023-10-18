export default interface IOrderQueueGateway {
  getOrderQueue(orderId?: number): any;
  getOrderQueueStatus(orderId: number): any;
  updateOrderQueue(
    orderId: number,
    status_queue_enum_id: number,
    waiting_time: number,
  ): any;
  add(orderId: number): any;
  beginTransaction(): void;
  commit(): void;
  rollback(): void;
}
