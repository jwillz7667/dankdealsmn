import config from '@dankdeals/config/eslint';

export default [...config, { ignores: ['dist/**', 'vitest.config.ts'] }];
