import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {i18nApi, LanguageItem} from '../services/api/i18nApi';
import {storage} from '../utils/storage';
import {APP_SETTINGS} from '../config/config';
import {getLocales} from 'react-native-localize';

// Default language resources (fallback)
const resources = {
  'zh-CN': {
    translation: {
      common: {
        more: '更多',
        cancel: '取消',
        selectLanguage: '选择语言',
        networkError: '网络请求异常，请稍后重试',
        welcomeMessage: '欢迎使用!',
        logout: '退出登录',
      },
      login: {
        username: '账号',
        password: '密码',
        loginButton: '登录',
        register: '立即注册',
        forgotPassword: '忘记密码?',
        rememberMe: '记住密码',
        usernameRequired: '用户名不能为空',
        passwordRequired: '密码不能为空',
        failMessage: '登录失败，请检查用户名或密码',
      },
    },
  },
  'en-US': {
    translation: {
      common: {
        more: 'More',
        cancel: 'Cancel',
        selectLanguage: 'Select Language',
        networkError: 'Network error, please try again later',
        welcomeMessage: 'Welcome!',
        logout: 'Logout',
      },
      login: {
        username: 'Username',
        password: 'Password',
        loginButton: 'Login',
        register: 'Register Now',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember Me',
        usernameRequired: 'Username is required',
        passwordRequired: 'Password is required',
        failMessage: 'Login failed, please check your username or password',
      },
    },
  },
};

// Initialize i18next with default settings, we'll update the language later
i18n.use(initReactI18next).init({
  resources,
  lng: APP_SETTINGS.defaultLanguage,
  fallbackLng: APP_SETTINGS.defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
});

// 获取支持的语言列表
export const fetchSupportedLanguages = async (): Promise<LanguageItem[]> => {
  try {
    const response = await i18nApi.getSupportedLanguages();

    if (response.code === 0 && Array.isArray(response.data)) {
      // 处理后端返回的语言列表
      const langList = response.data.map((item: any) => ({
        label: item.label,
        value: item.value,
      }));

      // 缓存语言列表
      await storage.setAsync('supportedLanguages', JSON.stringify(langList));

      return langList;
    }

    throw new Error('Failed to fetch supported languages');
  } catch (error) {
    console.error('Failed to fetch supported languages:', error);

    // 如果有缓存的语言列表则使用缓存
    try {
      const cachedLanguages = await storage.getStringAsync(
        'supportedLanguages',
      );
      if (cachedLanguages) {
        try {
          return JSON.parse(cachedLanguages);
        } catch (e) {
          console.error('Failed to parse cached languages:', e);
        }
      }
    } catch (e) {
      console.error('Failed to get cached languages:', e);
    }

    // 使用i18nApi提供的默认语言列表
    return i18nApi.getDefaultLanguages();
  }
};

// 从后端获取所有语言的翻译资源
export const fetchAllTranslations = async (): Promise<Record<
  string,
  any
> | null> => {
  try {
    console.log('Fetching all translations from server...');
    const response = await i18nApi.getAllTranslations();

    if (response.code === 0 && response.data) {
      const allTranslations = response.data;

      // 缓存所有翻译数据
      await storage.setAsync(
        'all_translations',
        JSON.stringify(allTranslations),
      );
      await storage.setAsync(
        'all_translations_timestamp',
        Date.now().toString(),
      );
      console.log(allTranslations);

      // 更新i18n资源
      for (const [lang, translations] of Object.entries(allTranslations)) {
        if (translations) {
          i18n.addResourceBundle(lang, 'translation', translations, true, true);
        }
      }

      return allTranslations;
    }

    throw new Error('Failed to fetch all translations');
  } catch (error) {
    console.error('Failed to fetch all translations:', error);
    return null;
  }
};

