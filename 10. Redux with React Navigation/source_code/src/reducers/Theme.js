import { COLORS } from '../themes';

const initialState = {
  colorData: COLORS.red,
};

const Theme = (state = initialState, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      switch(action.payload.name) {
        case 'red':
          return { colorData: COLORS.blue };
        case 'blue':
          return { colorData: COLORS.red };
      }
    default:
      return state;
  }
};

export default Theme;