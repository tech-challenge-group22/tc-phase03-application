import { GetItemCommand, DynamoDB } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  DeleteCommand,
  DynamoDBDocument,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import IProductCacheRepository from '../core/ports/IProductCacheRepository';

//const client = new DynamoDBClient({ region : "us-east-1"});
//const dynamodb  =  new DynamoDB();
//const docClient = DynamoDBDocumentClient.from(client);

export default class AwsDynamoRepository implements IProductCacheRepository {
  private dynamodb: DynamoDBDocument;
  private table = 'tbl_products';
  constructor() {
    this.dynamodb = DynamoDBDocument.from(
      new DynamoDB({
        credentials: {
          accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
          secretAccessKey: `${process.env.AWS_SECRET}`,
        },
        region: `${process.env.AWS_REGION}`,
      }),
    );
  }

  async getProductById(itemId: Number): Promise<any> {
    const params = {
      TableName: this.table,
      Key: {
        id: { N: itemId.toString() },
      },
    };

    const response = await this.dynamodb.send(new GetItemCommand(params));

    return response;
  }
  async createProduct(
    itemId: number,
    itemType: number,
    itemName: string,
    itemPrice: number,
    itemDescription: string,
    itemImgUrl: string,
  ): Promise<any> {
    let input = {
      id: itemId,
      itemType: itemType,
      itemName: itemName,
      itemPrice: itemPrice,
      itemDescription: itemDescription,
      itemImgUrl: itemImgUrl,
    };
    const params = {
      TableName: this.table,
      Item: input,
    };
    const response = await this.dynamodb.send(new PutCommand(params));
    return response;
  }
  async getProducts(): Promise<any> {
    const params = {
      TableName: this.table,
    };
    const scanResult = await this.dynamodb.scan(params);

    return scanResult;
  }

  async deleteProduct(): Promise<any> {
    const params = {
      TableName: this.table,
    };
    const scanResult = await this.dynamodb.scan(params);
    if (scanResult.Items) {
      const deletePromises = scanResult.Items.map(async (item) => {
        const id = Number(item.id.N);

        const deleteParams = {
          TableName: params.TableName,
          Key: {
            id: id,
          },
        };

        const resp = await this.dynamodb.send(new DeleteCommand(deleteParams));
        return resp;
      });

      const res = await Promise.all(deletePromises);
      return res;
    }
  }
}
