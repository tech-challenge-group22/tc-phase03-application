export interface MoveNextInputDTO {
  id: number;
}

export interface MoveNextOutputDTO {
  hasError: boolean;
  message?: string;
  httpCode?: number;
  result?: orderqueueInfo[];
}

export type orderqueueInfo = {
  id: number;
  status: string;
  waiting_time: string;
};
