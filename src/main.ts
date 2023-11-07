import ExpressAdapter from './application/adapters/ExpressAdapter';
import * as dotenv from 'dotenv';

import CustomerRoute from './infrastructure/api/customer.route';
import OrderRoute from './infrastructure/api/order.route';
import OrderQueueRoute from './infrastructure/api/orderqueue.route';
import ProductRoute from './infrastructure/api/product.route';
import { PaymentRoute } from './infrastructure/api/payment.route';
import { WebhookRoute } from './infrastructure/api/webhook.route';

dotenv.config();
const server = new ExpressAdapter();

const customerRoute = new CustomerRoute(server);
const productRoute = new ProductRoute(server);
const orderRoute = new OrderRoute(server);
const orderQueueRoute = new OrderQueueRoute(server);
const paymentRoute = new PaymentRoute(server);
const webhookRoute = new WebhookRoute(server);

server.router(CustomerRoute);
server.router(OrderRoute);
server.router(OrderQueueRoute);
server.router(ProductRoute);
server.router(PaymentRoute);
server.router(WebhookRoute);

server.listen(3000);
