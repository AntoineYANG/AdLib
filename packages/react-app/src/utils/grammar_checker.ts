/*
 * @Author: Kanata You 
 * @Date: 2022-05-24 22:19:24 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-24 23:12:12
 */

import axios from 'axios';


const API = 'https://api.languagetoolplus.com/v2';

export type GrammarCheckRequestParams = {
  /** Text to check */
  text: string;
  /** Target language */
  language: 'en-US' | 'de-DE' | string;
};

export type GrammarIssueReplacement = {
  value: string;
};

export type GrammarIssue = {
  message: string;
  replacements: GrammarIssueReplacement[];
  offset: number;
  length: number;
  rule: {
    id: string;
    subId: string;
    sourceFile: string;
    description: string;
    issueType: string;
    category: {
      id: string;
      name: string;
    };
  };
  [key: string]: any;
};

export type GrammarCheckResponseData = {
  matches: GrammarIssue[];
  [key: string]: Record<string, any>;
};

export type SupportedLanguage = {
  name: string;
  code: string;
  longCode: string;
};

const GrammarChecker = {

  /**
   * Get all supported languages.
   * @return {Promise<SupportedLanguage[]>}
   */
  getSupportedLanguages: async (): Promise<SupportedLanguage[]> => {
    try {
      const res = await axios.get<SupportedLanguage[]>(
        `${API}/languages`
      );
      
      return res.data;
    } catch (error) {
      return [];
    }
  },

  /**
   * Check a text with LanguageTool for possible style and grammar issues.
   * @param {GrammarCheckRequestParams} req with query string params
   * @returns {Promise<GrammarCheckResponseData | null>} Validation results
   */
  check: async (req: GrammarCheckRequestParams): Promise<GrammarCheckResponseData | null> => {
    try {
      const res = await axios.post<GrammarCheckResponseData>(
        `${API}/check`,
        `text=${escape(req.text)}&language=${req.language}&enabledOnly=false`,
        {
          headers: {
            'Content-Type': 'x-www-form-urlencoded',
            Accept: 'application/json',
          }
        }
      );
      
      return res.data;
    } catch (error) {
      return null;
    }
  }

};


export default GrammarChecker;
