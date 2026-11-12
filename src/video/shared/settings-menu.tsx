/** @jsxImportSource react */
import { qualityText, settingsText, speedText } from '@videojs/core/i18n/text/menu';
import { DialIcon } from '@/video/desk-icons';
import { Text as TextPrimitive } from '@videojs/react';
import { Menu } from '@videojs/react';
import {
  ChevronIcon as ChevronIconPrimitive,
  SwitchesIcon as SwitchesIconPrimitive,
  SpeedIcon as SpeedIconPrimitive,
  GearIcon as GearIconPrimitive,
} from '@/video/icons';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';

import { cn } from '@/lib/resolve-class-name';

import { Button } from './button';
import { RadioItem } from './menu-item';
import { ButtonTooltip } from './tooltip';

function MenuChevron({ back = false }: { back?: boolean } = {}) {
  return <ChevronIconPrimitive className={back ? 'media-menu-back-chevron' : 'media-menu-forward-chevron'} />;
}

function QualityMenu() {
  return (
    <Menu.Root>
      <QualityRadioGroup.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <SwitchesIconPrimitive className={'media-menu-trigger-icon'} />
          <TextPrimitive token={qualityText.key}>{qualityText.text}</TextPrimitive>
          <span className={'media-menu-hint'}>
            <QualityRadioGroup.Value className={'media-menu-hint-label'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <TextPrimitive token={qualityText.key}>{qualityText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <QualityRadioGroup.Options
            className={'media-menu-radio-group'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>
                  <span>{item.label}</span>
                  {item.tier ? <sup className={'media-menu-tier'}>{item.tier}</sup> : null}
                </span>
                {item.badge ? <span className={'media-menu-badge'}>{item.badge}</span> : null}
              </RadioItem>
            )}
          ></QualityRadioGroup.Options>
        </Menu.Content>
      </QualityRadioGroup.Root>
    </Menu.Root>
  );
}

function PlaybackRateMenu() {
  return (
    <Menu.Root>
      <PlaybackRateRadioGroup.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <SpeedIconPrimitive className={'media-menu-trigger-icon'} />
          <TextPrimitive token={speedText.key}>{speedText.text}</TextPrimitive>
          <span className={'media-menu-hint'}>
            <PlaybackRateRadioGroup.Value className={'media-menu-hint-label'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <TextPrimitive token={speedText.key}>{speedText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <PlaybackRateRadioGroup.Options
            className={'media-menu-radio-group'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></PlaybackRateRadioGroup.Options>
        </Menu.Content>
      </PlaybackRateRadioGroup.Root>
    </Menu.Root>
  );
}

export function SettingsMenu() {
  return (
    <Menu.Root side="top" align="center">
      <ButtonTooltip label={<TextPrimitive token={settingsText.key}>{settingsText.text}</TextPrimitive>}>
        <Menu.Trigger render={<Button className={'voca-desk-button voca-dial-button'} />}>
          <DialIcon className={'voca-desk-icon'} />
          <TextPrimitive className={'media-settings-button-label'} token={settingsText.key}>
            {settingsText.text}
          </TextPrimitive>
        </Menu.Trigger>
      </ButtonTooltip>
      <Menu.Popup keepMounted className={cn('media-popup', 'media-popup-safe-area', 'media-menu-popup')}>
        <Menu.Content className={'media-menu-content'}>
          <PlaybackRateMenu />
          <QualityMenu />
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}
