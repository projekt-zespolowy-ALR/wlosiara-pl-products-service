import BrandEntity from "../../brands/brands_service/BrandEntity.js";

import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	type Relation,
	OneToOne,
} from "typeorm";
import UserFavoriteProductEntity from "../../user_favorite_products/user_favorite_products_service/UserFavoriteProductEntity.js";
import {OfferEntity} from "../../offers/OfferEntity.js";
import {IngredientListEntity} from "../ingredients_of_product/ingredients_of_product_service/IngredientListEntity.js";
import {ProductInCategoryEntity} from "../categories_of_product/categories_of_product_service/ProductInCategoryEntity.js";

@Entity({name: "products"})
export default class ProductEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;
	@Column({name: "slug", type: "text"})
	public readonly slug!: string;

	@Column({name: "mass_kilograms", type: "double precision", nullable: true})
	public readonly massKilograms!: number | null;

	@Column({name: "volume_liters", type: "double precision", nullable: true})
	public readonly volumeLiters!: number | null;

	@Column({name: "name", type: "text", nullable: true})
	public readonly name!: string | null;

	@ManyToOne(() => BrandEntity, (brand) => brand.products)
	@JoinColumn({referencedColumnName: "id", name: "brand_id"})
	public readonly brand!: Relation<BrandEntity> | null;

	@Column({name: "brand_id", type: "uuid", nullable: true})
	public readonly brandId!: string | null;

	@OneToMany(
		() => UserFavoriteProductEntity,
		(userFavoriteProduct) => userFavoriteProduct.product,
		{
			onDelete: "SET NULL",
		}
	)
	public readonly userFavoriteProducts!: Relation<UserFavoriteProductEntity>[];

	@OneToMany(() => OfferEntity, (offer) => offer.product)
	public readonly offers!: Relation<OfferEntity>[];

	@OneToOne(() => IngredientListEntity, (ingredientList) => ingredientList.product, {
		onDelete: "SET NULL",
	})
	public readonly ingredientList!: Relation<IngredientListEntity> | null;

	@OneToMany(() => ProductInCategoryEntity, (productInCategory) => productInCategory.product, {
		onDelete: "SET NULL",
	})
	public readonly productInCategories!: Relation<ProductInCategoryEntity>[];
}
