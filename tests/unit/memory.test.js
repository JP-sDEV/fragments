// tests/unit/memory.test.js

const {
    writeFragment,
    readFragment,
    writeFragmentData,
    readFragmentData,
    listFragments,
    deleteFragment,
} = require('../../src/model/data/memory/index');

const { Fragment } = require('../../src/model/fragment');

describe('memory-data', () => {
    let testFragment;

    beforeEach(() => {
        testFragment = new Fragment({
            id: '123', // Required: secondary
            ownerId: '123-abc', // Required: primary id
            created: '2024-06-05T12:00:00Z', // Optional: creation date
            updated: '2024-06-05T12:00:00Z', // Optional: update date
            type: 'text/html', // Required: type
            size: 1024, // Optional: size
        });
    });
    describe('Fragment metadata', () => {
        // writeFragment
        test('writeFragment() returns nothing when successful', async () => {
            await expect(writeFragment(testFragment)).resolves.toBe();
        });
        test('writeFragment() expects primaryKey string', async () => {
            testFragment.ownerId = 123; // change primaryKey to non-string

            let errorCaught;
            try {
                await writeFragment(testFragment);
            } catch (error) {
                // if cannot write, flag error
                errorCaught = error;
            }

            expect(errorCaught).not.toBe(undefined);
        });
        test('writeFragment() expects primaryKey string', async () => {
            testFragment.id = 123; // Change secondaryKey to non-string

            let errorCaught;
            try {
                await writeFragment(testFragment);
            } catch (error) {
                // if cannot write, flag error
                errorCaught = error;
            }

            expect(errorCaught).not.toBe(undefined);
        });

        // readFragment
        let testFragment;
        // Each test will get its own, empty database instance
        beforeEach(() => {
            testFragment = new Fragment({
                id: '123', // Required: secondary
                ownerId: '123-abc', // Required: primary id
                created: '2024-06-05T12:00:00Z', // Optional: creation date
                updated: '2024-06-05T12:00:00Z', // Optional: update date
                type: 'text/html', // Required: type
                size: 1024, // Optional: size
            });
        });
        test('readFragment returns respective fragment metadata of existing fragment', async () => {
            await writeFragment(testFragment);
            const result = await readFragment(testFragment.ownerId, testFragment.id);
            expect(result).toEqual(testFragment);
        });

        test('readFragment expects primaryKey string', async () => {
            const invalidPrimaryKey = undefined;

            expect(
                async () => await readFragment(invalidPrimaryKey, testFragment.id)
            ).rejects.toThrow();
        });

        test('readFragment expects primaryKey string', async () => {
            const invalidSecondaryKey = undefined;

            expect(
                async () => await readFragment(invalidSecondaryKey, testFragment.id)
            ).rejects.toThrow();
        });

        test('readFragment expects primaryKey string', async () => {
            testFragment.ownerId = 123; // change primaryKey to non-string

            expect(
                async () => await readFragment(testFragment.ownerId, testFragment.id)
            ).rejects.toThrow();
        });

        test('readFragment expects primaryKey string', async () => {
            testFragment.id = 123; // change secondaryKey to non-string

            expect(
                async () => await readFragment(testFragment.ownerId, testFragment.id)
            ).rejects.toThrow();
        });
    });

    describe('Fragment buffer data', () => {
        let testBuffer;
        beforeEach(() => {
            testBuffer = Buffer.from('hello-world', 'utf-8');
        });

        test('readFragment with non-existant secondaryKey returns nothing', async () => {
            testFragment.id = 'fake-key';
            const result = await readFragment(testFragment.ownerId, testFragment.id);
            expect(result).toBe(undefined);
        });

        // writeFragmentData
        test('writeFragmentData returns nothing when successful', async () => {
            const result = await writeFragmentData(
                testFragment.ownerId,
                testFragment.id,
                testBuffer
            );

            expect(result).toBe(undefined);
        });
        test('writeFragmentData expects primaryKey string', async () => {
            testFragment.ownerId = 123; // change primaryKey to non-string

            expect(
                async () =>
                    await writeFragmentData(testFragment.ownerId, testFragment.id, testBuffer)
            ).rejects.toThrow();
        });
        test('writeFragmentData expects primaryKey string', async () => {
            testFragment.id = 123; // change secondaryKey to non-string

            expect(
                async () =>
                    await writeFragmentData(testFragment.ownerId, testFragment.id, testBuffer)
            ).rejects.toThrow();
        });
        // readFragmentData
        test('readFragmentData returns respective fragment buffer data of fragment', async () => {
            await writeFragmentData(testFragment.ownerId, testFragment.id, testBuffer);

            const result = await readFragmentData(testFragment.ownerId, testFragment.id);
            expect(result).toEqual(testBuffer);
        });
        test('readFragmentData expects primaryKey string', async () => {
            await writeFragmentData(testFragment.ownerId, testFragment.id, testBuffer);

            testFragment.ownerId = 123; // change primaryKey to non-string
            expect(
                async () => await readFragmentData(testFragment.ownerId, testFragment.id)
            ).rejects.toThrow();
        });
        test('readFragmentData throws an Error if secondaryKey is not provided', async () => {
            await writeFragmentData(testFragment.ownerId, testFragment.id, testBuffer);

            testFragment.id = 123; // change secondaryKey to non-string
            expect(
                async () => await readFragmentData(testFragment.ownerId, testFragment.id)
            ).rejects.toThrow();
        });
        // listFragments
        test('listFragments() returns list of fragment ids that belong to ownerId (i.e. primaryKey)', async () => {
            // Create 2 additional fragments each with unique secondaryKeys
            const testFragment2 = new Fragment({
                id: 'fragment2', // Required: secondary
                ownerId: '123-abc', // Required: primary id
                created: '2024-06-05T12:00:00Z', // Optional: creation date
                updated: '2024-06-05T12:00:00Z', // Optional: update date
                type: 'text/html', // Required: type
                size: 1024, // Optional: size
            });

            const testFragment3 = new Fragment({
                id: 'fragment3', // Required: secondary
                ownerId: '123-abc', // Required: primary id
                created: '2024-06-05T12:00:00Z', // Optional: creation date
                updated: '2024-06-05T12:00:00Z', // Optional: update date
                type: 'text/html', // Required: type
                size: 1024, // Optional: size
            });

            await writeFragment(testFragment);
            await writeFragmentData(testFragment.ownerId, testFragment.id, testBuffer);

            await writeFragment(testFragment2);
            await writeFragmentData(testFragment2.ownerId, testFragment2.id, testBuffer);

            await writeFragment(testFragment3);
            await writeFragmentData(testFragment3.ownerId, testFragment3.id, testBuffer);

            const result = await listFragments(testFragment.ownerId, false);
            expect(result).toEqual([testFragment.id, testFragment2.id, testFragment3.id]);
        });

        test('listFragments() returns list of fragment with data that belong to ownerId (i.e. primaryKey)', async () => {
            // Create 2 additional fragments each with unique secondaryKeys
            const testFragment2 = new Fragment({
                id: 'fragment2', // Required: secondary
                ownerId: '123-abc', // Required: primary id
                created: '2024-06-05T12:00:00Z', // Optional: creation date
                updated: '2024-06-05T12:00:00Z', // Optional: update date
                type: 'text/html', // Required: type
                size: 1024, // Optional: size
            });

            const testFragment3 = new Fragment({
                id: 'fragment3', // Required: secondary
                ownerId: '123-abc', // Required: primary id
                created: '2024-06-05T12:00:00Z', // Optional: creation date
                updated: '2024-06-05T12:00:00Z', // Optional: update date
                type: 'text/html', // Required: type
                size: 1024, // Optional: size
            });

            await writeFragment(testFragment);
            await writeFragmentData(testFragment.ownerId, testFragment.id, testBuffer);

            await writeFragment(testFragment2);
            await writeFragmentData(testFragment2.ownerId, testFragment2.id, testBuffer);

            await writeFragment(testFragment3);
            await writeFragmentData(testFragment3.ownerId, testFragment3.id, testBuffer);

            const result = await listFragments(testFragment.ownerId, true);
            expect(result).toEqual([testFragment, testFragment2, testFragment3]);
        });

        test('listFragments() expects primaryKey string', () => {
            expect(async () => await listFragments()).rejects.toThrow();
            expect(async () => await listFragments(1)).rejects.toThrow();
        });

        // deleteFragment
        test('deleteFragment() delete user fragment along with the respective data', async () => {
            await writeFragment(testFragment);
            await writeFragmentData(testFragment.ownerId, testFragment.id, testBuffer);
            await deleteFragment(testFragment.ownerId, testFragment.id);

            const fragment = await readFragment(testFragment.ownerId, testFragment.id);
            const fragmentData = await readFragmentData(testFragment.ownerId, testFragment.id);

            expect(fragment).toBe(undefined);
            expect(fragmentData).toBe(undefined);
        });

        test('del() expects string keys', () => {
            expect(async () => await deleteFragment()).rejects.toThrow();
            expect(async () => await deleteFragment(1)).rejects.toThrow();
            expect(async () => await deleteFragment(1, 1)).rejects.toThrow();
        });
    });
});
