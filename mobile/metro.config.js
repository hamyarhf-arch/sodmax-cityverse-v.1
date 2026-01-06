// mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    // اضافه کردن alias برای مسیرهای کوتاه‌تر
    alias: {
      '@': './src',
      '@assets': './src/assets',
      '@components': './src/components',
      '@screens': './src/screens',
      '@services': './src/services',
      '@contexts': './src/contexts',
      '@utils': './src/utils',
      '@navigation': './src/navigation',
      '@constants': './src/constants',
    },
  };

  // تنظیمات کش
  config.cacheStores = [
    new (require('metro-cache')).FileStore({
      root: './node_modules/.cache/metro',
    }),
  ];

  // تنظیمات watcher
  config.watchFolders = [__dirname];

  // غیرفعال کردن minification در توسعه
  if (process.env.NODE_ENV !== 'production') {
    config.transformer.minifierConfig = {
      mangle: false,
      compress: {
        drop_console: false,
        drop_debugger: false,
        keep_classnames: true,
        keep_fnames: true,
      },
      output: {
        beautify: true,
        comments: true,
      },
    };
  }

  // تنظیمات source maps
  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // اضافه کردن CORS headers برای توسعه
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }
        
        return middleware(req, res, next);
      };
    },
  };

  // تنظیمات bundle
  config.serializer = {
    ...config.serializer,
    getModulesRunBeforeMainModule: () => [
      require.resolve('./src/utils/polyfills.js'),
    ],
    getPolyfills: require('react-native/rn-get-polyfills'),
  };

  // تنظیمات transformer برای TypeScript
  config.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  });

  // اضافه کردن پلاگین‌ها
  config.transformer.plugins = [
    ...(config.transformer.plugins || []),
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    [
      '@babel/plugin-proposal-class-properties',
      {
        loose: true,
      },
    ],
    [
      '@babel/plugin-proposal-private-methods',
      {
        loose: true,
      },
    ],
    [
      '@babel/plugin-proposal-private-property-in-object',
      {
        loose: true,
      },
    ],
    '@babel/plugin-transform-runtime',
    'react-native-reanimated/plugin',
  ];

  return config;
})();

// فایل polyfills
// mobile/src/utils/polyfills.js
if (typeof Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

if (typeof global === 'undefined') {
  global.global = window;
}

// پلی‌فیل برای localStorage در React Native
if (typeof localStorage === 'undefined') {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  
  global.localStorage = {
    getItem: async (key) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Error getting item from AsyncStorage:', error);
        return null;
      }
    },
    
    setItem: async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting item in AsyncStorage:', error);
      }
    },
    
    removeItem: async (key) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing item from AsyncStorage:', error);
      }
    },
    
    clear: async () => {
      try {
        await AsyncStorage.clear();
      } catch (error) {
        console.error('Error clearing AsyncStorage:', error);
      }
    },
    
    key: async (index) => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        return keys[index] || null;
      } catch (error) {
        console.error('Error getting key from AsyncStorage:', error);
        return null;
      }
    },
    
    length: async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        return keys.length;
      } catch (error) {
        console.error('Error getting length from AsyncStorage:', error);
        return 0;
      }
    },
  };
}

// پلی‌فیل برای window در React Native
if (typeof window === 'undefined') {
  global.window = global;
}

// پلی‌فیل برای document در React Native
if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({}),
    createTextNode: () => ({}),
    documentElement: {
      style: {},
    },
  };
}

// پلی‌فیل برای navigator.vibrate
if (typeof navigator !== 'undefined' && !navigator.vibrate) {
  const { Vibration } = require('react-native');
  navigator.vibrate = (pattern) => {
    if (Array.isArray(pattern)) {
      if (pattern.length === 1) {
        Vibration.vibrate(pattern[0]);
      } else {
        Vibration.vibrate(pattern, true);
      }
    } else {
      Vibration.vibrate(pattern);
    }
    return true;
  };
}

// پلی‌فیل برای AudioContext در React Native
if (typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
  global.AudioContext = class MockAudioContext {
    constructor() {
      console.warn('AudioContext is not supported in this environment');
    }
    
    createOscillator() {
      return {
        connect: () => {},
        frequency: { value: 0 },
        type: '',
        start: () => {},
        stop: () => {},
      };
    }
    
    createGain() {
      return {
        connect: () => {},
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      };
    }
    
    destination = {};
    currentTime = 0;
  };
}
