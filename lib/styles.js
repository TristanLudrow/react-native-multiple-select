/*!
 * react-native-multi-select
 * Copyright(c) 2017 Mustapha Babatunde Oluwaleke
 * MIT Licensed
 */

 export const colorPack = {
  primary: '#00A5FF',
  primaryDark: '#215191',
  light: '#FFF',
  textPrimary: '#525966',
  placeholderTextColor: '#A9A9A9',
  danger: '#C62828',
  borderColor: '#e9e9e9',
  backgroundColor: '#b1b1b1'
};

export default {
  selectorView: fixedHeight => {
    const style = {
      backgroundColor: '#fff'
    };
    if (fixedHeight) {
      style.maxHeight = 250;
    }
    return style;
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorPack.light
  },
  input: (textColor) => ({
    flex: 1,
    color: textColor
  }),
  dropdownView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 10
  },
  dropdownRowContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dropdownRowText: {
    flex: 1,
    fontSize: 16,
    paddingTop: 5,
    paddingBottom: 5
  },
  emptyMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  emptyMessageText: (textColor) => ({
    flex: 1,
    marginVertical: 10,
    textAlign: 'center',
    color: textColor
  })
};
