import UseCaseInterface from '../../../../sharedKernel/usecase/UseCaseInterface';
import IProductCacheRepository from '../../core/ports/IProductCacheRepository';
import {
  CreateProductInputDTO,
  CreateProductOutputDTO,
} from '../create-product/CreateProductDTO';

export default class CreateProductCache implements UseCaseInterface {
  private readonly repository: IProductCacheRepository;

  constructor(repository: IProductCacheRepository) {
    this.repository = repository;
  }

  async execute(input: CreateProductInputDTO): Promise<CreateProductOutputDTO> {
    try {
      const result = await this.repository.createProduct(
        input.itemId,
        input.itemType,
        input.itemName,
        input.itemPrice,
        input.itemDescription,
        input.itemImgUrl,
      );
      let output: CreateProductOutputDTO = {
        hasError: false,
        message: 'Item inserted successfully on cache',
        result: result,
      };

      return output;
    } catch (error: any) {
      const output: CreateProductOutputDTO = {
        hasError: true,
        message: 'Failed to create product on cache',
        array_errors: error,
      };
      return output;
    }
  }
}
