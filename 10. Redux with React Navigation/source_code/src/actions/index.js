import { TOGGLE_THEME } from './actionTypes';

export const toggleTheme = theme => ({
  type: TOGGLE_THEME,
  payload: theme,
});
