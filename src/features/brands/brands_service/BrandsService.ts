import {Injectable} from "@nestjs/common";
import {EntityNotFoundError, Repository} from "typeorm";
import BrandEntity from "./BrandEntity.js";
import {InjectRepository} from "@nestjs/typeorm";
import type Page from "../../../paging/Page.js";
import type PagingOptions from "../../../paging/PagingOptions.js";
import paginatedFindAndCount from "../../../paging/paginatedFindAndCount.js";
import type Brand from "../brands_controller/Brand.js";
import deentityifyBrandEntity from "./deentityifyBrandEntity.js";
import type CreateBrandPayload from "./CreateBrandPayload.js";
import BrandsServiceBrandWithGivenIdNotFoundError from "./BrandsServiceBrandWithGivenIdNotFoundError.js";
@Injectable()
export default class BrandsService {
	private readonly brandsRepository: Repository<BrandEntity>;
	public constructor(@InjectRepository(BrandEntity) brandsRepository: Repository<BrandEntity>) {
		this.brandsRepository = brandsRepository;
	}
	public async getBrands(pagingOptions: PagingOptions): Promise<Page<Brand>> {
		return (await paginatedFindAndCount(this.brandsRepository, pagingOptions)).map(
			deentityifyBrandEntity
		);
	}
	public async getBrandById(id: string): Promise<Brand> {
		try {
			return deentityifyBrandEntity(await this.brandsRepository.findOneByOrFail({id}));
		} catch (error) {
			if (error instanceof EntityNotFoundError) {
				throw new BrandsServiceBrandWithGivenIdNotFoundError(id);
			}
			throw error;
		}
	}
	public async createBrand(createBrandPayload: CreateBrandPayload): Promise<Brand> {
		return deentityifyBrandEntity(await this.brandsRepository.save(createBrandPayload));
	}

	public async deleteBrandById(id: string): Promise<boolean> {
		try {
			await this.brandsRepository.delete({id});
			return true;
		} catch (error) {
			if (error instanceof EntityNotFoundError) {
				throw new BrandsServiceBrandWithGivenIdNotFoundError(id);
			}
			throw error;
		}
	}
}
