export type TranslationLocale = {
  code: string;
  label: string;
  folder: string;
  messages: string;
  validators: string;
  role: string;
};

export const cloudpanelTranslations: TranslationLocale[] = [
  {
    code: "en_us",
    label: "English (US)",
    folder: "v2/en_us",
    messages: "messages.en.xlf",
    validators: "validators.en.xlf",
    role: "baseline source locale",
  },
  {
    code: "th_th",
    label: "Thai",
    folder: "v2/th_th",
    messages: "messages.th.xlf",
    validators: "validators.th.xlf",
    role: "localized release text",
  },
  {
    code: "ja_jp",
    label: "Japanese",
    folder: "v2/ja_jp",
    messages: "messages.ja_JP.xlf",
    validators: "validators.ja_JP.xlf",
    role: "localized release text",
  },
  {
    code: "zh_hans",
    label: "Chinese (Simplified)",
    folder: "v2/zh_hans",
    messages: "messages.zh_HANS.xlf",
    validators: "validators.zh_HANS.xlf",
    role: "simplified Chinese locale",
  },
  {
    code: "zh_tw",
    label: "Chinese (Taiwan)",
    folder: "v2/zh_tw",
    messages: "messages.zh_TW.xlf",
    validators: "validators.zh_TW.xlf",
    role: "traditional Chinese locale",
  },
];

export const cloudpanelTranslationSource =
  "cloudpanel-io/cloudpanel-translations/tree/master/v2";
