import {Test} from "@nestjs/testing";
import {describe, test, expect, beforeEach, afterEach, beforeAll} from "@jest/globals";
import type {NestFastifyApplication} from "@nestjs/platform-fastify";
import BrandsModule from "../../../src/features/brands/brands_module/BrandsModule.js";
import * as Testcontainers from "testcontainers";
import AppOrmModule from "../../../src/app_orm/AppOrmModule.js";
import AppConfig from "../../../src/app_config/AppConfig.js";
import {TypedConfigModule} from "nest-typed-config";
import * as Fs from "fs/promises";

import testsConfig from "../../app_config/testsConfig.js";
import generatePostgresqlPassword from "../../utils/generatePostgresqlPassword.js";
import createTestingApp from "../../utils/createTestingApp.js";

describe("BrandsModule", () => {
	let postgresqlContainer: Testcontainers.StartedPostgreSqlContainer;
	let app: NestFastifyApplication;
	let postgresqlInitializationSqlScript: string;

	beforeAll(async () => {
		postgresqlInitializationSqlScript = await Fs.readFile(
			testsConfig.TESTS_POSTGRESQL_INITIALIZATION_SQL_SCRIPT_PATH,
			"utf-8"
		);
	});

	beforeEach(async () => {
		const postgresqlContainerPassword = generatePostgresqlPassword();

		postgresqlContainer = await new Testcontainers.PostgreSqlContainer(
			testsConfig.TESTS_POSTGRESQL_CONTAINER_IMAGE_NAME
		)
			.withPassword(postgresqlContainerPassword)
			.withEnvironment({"PGPASSWORD": postgresqlContainerPassword})
			.withDatabase(testsConfig.TESTS_POSTGRESQL_CONTAINER_DATABASE_NAME)
			.start();

		await postgresqlContainer.exec([
			"psql",
			`--host=localhost`,
			`--port=5432`,
			`--username=${postgresqlContainer.getUsername()}`,
			`--dbname=${postgresqlContainer.getDatabase()}`,
			`--no-password`,
			`--command`,
			`${postgresqlInitializationSqlScript}`,
		]);

		const AppConfigModule = TypedConfigModule.forRoot({
			schema: AppConfig,
			load: () => ({
				POSTGRES_HOST: postgresqlContainer.getHost(),
				POSTGRES_PORT: postgresqlContainer.getPort(),
				POSTGRES_USERNAME: postgresqlContainer.getUsername(),
				POSTGRES_PASSWORD: postgresqlContainer.getPassword(),
				POSTGRES_DATABASE: postgresqlContainer.getDatabase(),
			}),
		});
		const appModule = await Test.createTestingModule({
			imports: [BrandsModule, AppOrmModule, AppConfigModule],
		}).compile();

		app = await createTestingApp(appModule);
	}, testsConfig.TESTS_INTEGRATION_TEST_BEFORE_EACH_TIMEOUT * 1000);

	afterEach(async () => {
		await Promise.all([postgresqlContainer.stop(), app.close()]);
	});
	describe("v1", () => {
		describe("Empty database", () => {
			test("GET /brands", async () => {
				const response = await app.inject({
					method: "GET",
					url: "/v1/brands",
				});
				expect(response.statusCode).toBe(200);
				expect(response.json()).toEqual({
					items: [],
					meta: {skip: 0, take: 10, totalItemsCount: 0, pageItemsCount: 0},
				});
			});
			test("GET /brands/:id", async () => {
				const response = await app.inject({
					method: "GET",
					url: "/v1/brands/1",
				});
				expect(response.statusCode).toBe(400);
			});
			test("POST /brands", async () => {
				const addBrandRequestBody = {
					name: "test2",
					slug: "test2",
				} as const;
				const response = await app.inject({
					method: "POST",
					url: "/v1/brands",
					payload: addBrandRequestBody,
				});
				expect(response.statusCode).toBe(201);
			});

			test("GET /brands/:id with invalid UUID4", async () => {
				const response = await app.inject({
					method: "GET",
					url: "/v1/brands/1",
				});
				expect(response.statusCode).toBe(400);
			});
			test("GET /brands/:id with valid UUID4", async () => {
				const response = await app.inject({
					method: "GET",
					url: "/v1/brands/e8a7b311-367b-4105-a75d-929b930faafa",
				});
				expect(response.statusCode).toBe(404);
			});
		});

		describe("Database with one brand", () => {
			test("GET /brands", async () => {
				const addBrandRequestBody = {
					name: "test2",
					slug: "test2",
				} as const;
				await app.inject({
					method: "POST",
					url: "/v1/brands",
					payload: addBrandRequestBody,
				});
				const response = await app.inject({
					method: "GET",
					url: "/v1/brands",
				});
				expect(response.statusCode).toBe(200);
				const responseJson = response.json();
				expect(responseJson).toHaveProperty("items");
				expect(responseJson).toHaveProperty("meta");
				expect(responseJson.meta).toEqual({
					skip: 0,
					take: 10,
					totalItemsCount: 1,
					pageItemsCount: 1,
				});
				expect(responseJson.items).toHaveLength(1);
				expect(responseJson.items[0]).toHaveProperty("id");
				expect(typeof responseJson.items[0].id).toBe("string");
				expect(responseJson.items[0].id).not.toHaveLength(0);
				expect((({id, ...rest}) => rest)(responseJson.items[0])).toEqual(addBrandRequestBody);
			});
		});
	});
});