// 从后端获取特定语言的翻译
export const fetchTranslation = async (lang: string): Promise<any> => {
  try {
    // 检查是否需要刷新缓存（缓存时间超过1小时则刷新）
    let shouldFetch = true;
    try {
      const timestampStr = await storage.getStringAsync(
        `translations_${lang}_timestamp`,
      );
      if (timestampStr) {
        const timestamp = parseInt(timestampStr, 10);
        const now = Date.now();
        // 如果缓存不到1小时，不刷新
        if (now - timestamp < 3600000) {
          shouldFetch = false;
          console.log(
            `Cache for ${lang} is still fresh (less than 1 hour old)`,
          );
        }
      }
    } catch (e) {
      console.warn('Failed to check translation cache timestamp:', e);
    }

    // 如果不需要刷新缓存，直接返回null
    if (!shouldFetch) {
      return null;
    }

    console.log(`Fetching translations for ${lang} from server...`);
    const response = await i18nApi.getTranslation(lang);

    if (response.code === 0 && response.data) {
      const translations = response.data;

      // 缓存翻译数据
      await storage.setAsync(
        `translations_${lang}`,
        JSON.stringify(translations),
      );
      await storage.setAsync(
        `translations_${lang}_timestamp`,
        Date.now().toString(),
      );

      // 更新i18n资源
      i18n.addResourceBundle(lang, 'translation', translations, true, true);

      return translations;
    }

    throw new Error(`Failed to fetch translations for ${lang}`);
  } catch (error) {
    console.error(`Failed to fetch translations for ${lang}:`, error);
    return null;
  }
};

// 初始化国际化
export const initializeI18n = async (
  lngs: {label: string; value: string}[],
) => {
  try {
    console.log('Initializing i18n...');

    // 确保存储系统就绪
    await storage.waitForReady();

    // 获取当前语言
    let currentLang: string;
    try {
      currentLang =
        (await storage.getStringAsync('language')) ||
        (lngs.find(item => item.value.includes(getLocales()[0].languageCode))
          ?.value ??
          APP_SETTINGS.defaultLanguage);
      console.log(`Current language from storage: ${currentLang}`);
    } catch (error) {
      console.warn(
        'Failed to get language from storage, using default:',
        error,
      );
      currentLang = APP_SETTINGS.defaultLanguage;
    }
    storage.set('language', currentLang);
    // 检查是否有缓存的翻译（全部语言或特定语言）
    const hasAllTranslationsCache = !!(await storage.getStringAsync(
      'all_translations',
    ));
    const hasCurrentLangCache = !!(await storage.getStringAsync(
      `translations_${currentLang}`,
    ));
    // 首次启动，需要同步获取翻译
    if (!hasAllTranslationsCache && !hasCurrentLangCache) {
      console.log('No translation cache found, fetching from server...');

      // 首先尝试获取所有语言包
      const allTranslations = await fetchAllTranslations();

      if (!allTranslations) {
        // 如果获取所有语言包失败，则只获取当前语言的翻译
        console.log(
          'Failed to fetch all translations, trying current language...',
        );
        await fetchTranslation(currentLang);
      }
    } else {
      // 非首次启动，优先加载缓存
      if (hasAllTranslationsCache) {
        try {
          // 从缓存加载所有翻译
          const cachedAllTranslations = await storage.getStringAsync(
            'all_translations',
          );
          if (cachedAllTranslations) {
            const allTranslations = JSON.parse(cachedAllTranslations);

            // 加载所有语言的翻译
            for (const [lang, translations] of Object.entries(
              allTranslations,
            )) {
              if (translations) {
                i18n.addResourceBundle(
                  lang,
                  'translation',
                  translations,
                  true,
                  true,
                );
              }
            }

            console.log('Loaded all translations from cache');
          }
        } catch (error) {
          console.error('Failed to parse cached all translations:', error);

          // 如果解析所有翻译失败，尝试加载当前语言的缓存
          if (hasCurrentLangCache) {
            try {
              const cachedTranslations = await storage.getStringAsync(
                `translations_${currentLang}`,
              );
              if (cachedTranslations) {
                const translations = JSON.parse(cachedTranslations);
                i18n.addResourceBundle(
                  currentLang,
                  'translation',
                  translations,
                  true,
                  true,
                );
                console.log(`Loaded cached translations for ${currentLang}`);
              }
            } catch (error) {
              console.error(
                `Failed to parse cached translations for ${currentLang}:`,
                error,
              );
            }
          }
        }
      } else if (hasCurrentLangCache) {
        // 如果没有所有语言的缓存，但有当前语言的缓存
        try {
          const cachedTranslations = await storage.getStringAsync(
            `translations_${currentLang}`,
          );
          if (cachedTranslations) {
            const translations = JSON.parse(cachedTranslations);
            i18n.addResourceBundle(
              currentLang,
              'translation',
              translations,
              true,
              true,
            );
            console.log(`Loaded cached translations for ${currentLang}`);
          }
        } catch (error) {
          console.error(
            `Failed to parse cached translations for ${currentLang}:`,
            error,
          );
        }
      }

      // 异步获取最新的翻译资源
      // 先尝试获取所有语言包
      fetchAllTranslations()
        .then(allTranslations => {
          if (allTranslations) {
            console.log('Updated all translations from server');
          } else {
            // 如果获取所有语言包失败，则只获取当前语言的翻译
            console.log(
              'Failed to fetch all translations, trying current language...',
            );
            fetchTranslation(currentLang)
              .then(translations => {
                if (translations) {
                  console.log(
                    `Updated translations for ${currentLang} from server`,
                  );
                }
              })
              .catch(error => {
                console.error(
                  `Error updating translations for ${currentLang}:`,
                  error,
                );
              });
          }
        })
        .catch(error => {
          console.error('Error updating all translations:', error);
        });
    }
    // 更新当前语言
    i18n.changeLanguage(currentLang);

    // 异步获取支持的语言列表
    // fetchSupportedLanguages().catch(error => {
    //   console.error('Error fetching supported languages:', error);
    // });

    return true;
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    return false;
  }
};

