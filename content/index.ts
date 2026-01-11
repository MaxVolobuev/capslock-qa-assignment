
import { EN } from './en';

export type Lang = 'en';

// getContent(lang) returns content object for the specified language
export const getContent = (_lang: Lang = 'en') => EN;