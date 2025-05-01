import config from 'eslint-config-xo';
import { defineConfig } from '@eslint/config-helpers';

export default defineConfig([
	config,
	{
		rules: {
			'react/jsx-filename-extension': [
				'error',
				{
					extensions: ['.jsx', '.tsx'],
				},
			],
			'global-require': 'off',
			'no-unused-expressions': [
				'error',
				{
					allowTaggedTemplates: true,
				},
			],
			'import/extensions': 'off',
			'import/no-unresolved': 'off',
			'react/react-in-jsx-scope': 'off',
			'no-param-reassign': 'off',
			'import/prefer-default-export': 'off',
			'react/jsx-props-no-spreading': 'off',
			'react/destructuring-assignment': 'off',
			'import/no-extraneous-dependencies': 'off',
			'react/function-component-definition': 'off',
			'react/jsx-no-constructed-context-values': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				2,
				{
					args: 'none',
				},
			],
			'react/no-unstable-nested-components': 'off',
			'react/no-unescaped-entities': 'off',
			'lines-between-class-members': 'off',
			'no-nested-ternary': 'off',
			'react/jsx-no-useless-fragment': 'off',
			'no-shadow': 'off',
			'no-continue': 'off',
			'consistent-return': 'off',
			'jsx-a11y/anchor-is-valid': 'off',
			'no-underscore-dangle': 'off',
			'no-useless-escape': 'off',
			'prefer-destructuring': 'off',
			'no-promise-executor-return': 'off',
			'react/display-name': 'off',
			'react/require-default-props': 'off',
			'no-restricted-syntax': 'off',
		},
	},
]);
