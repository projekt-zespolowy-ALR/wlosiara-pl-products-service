import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToMany,
	JoinTable,
	Relation,
	OneToMany,
} from "typeorm";
import ProductEntity from "../../products/products_service/ProductEntity.js";
import ProductInCategoryEntity from "../../products/products_service/ProductInCategoryEntity.js";

@Entity({name: "categories"})
class CategoryEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;

	@Column({name: "slug", unique: true, type: "text", nullable: false})
	public readonly slug!: string;

	@Column({name: "name", type: "text", nullable: false})
	public readonly name!: string;

	@OneToMany(() => ProductInCategoryEntity, (productInCategory) => productInCategory.category)
	public readonly inProducts!: readonly Relation<ProductInCategoryEntity>[];
}

export default CategoryEntity;
