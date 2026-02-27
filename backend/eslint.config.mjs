// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      // dependencies
      'node_modules/**',
      'dist/**',
      // tests
      'coverage/**',
      '.nyc_output/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      'test/**',
      // build output
      'build/**',
      // misc
      '.DS_Store',
      '.env',
      '.env.*',
      '**/*.log',
      // IDE
      '.idea/**',
      '.vscode/**',
      '**/*.swp',
      '**/*.swo',
      // generated files
      'src/**/*.js',
      'src/**/*.js.map',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);