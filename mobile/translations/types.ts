export type SupportedLanguages = 'en' | 'fr' | 'rw';

// Helper type to extract all possible translation keys from nested objects
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// Extract all translation keys from the translations object
export type TranslationKey = NestedKeyOf<typeof import('./index').translations>;
