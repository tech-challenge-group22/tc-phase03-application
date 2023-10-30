import UseCaseInterface from '../../../../sharedKernel/usecase/UseCaseInterface';
import IProductRepository from '../../core/ports/IProductRepository';
import { ListProductOutputDTO } from '../list-products/ListProductsDTO';
import DeleteListCache from '../delete-list-cache/DeleteListCache';
import CreateProductCache from '../create-product-cache/CreateProductCache';
import { CreateProductInputDTO } from '../create-product/CreateProductDTO';
import IProductCacheRepository from '../../core/ports/IProductCacheRepository';

export default class RefreshListCache implements UseCaseInterface {
  private readonly repository: IProductCacheRepository;
  private readonly mysqlrepository: IProductRepository;

  constructor(
    repository: IProductCacheRepository,
    mysqlrepository: IProductRepository,
  ) {
    this.repository = repository;
    this.mysqlrepository = mysqlrepository;
  }

  async execute(): Promise<ListProductOutputDTO> {
    let result;
    try {
      result = await this.mysqlrepository.getProducts();

      if (result.length >= 0) {
        const deleteCacheUseCase: DeleteListCache = new DeleteListCache(
          this.repository,
        );
        const resultDeleteCache = await deleteCacheUseCase.execute();

        if (resultDeleteCache.hasError !== true) {
          const createProductCache: CreateProductCache = new CreateProductCache(
            this.repository,
          );

          const insertItens = result.map(async (item: any) => {
            const retorno = createProductCache.execute(
              this.normalizeOutput(item),
            );
            return retorno;
          });

          result = await Promise.all(insertItens);
        }
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

  private normalizeOutput(result: any): CreateProductInputDTO {
    let normalizeOutput: CreateProductInputDTO = {
      itemId: Number(result.id),
      itemDescription: result.item_description,
      itemName: result.item_name,
      itemPrice: Number(result.item_price),
      itemImgUrl: result.item_img_url,
      itemType: Number(result.item_type_id),
    };
    return normalizeOutput;
  }
}