// 切换语言
export const changeLanguage = async (lang: string) => {
  try {
    // 更新当前语言
    i18n.changeLanguage(lang);
    await storage.setAsync('language', lang);

    // 尝试从缓存加载翻译
    const hasAllTranslationsCache =
      (await storage.getStringAsync('all_translations')) !== null;
    const hasCurrentLangCache =
      (await storage.getStringAsync(`translations_${lang}`)) !== null;

    if (hasAllTranslationsCache) {
      // 从全部语言缓存中使用对应语言的翻译
      try {
        const cachedAllTranslations = await storage.getStringAsync(
          'all_translations',
        );
        if (cachedAllTranslations) {
          const allTranslations = JSON.parse(cachedAllTranslations);

          if (allTranslations[lang]) {
            i18n.addResourceBundle(
              lang,
              'translation',
              allTranslations[lang],
              true,
              true,
            );
            console.log(
              `Using translation for ${lang} from all translations cache`,
            );
          } else {
            // 如果没有这个语言的翻译，尝试获取
            await fetchTranslation(lang);
          }
        }
      } catch (error) {
        console.error('Failed to parse cached all translations:', error);

        // 如果解析失败，尝试获取特定语言的翻译
        if (hasCurrentLangCache) {
          try {
            const cachedTranslations = await storage.getStringAsync(
              `translations_${lang}`,
            );
            if (cachedTranslations) {
              const translations = JSON.parse(cachedTranslations);
              i18n.addResourceBundle(
                lang,
                'translation',
                translations,
                true,
                true,
              );
              console.log(`Loaded cached translations for ${lang}`);
            }
          } catch (error) {
            console.error(
              `Failed to parse cached translations for ${lang}:`,
              error,
            );
            await fetchTranslation(lang);
          }
        } else {
          await fetchTranslation(lang);
        }
      }
    } else if (hasCurrentLangCache) {
      // 使用特定语言的缓存
      try {
        const cachedTranslations = await storage.getStringAsync(
          `translations_${lang}`,
        );
        if (cachedTranslations) {
          const translations = JSON.parse(cachedTranslations);
          i18n.addResourceBundle(lang, 'translation', translations, true, true);
          console.log(`Loaded cached translations for ${lang}`);
        }
      } catch (error) {
        console.error(
          `Failed to parse cached translations for ${lang}:`,
          error,
        );
        await fetchTranslation(lang);
      }
    } else {
      // 没有任何缓存，直接获取
      await fetchTranslation(lang);
    }

    return true;
  } catch (error) {
    console.error(`Failed to change language to ${lang}:`, error);
    return false;
  }
};

export default i18n;
