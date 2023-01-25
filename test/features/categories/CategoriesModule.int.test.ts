import {describe, test, expect, beforeEach, afterEach} from "@jest/globals";
import type AddCategoryRequestBody from "../../../src/features/categories/categories_controller/AddCategoryRequestBody.js";
import testsConfig from "../../config/testsConfig.js";
import AppTestingEnvironment from "../../utils/testing_environment/AppTestingEnvironment.js";
import EmptyTestingEnvironment from "../../utils/testing_environment/EmptyTestingEnvironment.js";
import TestingEnvironment from "../../utils/testing_environment/TestingEnvironment.js";

let testingEnvironment: TestingEnvironment = new EmptyTestingEnvironment();

beforeEach(async () => {
	testingEnvironment = new AppTestingEnvironment();
	await testingEnvironment.start();
}, testsConfig.TESTS_INTEGRATION_TEST_BEFORE_EACH_TIMEOUT * 1000);

afterEach(async () => {
	await testingEnvironment.stop();
});

describe("CategoriesModule", () => {
	describe("v1", () => {
		describe("Empty database", () => {
			test("Get all categories", async () => {
				const response = await testingEnvironment.app.inject({
					method: "GET",
					url: "/v1/categories",
				});
				expect(response.statusCode).toBe(200);
				expect(response.json()).toEqual({
					data: [],
					meta: {skip: 0, take: 10, totalItemsCount: 0, pageItemsCount: 0},
				});
			});
			test("Add one category", async () => {
				const someCategoryRequestBody: AddCategoryRequestBody = {
					name: "Some category",
					slug: "some-category",
				} as const;
				const response = await testingEnvironment.app.inject({
					method: "POST",
					url: "/v1/categories",
					headers: {
						"content-type": "application/json",
					},
					payload: someCategoryRequestBody,
				});
				expect(response.statusCode).toBe(201);
				expect(response.json()).toEqual({
					id: expect.stringMatching(
						/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
					),
					name: "Some category",
					slug: "some-category",
				});
			});
			test("Add one category and check if it is in the database", async () => {
				const someCategoryRequestBody: AddCategoryRequestBody = {
					name: "Some category",
					slug: "some-category",
				} as const;
				await testingEnvironment.app.inject({
					method: "POST",
					url: "/v1/categories",
					headers: {
						"content-type": "application/json",
					},
					payload: someCategoryRequestBody,
				});

				const response2 = await testingEnvironment.app.inject({
					method: "GET",
					url: "/v1/categories",
				});
				expect(response2.statusCode).toBe(200);
				expect(response2.json()).toEqual({
					data: [
						{
							id: expect.stringMatching(
								/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
							),
							name: "Some category",
							slug: "some-category",
						},
					],
					meta: {skip: 0, take: 10, totalItemsCount: 1, pageItemsCount: 1},
				});
			});
			test("Get non existing category by id should return 404", async () => {
				const response = await testingEnvironment.app.inject({
					method: "GET",
					url: "/v1/categories/af7c1fe6-d669-414e-b066-e9733f0de7a8",
				});
				expect(response.statusCode).toBe(404);
			});
			test("Get non existing category by slug should return 404", async () => {
				const response = await testingEnvironment.app.inject({
					method: "GET",
					url: "/v1/category-by-slug?slug=some-category",
				});
				expect(response.statusCode).toBe(404);
			});
			test("Delete added category", async () => {
				const someCategoryRequestBody: AddCategoryRequestBody = {
					name: "Some category",
					slug: "some-category",
				} as const;
				const response = await testingEnvironment.app.inject({
					method: "POST",
					url: "/v1/categories",
					headers: {
						"content-type": "application/json",
					},
					payload: someCategoryRequestBody,
				});
				const categoryId = response.json().id;

				const response2 = await testingEnvironment.app.inject({
					method: "DELETE",
					url: `/v1/categories/${categoryId}`,
				});
				expect(response2.statusCode).toBe(204);
			});
			test("Update added category", async () => {
				const someCategoryRequestBody: AddCategoryRequestBody = {
					name: "Some category",
					slug: "some-category",
				} as const;
				const response = await testingEnvironment.app.inject({
					method: "POST",
					url: "/v1/categories",
					headers: {
						"content-type": "application/json",
					},
					payload: someCategoryRequestBody,
				});
				const categoryId = response.json().id;

				const newCategoryRequestBody: AddCategoryRequestBody = {
					name: "Some category updated",
					slug: "some-category-updated",
				} as const;
				const response2 = await testingEnvironment.app.inject({
					method: "PUT",
					url: `/v1/categories/${categoryId}`,
					headers: {
						"content-type": "application/json",
					},
					payload: newCategoryRequestBody,
				});
				expect(response2.statusCode).toBe(200);
				expect(response2.json()).toEqual({
					id: categoryId,
					name: "Some category updated",
					slug: "some-category-updated",
				});
			});
			test("Get added category by id", async () => {
				const someCategoryRequestBody: AddCategoryRequestBody = {
					name: "Some category",
					slug: "some-category",
				} as const;
				const response = await testingEnvironment.app.inject({
					method: "POST",
					url: "/v1/categories",
					headers: {
						"content-type": "application/json",
					},
					payload: someCategoryRequestBody,
				});
				const categoryId = response.json().id;

				const response2 = await testingEnvironment.app.inject({
					method: "GET",
					url: `/v1/categories/${categoryId}`,
				});
				expect(response2.statusCode).toBe(200);
				expect(response2.json()).toEqual({
					id: categoryId,
					name: "Some category",
					slug: "some-category",
				});
			});
			test("Get added category by slug", async () => {
				const someCategoryRequestBody: AddCategoryRequestBody = {
					name: "Some category",
					slug: "some-category",
				} as const;
				const response = await testingEnvironment.app.inject({
					method: "POST",
					url: "/v1/categories",
					headers: {
						"content-type": "application/json",
					},
					payload: someCategoryRequestBody,
				});
				const categoryId = response.json().id;

				const response2 = await testingEnvironment.app.inject({
					method: "GET",
					url: `/v1/category-by-slug?slug=some-category`,
				});
				expect(response2.statusCode).toBe(200);
				expect(response2.json()).toEqual({
					id: categoryId,
					name: "Some category",
					slug: "some-category",
				});
			});
		});
	});
});