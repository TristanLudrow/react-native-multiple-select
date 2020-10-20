/* @flow */

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

type _t_props = {
  single?: boolean,
  selectedItems?: Array<*>,
  items: Array<Object>,
  uniqueKey?: string,
  onSelectedItemsChange: (selectedItems: Array<*>) => void,
  selectedItemTextColor?: string,
  placeholderText?: string,
  placeholderTextColor?: string,
  autoFocusInput?: boolean,
  textColor?: string,
  fixedHeight?: boolean,
  onChangeInput?: (searchTerm: string) => void,
  displayKey?: string,
  onEndEditing: (searchTerm: string) => void,
  onSubmitEditing: () => void,
  autoCapitalize: 'none' | 'sentences' | 'words' | 'characters',
  editable?: boolean,
  disableNativeFilter?: boolean,
  dropdownStyle?: Object,
  inputContainerStyle?: Object,
  inputTextStyle?: Object,
  emptyMessage?: string,
  emptyMessageContainer?: Object,
  inputContainerHitSlop?: Object,
  hideEmpty?: boolean,
  disabled?: boolean,
  rightIcon?: Node,
  dropdownListWithSeparator?: boolean
};

type _t_state = {
  selector: boolean,
  searchTerm: string,
  isFocus: boolean
};

export default class MultiSelect extends Component<_t_props, _t_state> {
  static defaultProps = {
    single: false,
    selectedItems: [],
    items: [],
    uniqueKey: 'id',
    onSelectedItemsChange: () => {},
    selectedItemTextColor: colorPack.primary,
    placeholderText: 'Search',
    textColor: colorPack.textPrimary,
    autoFocusInput: true,
    fixedHeight: false,
    onChangeInput: () => {},
    displayKey: 'name',
    emptyMessage: 'No items to display'
  };

  state = {
    selector: false,
    searchTerm: '',
    isFocus: false
  };

  _getInputValue = () => {
    const { placeholderText, single, selectedItems, displayKey } = this.props;
    if (!selectedItems || selectedItems.length === 0) return '';

    if (single) {
      const item = selectedItems[0];
      const foundItem = this._findItem(item);
      return get(foundItem, displayKey) || placeholderText;
    }

    return `${selectedItems.length} selected`;
  };

  _findItem = (itemKey: string) => {
    const { items, uniqueKey } = this.props;
    return find(items, singleItem => singleItem[uniqueKey] === itemKey) || {};
  };

  _toggleSelector = () => {
    if (!this.props.editable) Keyboard.dismiss();
    const selector = !this.state.selector;
    this.setState({ selector });
    this.props.onToggleSelector(selector);
  };

  clearSearchTerm = () => {
    this.setState({ searchTerm: '' });
  };

  _submitSelection = () => {
    this._toggleSelector();
    this.clearSearchTerm();
  };

  _itemSelected = (item: Object) => {
    const { uniqueKey, selectedItems } = this.props;
    return selectedItems.indexOf(item[uniqueKey]) !== -1;
  };

