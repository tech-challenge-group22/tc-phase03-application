const util = require('util');
import mysql from 'mysql';
import IProductRepository from '../core/ports/IProductRepository';
import Product from '../core/entities/Product';

export default class MySqlProductRepository implements IProductRepository {
  private client: any;
  private connection: any;

  constructor() {
    this.client = mysql;

    this.connection = this.client.createConnection({
      host: 'aws-rds-postech.c0c2tpajfekp.us-east-1.rds.amazonaws.com',
      user: 'admin',
      password: '9eXkA5g02X',
      database: 'DeliverySystem',
    });

    this.connection.connect();
  }

  async getProducts(): Promise<any> {
    const queryPromise = util
      .promisify(this.connection.query)
      .bind(this.connection);
    try {
      // await this.connection.connect();
      const query = 'SELECT * FROM itens';
      // Executar a consulta SQL
      const results = await queryPromise(query);

      return results;
    } catch (err) {
      console.error('Erro to connect with the database:', err);
    }
  }

  async getProductById(itemId: number): Promise<any> {
    // const connection = this.startConnection();

    const queryPromise = util
      .promisify(this.connection.query)
      .bind(this.connection);
    try {
      //  await this.connection.connect();
      const query = 'SELECT * FROM itens where id = ? ';
      const queryParams = [itemId];

      // Executar a consulta SQL

      const results = await queryPromise(query, queryParams);

      return results;
    } catch (err) {
      console.error('Erro to connect with the database:', err);
    }
  }
  async getProductByCategory(itemId: number): Promise<any> {
    const queryPromise = util
      .promisify(this.connection.query)
      .bind(this.connection);
    try {
      // await this.connection.connect();
      const query = 'SELECT * FROM itens where item_type_id = ? ';
      const queryParams = [itemId];

      // Executar a consulta SQL

      const results = await queryPromise(query, queryParams);

      return results;
    } catch (err) {
      console.error('Erro to connect with the database:', err);
    }
  }
  async createProduct(
    itemId: number,
    itemType: number,
    itemName: string,
    itemPrice: number,
    itemDescription: string,
    itemImgUrl: string,
  ): Promise<any> {
    let product: Product = new Product(
      itemName,
      itemPrice,
      itemType,
      itemDescription,
      itemImgUrl,
    );
    const queryPromise = util
      .promisify(this.connection.query)
      .bind(this.connection);
    try {
      const query =
        'INSERT INTO itens (item_type_id,item_name,item_price,item_description,item_img_url) VALUES (?, ?, ?, ?, ?) ';
      const queryParams = [
        itemType,
        itemName,
        itemPrice,
        itemDescription,
        itemImgUrl,
      ];

      // Executar a consulta SQL
      const results = await queryPromise(query, queryParams);

      return results;
    } catch (err) {
      console.error('Erro to connect with the database:', err);
    }
  }

  async updateProduct(
    itemId: number,
    itemName: string,
    itemPrice: number,
    itemType: number,
    itemDescription: string,
    itemImgUrl: string,
  ): Promise<any> {
    let product: Product = new Product(
      itemName,
      itemPrice,
      itemType,
      itemDescription,
      itemImgUrl,
      itemId,
    );
    const queryPromise = util
      .promisify(this.connection.query)
      .bind(this.connection);
    try {
      const query =
        'UPDATE itens SET item_type_id = ?,item_name = ?,item_price = ? , item_description = ?, item_img_url = ? WHERE id = ?';
      const queryParams = [
        itemType,
        itemName,
        itemPrice,
        itemDescription,
        itemImgUrl,
        itemId,
      ];

      return await this.commitDB(query, queryParams, itemId);
    } catch (err) {
      console.error('Erro to connect with the database:', err);
    }
  }

  async deleteProduct(id: number): Promise<any> {
    if (!id) {
      throw new Error('Missing parameters. Please provide product id');
    }
    try {
      const queryPromise = util
        .promisify(this.connection.query)
        .bind(this.connection);
      const query = `DELETE FROM itens WHERE id = ?`;
      const queryParams = [id];
      const result = await queryPromise(query, queryParams);
      return result;
    } catch (error) {
      console.log('ERROR delete product id', error);
    }
  }

  private async commitDB(query: string, values: any[], id?: number) {
    return new Promise((resolve, reject) => {
      this.connection.query(query, values, (error: any, results: unknown) => {
        if (error) {
          reject(error);
        }
        if (id) {
          results = this.getProductById(id);
        }
        resolve(results);
      });
    });
  }
}
