import { logger } from './logger';
import { Alert } from 'react-native';
import { Analytics } from './analytics';

export const initCrashReporting = () => {
    // @ts-ignore - ErrorUtils is global in RN
    const defaultHandler = global.ErrorUtils.getGlobalHandler();
    
    // @ts-ignore
    global.ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
        logger.error(`[CRASH] ${isFatal ? 'FATAL' : 'NON-FATAL'}`, error);
        Analytics.trackEvent('ERROR_OCCURRED', { fatal: isFatal, message: error.message });
        
        if (isFatal) {
             Alert.alert(
                "Beklenmedik Bir Hata",
                "Uygulama kritik bir hatayla karşılaştı. Hata raporu oluşturuldu.",
                [{ 
                    text: "Tamam", 
                    onPress: () => {
                        // Create a recovery mechanism or let it crash to OS
                        if (defaultHandler) defaultHandler(error, isFatal);
                    }
                }]
            );
        } else {
             if (defaultHandler) defaultHandler(error, isFatal);
        }
    });
    
    logger.info('Crash Reporting Initialized');
};