  _toggleItem = (item: Object) => {
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
      onSelectedItemsChange(newItems);
    }
  };

  _itemStyle = item => {
    const { selectedItemTextColor, textColor } = this.props;
    const isSelected = this._itemSelected(item);

    let color = isSelected ? selectedItemTextColor : textColor;

    return { color };
  };

  _getInputTextColor = () => {
    const { textColor, placeholderTextColor, selectedItems } = this.props;
    const { searchTerm, selector, isFocus } = this.state;

    let inputColor =
      (!selectedItems.length || isFocus) && !searchTerm
        ? placeholderTextColor
        : textColor;

    return inputColor;
  };

  _getRow = item => {
    const {
      selectedItemTextColor,
      displayKey,
      dropdownItemStyle,
      dropdownTextStyle
    } = this.props;

    return (
      <TouchableOpacity
        disabled={item.disabled}
        onPress={() => this._toggleItem(item)}
        activeOpacity={1}
      >
        <View style={[styles.dropdownRowContainer, dropdownItemStyle]}>
          <Text
            style={[
              styles.dropdownRowText,
              dropdownTextStyle,
              this._itemStyle(item),
              item.disabled && { color: 'grey' }
            ]}
          >
            {item[displayKey]}
          </Text>
          {this._itemSelected(item) && (
            <Icon name="check" size={18} color={selectedItemTextColor} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  _filterItems = searchTerm => {
    const { items, displayKey } = this.props;
    return items.filter(
      item =>
        item[displayKey].toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    );
  };

  _separator = () => {
    const { dropdownListWithSeparator } = this.props;
    return dropdownListWithSeparator ? (
      <View style={{ height: 1, backgroundColor: '#979797', opacity: 0.2 }} />
    ) : null;
  };

  _renderDropdown = () => {
    const {
      items,
      uniqueKey,
      selectedItems,
      inputTextStyle,
      textColor,
      emptyMessage,
      disableNativeFilter,
      dropdownStyle,
      fixedHeight,
      emptyMessageContainer
    } = this.props;
    const { searchTerm } = this.state;
    let component = null;
    let itemList;
    const renderItems =
      searchTerm && !disableNativeFilter
        ? this._filterItems(searchTerm)
        : items;

    return (
      <View style={[styles.selectorView(fixedHeight), dropdownStyle]}>
        {!!renderItems.length ? (
          <FlatList
            data={renderItems}
            extraData={selectedItems}
            keyExtractor={item => item[uniqueKey].toString()}
            renderItem={rowData => this._getRow(rowData.item)}
            nestedScrollEnabled
            ItemSeparatorComponent={this._separator}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          />
        ) : (
          <View style={[styles.emptyMessageContainer, emptyMessageContainer]}>
            <Text style={[styles.emptyMessageText(textColor), inputTextStyle]}>
              {emptyMessage}
            </Text>
          </View>
        )}
      </View>
    );
  };

  /* TextInput events */
  onSubmitEditing = () => {
    Keyboard.dismiss();
    if (this.props.onSubmitEditing) this.props.onSubmitEditing();
  };

  onFocus = () => {
    this.setState(() => ({ isFocus: true }));
    if (!this.state.selector) this._toggleSelector();
  };

  onEndEditing = () => {
    this.setState(() => ({ isFocus: false }));
    if (this.props.onEndEditing) this.props.onEndEditing();
  };

  onChangeInput = (value: string) => {
    this.setState(() => ({ searchTerm: value }));
    if (this.props.onChangeInput) this.props.onChangeInput(value);
  };
  /* TextInput events */

  render() {
    const {
      autoFocusInput,
      editable,
      inputContainerStyle,
      inputTextStyle,
      placeholderTextColor,
      placeholderText,
      onEndEditing,
      onSubmitEditing,
      autoCapitalize,
      inputContainerHitSlop,
      textColor,
      disabled,
      rightIcon
    } = this.props;
    const { searchTerm, selector, isFocus } = this.state;
    const dispalyedValue = this._getInputValue();
    let inputColor = this._getInputTextColor();

    return (
      <View pointerEvents={disabled ? 'none' : 'auto'}>
        <TouchableOpacity
          onPress={editable ? null : this._submitSelection}
          style={[styles.inputGroup, inputContainerStyle]}
          activeOpacity={1}
          hitSlop={inputContainerHitSlop || null}
        >
          <TextInput
            onSubmitEditing={this.onSubmitEditing}
            onFocus={this.onFocus}
            onEndEditing={this.onEndEditing}
            onChangeText={this.onChangeInput}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocusInput}
            blurOnSubmit={false}
            placeholder={placeholderText}
            placeholderTextColor={
              placeholderTextColor || colorPack.placeholderTextColor
            }
            underlineColorAndroid="transparent"
            style={[styles.input(inputColor), inputTextStyle]}
            value={isFocus || searchTerm ? searchTerm : dispalyedValue}
            editable={!!editable}
            autoCorrect={false}
            pointerEvents={editable ? 'auto' : 'none'}
          />
          {rightIcon || (
            <TouchableOpacity
              hitSlop={{ left: 20, top: 10, right: 10, bottom: 10 }}
              onPress={this._submitSelection}
              activeOpacity={1}
            >
              <MaterialIcon
                name={`keyboard-arrow-${selector ? 'up' : 'down'}`}
                // name={`arrow-drop-${selector ? 'up' : 'down'}`}
                size={20}
                color={textColor}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {selector ? this._renderDropdown() : null}
      </View>
    );
  }
}
