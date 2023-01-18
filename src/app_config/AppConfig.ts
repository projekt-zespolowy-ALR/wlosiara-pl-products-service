import {IsInt, IsString, Min, Max} from "class-validator";

class AppConfig {
	@IsInt()
	@Min(1)
	@Max(65535)
	public readonly PORT: number = 3000;

	@IsString()
	public readonly POSTGRES_HOST: string = "localhost";

	@IsInt()
	@Min(1)
	@Max(65535)
	public readonly POSTGRES_PORT: number = 5432;

	@IsString()
	public readonly POSTGRES_USERNAME: string = "postgres";

	@IsString()
	public readonly POSTGRES_PASSWORD: string = "postgres";

	@IsString()
	public readonly POSTGRES_DATABASE: string = "postgres";
}

export default AppConfig;