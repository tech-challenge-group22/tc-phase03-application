export default interface IProductCacheRepository {
  createProduct(
    itemId: number,
    itemType: number,
    itemName: string,
    itemPrice: number,
    itemDescription: string,
    itemImgUrl: string,
  ): Promise<any>;
  getProducts(): Promise<any>;
  getProductById(itemId: number): Promise<any>;
  deleteProduct(): Promise<any>;
}
