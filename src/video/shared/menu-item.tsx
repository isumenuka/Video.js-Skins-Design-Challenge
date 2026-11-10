/** @jsxImportSource react */

import { Menu as MenuPrimitive } from '@videojs/react';
import { CheckIcon as CheckIconPrimitive } from '@/video/icons';

export function RadioItem({ children, ...props }: MenuPrimitive.RadioItemProps) {
  return (
    <MenuPrimitive.RadioItem className={'media-menu-radio-item'} {...props}>
      {children}
      <MenuPrimitive.ItemIndicator forceMount className={'media-menu-indicator'}>
        <CheckIconPrimitive className={'media-menu-radio-icon'} />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.RadioItem>
  );
}

export function CheckboxItem({ children, ...props }: MenuPrimitive.CheckboxItemProps) {
  return (
    <MenuPrimitive.CheckboxItem className={'media-menu-radio-item media-menu-checkbox-item'} {...props}>
      {children}
      <MenuPrimitive.ItemIndicator forceMount className={'media-menu-indicator'}>
        <CheckIconPrimitive className={'media-menu-radio-icon'} />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.CheckboxItem>
  );
}
