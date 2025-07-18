import { expect, test, beforeEach, describe } from "@jest/globals";
import { ChromaClient } from "../src";
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

describe("collection operations", () => {
  // connects to the unauthenticated chroma instance started in
  // the global jest setup file.
  const client = new ChromaClient({
    path: process.env.DEFAULT_CHROMA_INSTANCE_URL,
  });

  beforeEach(async () => {
    await client.reset();
  });

  test("it should list collections", async () => {
    let collections = await client.listCollections();
    expect(Array.isArray(collections)).toBe(true);
    expect(collections).toHaveLength(0);
    await client.createCollection({ name: "test" });
    collections = await client.listCollections();
    expect(collections).toHaveLength(1);
  });

  test("it should create a collection", async () => {
    const collection = await client.createCollection({ name: "test" });
    expect(collection).toBeDefined();
    expect(collection).toHaveProperty("name");
    expect(collection).toHaveProperty("id");
    expect(collection.name).toBe("test");
    let collections = await client.listCollections();
    expect(collections).toHaveLength(1);

    const [returnedCollection] = collections;

    expect(returnedCollection.name).toEqual("test");

    expect([{ name: "test2", metadata: null }]).not.toEqual(
      expect.arrayContaining(collections),
    );

    await client.reset();
    const collection2 = await client.createCollection({
      name: "test2",
      metadata: { test: "test" },
    });
    expect(collection2).toBeDefined();
    expect(collection2).toHaveProperty("name");
    expect(collection2).toHaveProperty("id");
    expect(collection2.name).toBe("test2");
    expect(collection2).toHaveProperty("metadata");
    expect(collection2.metadata).toHaveProperty("test");
    expect(collection2.metadata).toEqual({ test: "test" });
    const collections2 = await client.listCollections();
    expect(collections2).toHaveLength(1);
    const [returnedCollection2] = collections2;
    expect(returnedCollection2.name).toEqual("test2");
  });

  test("it should get a collection", async () => {
    const collection = await client.createCollection({ name: "test" });
    const collection2 = await client.getCollection({
      name: "test",
      embeddingFunction: new DefaultEmbeddingFunction(),
    });
    expect(collection).toBeDefined();
    expect(collection2).toBeDefined();
    expect(collection).toHaveProperty("name");
    expect(collection2).toHaveProperty("name");
    expect(collection.name).toBe(collection2.name);
  });

  test("it should get or create a collection", async () => {
    await client.createCollection({ name: "test" });
    const collection2 = await client.getOrCreateCollection({ name: "test" });
    expect(collection2).toBeDefined();
    expect(collection2).toHaveProperty("name");
    expect(collection2.name).toBe("test");
    const collection3 = await client.getOrCreateCollection({ name: "test3" });
    expect(collection3).toBeDefined();
    expect(collection3).toHaveProperty("name");
    expect(collection3.name).toBe("test3");
  });

  test("it should delete a collection", async () => {
    const collection = await client.createCollection({ name: "test" });
    let collections = await client.listCollections();
    expect(collections.length).toBe(1);
    await client.deleteCollection({ name: "test" });
    collections = await client.listCollections();
    expect(collections.length).toBe(0);
  });

  // TODO: I want to test this, but I am not sure how to
  // test('custom index params', async () => {
  //     throw new Error('not implemented')
  //     await client.reset()
  //     const collection = await client.createCollection('test', {"hnsw:space": "cosine"})
  // })
});
