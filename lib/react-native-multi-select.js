import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  UIManager,
  Keyboard
} from 'react-native';
import PropTypes from 'prop-types';
import reject from 'lodash/reject';
import find from 'lodash/find';
import get from 'lodash/get';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import styles, { colorPack } from './styles';

// set UIManager LayoutAnimationEnabledExperimental
if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default class MultiSelect extends Component {
  static propTypes = {
    single: PropTypes.bool,
    selectedItems: PropTypes.array,
    items: PropTypes.array.isRequired,
    uniqueKey: PropTypes.string,
    tagBorderColor: PropTypes.string,
    tagTextColor: PropTypes.string,
    fontFamily: PropTypes.string,
    tagRemoveIconColor: PropTypes.string,
    onSelectedItemsChange: PropTypes.func.isRequired,
    selectedItemFontFamily: PropTypes.string,
    selectedItemTextColor: PropTypes.string,
    itemFontFamily: PropTypes.string,
    itemTextColor: PropTypes.string,
    itemFontSize: PropTypes.number,
    selectedItemIconColor: PropTypes.string,
    searchInputPlaceholderText: PropTypes.string,
    searchInputStyle: PropTypes.object,
    selectText: PropTypes.string,
    altFontFamily: PropTypes.string,
    hideSubmitButton: PropTypes.bool,
    autoFocusInput: PropTypes.bool,
    submitButtonColor: PropTypes.string,
    submitButtonText: PropTypes.string,
    textColor: PropTypes.string,
    fontSize: PropTypes.number,
    fixedHeight: PropTypes.bool,
    hideTags: PropTypes.bool,
    canAddItems: PropTypes.bool,
    onAddItem: PropTypes.func,
    onChangeInput: PropTypes.func,
    displayKey: PropTypes.string,
    onEndEditing: PropTypes.func,
    onSubmitEditing: PropTypes.func,
    autoCapitalize: PropTypes.string,
    errorColor: PropTypes.string,
    invalid: PropTypes.bool
  };

  static defaultProps = {
    single: false,
    selectedItems: [],
    items: [],
    uniqueKey: '_id',
    tagBorderColor: colorPack.primary,
    tagTextColor: colorPack.primary,
    fontFamily: '',
    tagRemoveIconColor: colorPack.danger,
    onSelectedItemsChange: () => {},
    selectedItemFontFamily: '',
    selectedItemTextColor: colorPack.primary,
    itemFontFamily: '',
    itemTextColor: colorPack.textPrimary,
    itemFontSize: 16,
    selectedItemIconColor: colorPack.primary,
    searchInputPlaceholderText: 'Search',
    searchInputStyle: { color: colorPack.textPrimary },
    textColor: colorPack.textPrimary,
    selectText: 'Select',
    altFontFamily: '',
    hideSubmitButton: false,
    autoFocusInput: true,
    submitButtonColor: '#CCC',
    submitButtonText: 'Submit',
    fontSize: 14,
    fixedHeight: false,
    hideTags: false,
    onChangeInput: () => {},
    displayKey: 'name',
    canAddItems: false,
    onAddItem: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      selector: false,
      searchTerm: '',
      isFocus: false
    };
  }

  getSelectedItemsExt = optionalSelctedItems => (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}
    >
      {this._displaySelectedItems(optionalSelctedItems)}
    </View>
  );

  _onChangeInput = value => {
    const { onChangeInput } = this.props;
    if (onChangeInput) {
      onChangeInput(value);
    }
    this.setState({ searchTerm: value });
  };

  setInputValue = (value: string) => {
    this.setState({ searchTerm: value });
  }

  _getSelectLabel = () => {
    const {
      selectText,
      placeholderText,
      single,
      selectedItems,
      displayKey
    } = this.props;
    if (!selectedItems || selectedItems.length === 0) {
      return '';
    } else if (single) {
      const item = selectedItems[0];
      const foundItem = this._findItem(item);
      return get(foundItem, displayKey) || placeholderText;
    }
    return `${selectedItems.length} selected`;
  };

  _findItem = itemKey => {
    const { items, uniqueKey } = this.props;
    return find(items, singleItem => singleItem[uniqueKey] === itemKey) || {};
  };

  _displaySelectedItems = optionalSelctedItems => {
    const {
      fontFamily,
      tagRemoveIconColor,
      tagBorderColor,
      uniqueKey,
      tagTextColor,
      selectedItems,
      displayKey
    } = this.props;
    const actualSelectedItems = optionalSelctedItems || selectedItems;
    return actualSelectedItems.map(singleSelectedItem => {
      const item = this._findItem(singleSelectedItem);
      if (!item[displayKey]) return null;
      return (
        <View
          style={[
            styles.selectedItem,
            {
              width: item[displayKey].length * 8 + 60,
              justifyContent: 'center',
              height: 40,
              borderColor: tagBorderColor
            }
          ]}
          key={item[uniqueKey]}
        >
          <Text
            style={[
              {
                flex: 1,
                color: tagTextColor,
                fontSize: 15
              },
              fontFamily ? { fontFamily } : {}
            ]}
            numberOfLines={1}
          >
            {item[displayKey]}
          </Text>
          <TouchableOpacity
            onPress={() => {
              this._removeItem(item);
            }}
          >
            <Icon
              name="close-circle"
              style={{
                color: tagRemoveIconColor,
                fontSize: 22,
                marginLeft: 10
              }}
            />
          </TouchableOpacity>
        </View>
      );
    });
  };

  _removeItem = item => {
    const { uniqueKey, selectedItems, onSelectedItemsChange } = this.props;
    const newItems = reject(
      selectedItems,
      singleItem => item[uniqueKey] === singleItem
    );
    // broadcast new selected items state to parent component
    onSelectedItemsChange(newItems);
  };

  _removeAllItems = () => {
    const { onSelectedItemsChange } = this.props;
    // broadcast new selected items state to parent component
    onSelectedItemsChange([]);
  };

  _toggleSelector = () => {
    if (!this.props.editable) Keyboard.dismiss();
    const selector = !this.state.selector;
    this.setState({ selector });
    this.props.onToggleSelector(selector);
  };

  _clearSearchTerm = () => {
    this.setState({
      searchTerm: ''
    });
  };

  _submitSelection = () => {
    this._toggleSelector();
    // reset searchTerm
    this._clearSearchTerm();
  };

  _itemSelected = item => {
    const { uniqueKey, selectedItems } = this.props;
    return selectedItems.indexOf(item[uniqueKey]) !== -1;
  };

  _addItem = () => {
    const {
      uniqueKey,
      items,
      selectedItems,
      onSelectedItemsChange,
      onAddItem
    } = this.props;
    let newItems = [];
    let newSelectedItems = [];
    const newItemName = this.state.searchTerm;
    if (newItemName) {
      const newItemId = newItemName
        .split(' ')
        .filter(word => word.length)
        .join('-');
      newItems = [...items, { [uniqueKey]: newItemId, name: newItemName }];
      newSelectedItems = [...selectedItems, newItemId];
      onAddItem(newItems);
      onSelectedItemsChange(newSelectedItems);
      this._clearSearchTerm();
    }
  };

  _toggleItem = item => {
    Keyboard.dismiss();
    const {
      single,
      uniqueKey,
      selectedItems,
      onSelectedItemsChange
    } = this.props;
    if (single) {
      this._submitSelection();
      onSelectedItemsChange([item[uniqueKey]]);
    } else {
      const status = this._itemSelected(item);
      let newItems = [];
      if (status) {
        newItems = reject(
          selectedItems,
          singleItem => item[uniqueKey] === singleItem
        );
      } else {
        newItems = [...selectedItems, item[uniqueKey]];
      }
      // broadcast new selected items state to parent component
      onSelectedItemsChange(newItems);
    }
  };

  _itemStyle = item => {
    const {
      selectedItemFontFamily,
      selectedItemTextColor,
      itemFontFamily,
      itemTextColor,
      itemFontSize,
      textColor,
      invalid,
      errorColor
    } = this.props;
    const isSelected = this._itemSelected(item);
    const fontFamily = {};
    if (isSelected && selectedItemFontFamily) {
      fontFamily.fontFamily = selectedItemFontFamily;
    } else if (!isSelected && itemFontFamily) {
      fontFamily.fontFamily = itemFontFamily;
    }
    let color = isSelected
      ? { color: selectedItemTextColor }
      : { color: textColor };

    color = invalid ? { color: errorColor } : { ...color };
    return { ...color };
  };

  _getRow = item => {
    const { selectedItemIconColor, displayKey, dropdownTextStyle } = this.props;
    return (
      <TouchableOpacity
        disabled={item.disabled}
        onPress={() => this._toggleItem(item)}
        activeOpacity={1}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={[
                {
                  flex: 1,
                  fontSize: 16,
                  paddingTop: 5,
                  paddingBottom: 5
                },
                dropdownTextStyle,
                this._itemStyle(item),
                item.disabled ? { color: 'grey' } : {}
              ]}
            >
              {item[displayKey]}
            </Text>
            {this._itemSelected(item) ? (
              <Icon
                name="check"
                style={{
                  fontSize: 20,
                  color: selectedItemIconColor
                }}
              />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  _getRowNew = item => (
    <TouchableOpacity
      disabled={item.disabled}
      onPress={() => this._addItem(item)}
    >
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[
              {
                flex: 1,
                fontSize: 16,
                paddingTop: 5,
                paddingBottom: 5
              },
              this._itemStyle(item),
              item.disabled ? { color: 'grey' } : {}
            ]}
          >
            Add {item.name} (tap or press return)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  _filterItems = searchTerm => {
    const { items, displayKey } = this.props;
    return items.filter(item => item[displayKey].toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1);
  };

  _renderItems = () => {
    const {
      canAddItems,
      items,
      fontFamily,
      uniqueKey,
      selectedItems,
      inputTextStyle,
      textColor,
      emptyMessage
    } = this.props;
    const { searchTerm } = this.state;
    let component = null;
    // If searchTerm matches an item in the list, we should not add a new
    // element to the list.
    let searchTermMatch;
    let itemList;
    let addItemRow;
    const renderItems = searchTerm ? this._filterItems(searchTerm) : items;
    if (renderItems.length) {
      itemList = (
        <FlatList
          data={renderItems}
          extraData={selectedItems}
          keyExtractor={item => item[uniqueKey].toString()}
          renderItem={rowData => this._getRow(rowData.item)}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      );
      searchTermMatch = renderItems.filter(item => item.name === searchTerm)
        .length;
    } else if (!canAddItems) {
      itemList = (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={[
              inputTextStyle,
              {
                flex: 1,
                marginVertical: 10,
                textAlign: 'center',
                color: textColor
              }
            ]}
          >
            {emptyMessage || 'No items to display'}
          </Text>
        </View>
      );
    }

    if (canAddItems && !searchTermMatch && searchTerm.length) {
      addItemRow = this._getRowNew({ name: searchTerm });
    }
    component = (
      <View>
        {itemList}
        {addItemRow}
      </View>
    );
    return component;
  };

  _getInputTextColor = () => {
    const { textColor, placeholderTextColor, selectedItems } = this.props;
    const { searchTerm, selector, isFocus } = this.state;

    if (
      (selectedItems.length && !isFocus) ||
      (selectedItems.length && !searchTerm)
    ) {
      return textColor;
    }

    return placeholderTextColor;
  };

  render() {
    const {
      selectedItems,
      single,
      fontFamily,
      altFontFamily,
      searchInputPlaceholderText,
      searchInputStyle,
      hideSubmitButton,
      autoFocusInput,
      submitButtonColor,
      submitButtonText,
      fontSize,
      textColor,
      fixedHeight,
      hideTags,
      // new props
      editable,
      dropdownStyle,
      inputContainerStyle,
      inputTextStyle,
      placeholderTextColor,
      placeholderText,
      onEndEditing,
      onSubmitEditing,
      autoCapitalize,
      invalid,
      errorColor
    } = this.props;
    const { searchTerm, selector, isFocus } = this.state;
    const dispalyedValue = this._getSelectLabel();
    let inputColor = (!selectedItems.length || isFocus) && !searchTerm
    ? placeholderTextColor
    : textColor;
    inputColor = invalid ? errorColor : inputColor;

    return (
      <View>
        <View>
          <TouchableOpacity
            onPress={editable ? null : this._submitSelection}
            style={[styles.inputGroup, inputContainerStyle]}
            activeOpacity={1}
          >
            <TextInput
              autoCapitalize={autoCapitalize}
              autoFocus={autoFocusInput}
              onChangeText={this._onChangeInput}
              blurOnSubmit={false}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                if (onSubmitEditing) {
                  onSubmitEditing();
                }
              }}
              placeholder={placeholderText}
              placeholderTextColor={
                placeholderTextColor || colorPack.placeholderTextColor
              }
              underlineColorAndroid="transparent"
              style={[
                inputTextStyle,
                {
                  flex: 1,
                  color: inputColor
                }
              ]}
              value={isFocus || searchTerm ? searchTerm : dispalyedValue}
              editable={!!editable}
              autoCorrect={false}
              onFocus={() => {
                this.setState(() => ({ isFocus: true }));
                this._toggleSelector();
              }}
              onEndEditing={() => {
                this.setState(() => ({ isFocus: false }));
                if (onEndEditing) {
                  onEndEditing();
                }
              }}
            />
            <TouchableOpacity onPress={this._submitSelection} activeOpacity={1}>
              <MaterialIcon
                name="arrow-drop-down"
                size={16}
                color={inputColor}
              />
            </TouchableOpacity>
          </TouchableOpacity>

          {selector && (
            <View style={[styles.selectorView(fixedHeight), dropdownStyle]}>
              {this._renderItems()}
            </View>
          )}
        </View>
      </View>
    );
  }
}
