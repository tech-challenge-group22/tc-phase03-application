export interface GetOrderQueueInputDTO {
  id?: number;
}

export interface GetOrderQueueOutputDTO {
  hasError: boolean;
  message?: string;
  httpCode?: number;
  result?: orderqueueInfo[];
}

export type orderqueueInfo = {
  id: string;
  order_id: number;
  status: string;
  waiting_time: string;
  orderDate: string;
};
