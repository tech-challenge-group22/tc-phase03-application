import { v4 as uuidv4 } from 'uuid';

export default class OrderQueue {
  id: string;
  order_id: number;
  status_queue: string;
  orderDate?: string;
  waiting_time?: string;

  constructor(
    order_id: number,
    status: string,
    orderDate: string,
    waiting_time?: string,
    id?: string,
  ) {
    this.id = id ?? uuidv4();
    this.order_id = order_id;
    this.status_queue = status;
    this.orderDate = orderDate ?? new Date().toISOString();
    this.waiting_time = waiting_time;
  }

  private generateOrderDate() {
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    const brazilianFormattedDateTime = currentDate.toLocaleString(
      'pt-BR',
      options,
    );
  }
}

export enum OrderQueueStatus {
  Recebido = 'Recebido',
  EmPreparacao = 'Em Preparação',
  Pronto = 'Pronto',
  Finalizado = 'Finalizado',
}

export enum OrderWaitingTime {
  TempoRecebido = 5,
  TempoEmPreparacao = 4,
  TempoPronto = 0,
}
