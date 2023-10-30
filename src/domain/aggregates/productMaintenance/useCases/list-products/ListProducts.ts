import UseCaseInterface from '../../../../sharedKernel/usecase/UseCaseInterface';
import IProductRepository from '../../core/ports/IProductRepository';
import { ListProductOutputDTO, QueryParamsDTO } from './ListProductsDTO';
import CreateProductCache from '../create-product-cache/CreateProductCache';
import { CreateProductInputDTO } from '../create-product/CreateProductDTO';
import IProductCacheRepository from '../../core/ports/IProductCacheRepository';

export default class ListProduct implements UseCaseInterface {
  private readonly repository: IProductCacheRepository;
  private readonly mysqlrepository: IProductRepository;

  constructor(
    repository: IProductCacheRepository,
    mysqlrepository: IProductRepository,
  ) {
    this.repository = repository;
    this.mysqlrepository = mysqlrepository;
  }

  async execute(input: QueryParamsDTO): Promise<ListProductOutputDTO> {
    let result;
    try {
      if (input.itemId && input.itemId != 0) {
        result = await this.repository.getProductById(Number(input.itemId));
        if (!result.Item) {
          result = await this.mysqlrepository.getProductById(
            Number(input.itemId),
          );
          if (result) {
            const createUseCase: CreateProductCache = new CreateProductCache(
              this.repository,
            );
            let mount = result[0];
            const input: CreateProductInputDTO = {
              itemId: Number(mount.id),
              itemType: Number(mount.item_type_id),
              itemName: mount.item_name,
              itemImgUrl: mount.item_img_url,
              itemDescription: mount.item_description,
              itemPrice: Number(mount.item_price),
            };

            let saveCacheResponse = await createUseCase.execute(input);
            result = this.normalizeOutput(result, 'relational');
          }
        } else {
          result = this.normalizeOutput(result, 'cache');
        }
      } else {
        result = await this.mysqlrepository.getProducts();
      }

      let output: ListProductOutputDTO = {
        hasError: false,
        message: 'Search finished successfully',
        result: result,
      };
      return output;
    } catch (err) {
      const output: ListProductOutputDTO = {
        hasError: true,
        message: 'Failed to search product',
      };
      return output;
    }
  }

  private normalizeOutput(result: any, source: string): CreateProductInputDTO {
    if (source === 'cache') {
      let normalizeOutput: CreateProductInputDTO = {
        itemId: Number(result.Item.id.N),
        itemDescription: result.Item.itemDescription.S,
        itemName: result.Item.itemName.S,
        itemPrice: Number(result.Item.itemPrice.N),
        itemImgUrl: result.Item.itemImgUrl.S,
        itemType: Number(result.Item.itemType.N),
      };
      return normalizeOutput;
    } else {
      let normalizeOutput: CreateProductInputDTO = {
        itemId: Number(result[0].id),
        itemDescription: result[0].item_description,
        itemName: result[0].item_name,
        itemPrice: Number(result[0].item_price),
        itemImgUrl: result[0].item_img_url,
        itemType: Number(result[0].item_type_id),
      };
      return normalizeOutput;
    }
  }
}
