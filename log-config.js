const log4js = require("log4js");

log4js.configure({
    appenders: {
        out: { type: 'stdout', layout: {
                type: 'pattern',
                pattern: '%[[%d] [%p] %c [%x{user}]%] %m',
                tokens: {
                    user: function (logEvent) {
                        return 'REDLICH';
                    }
                }
            }}
    },
    categories: {
        default: { appenders: ['out'], level: 'trace' },
        'repos-wrapper': { appenders: ['out'], level: 'debug' }
    }
});

const logger = log4js.getLogger('log-config');

logger.info('logger is configured.');
logger.level = 'debug';
