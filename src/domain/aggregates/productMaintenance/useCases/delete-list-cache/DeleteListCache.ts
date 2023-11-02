import UseCaseInterface from '../../../../sharedKernel/usecase/UseCaseInterface';
import IProductCacheRepository from '../../core/ports/IProductCacheRepository';
import { ListProductOutputDTO } from '../list-products/ListProductsDTO';

export default class DeleteListCache implements UseCaseInterface {
  private readonly repository: IProductCacheRepository;

  constructor(repository: IProductCacheRepository) {
    this.repository = repository;
  }

  async execute(): Promise<ListProductOutputDTO> {
    let result;
    try {
      result = await this.repository.deleteProduct();

      let output: ListProductOutputDTO = {
        hasError: false,
        message: 'All Itens deleted successfully from cache',
        result: result,
      };
      return output;
    } catch (err) {
      const output: ListProductOutputDTO = {
        hasError: true,
        message: 'Failed to delete products',
      };
      return output;
    }
  }
}
