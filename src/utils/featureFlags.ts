import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

export type FeatureFlag = 
  | 'ENABLE_NEW_HOME_UI' 
  | 'ENABLE_CLOUD_SYNC'
  | 'ENABLE_ADVANCED_ANALYTICS';

interface FlagConfig {
    [key: string]: boolean;
}

const DEFAULT_FLAGS: FlagConfig = {
    ENABLE_NEW_HOME_UI: false,
    ENABLE_CLOUD_SYNC: true,
    ENABLE_ADVANCED_ANALYTICS: true,
};

const FLAGS_KEY = 'security_flags_v1';

class FeatureFlagService {
    private flags: FlagConfig = { ...DEFAULT_FLAGS };

    async init() {
        try {
            const stored = await AsyncStorage.getItem(FLAGS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.flags = { ...DEFAULT_FLAGS, ...parsed };
            }
            logger.info('[FeatureFlags] Initialized', this.flags);
        } catch (e) {
            logger.error('[FeatureFlags] Init failed', e);
        }
    }

    isEnabled(flag: FeatureFlag): boolean {
        return this.flags[flag] ?? false;
    }

    getAll(): FlagConfig {
        return { ...this.flags };
    }

    async setFlag(flag: FeatureFlag, value: boolean) {
        this.flags[flag] = value;
        await this.persist();
        logger.info(`[FeatureFlags] Set ${flag} to ${value}`);
    }

    private async persist() {
        try {
            await AsyncStorage.setItem(FLAGS_KEY, JSON.stringify(this.flags));
        } catch (e) {
            logger.error('[FeatureFlags] Persist failed', e);
        }
    }
}

export const featureFlags = new FeatureFlagService();
