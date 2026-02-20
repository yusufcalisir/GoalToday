import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import { STORAGE_KEYS } from '../constants/keys';

const VERSION_KEY = 'db_schema_version';
const CURRENT_VERSION = 1;

interface Migration {
    version: number;
    run: () => Promise<void>;
}

const MIGRATIONS: Migration[] = [
    {
        version: 1,
        run: async () => {
            logger.info('[Migration] Running v1: Initial Schema Check');
            // Example: Ensure habits array exists if it was string
            const habits = await AsyncStorage.getItem(STORAGE_KEYS.HABITS);
            if (habits && !habits.startsWith('[')) {
                // Fix potential corrupted data from very old version
                await AsyncStorage.setItem(STORAGE_KEYS.HABITS, '[]');
            }
        }
    }
    // Add future migrations here
    // { version: 2, run: async () => { ... } }
];

export const MigrationService = {
    migrate: async () => {
        try {
            const storedVersion = await AsyncStorage.getItem(VERSION_KEY);
            let currentVersion = storedVersion ? parseInt(storedVersion) : 0;

            logger.info(`[Migration] Current DB Version: ${currentVersion}. Target: ${CURRENT_VERSION}`);

            if (currentVersion >= CURRENT_VERSION) {
                logger.info('[Migration] No migrations needed.');
                return;
            }

            for (const migration of MIGRATIONS) {
                if (migration.version > currentVersion) {
                    try {
                        await migration.run();
                        currentVersion = migration.version;
                        await AsyncStorage.setItem(VERSION_KEY, currentVersion.toString());
                        logger.info(`[Migration] Successfully migrated to v${currentVersion}`);
                    } catch (err) {
                        logger.error(`[Migration] Failed at v${migration.version}`, err);
                        throw err; // Stop migration on failure
                    }
                }
            }
        } catch (e) {
            logger.error('[Migration] Critical failure', e);
            // In a real app, you might want to show a blocking error screen here
        }
    }
};
