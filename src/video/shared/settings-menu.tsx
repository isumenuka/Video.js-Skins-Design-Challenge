/** @jsxImportSource react */
import { audioText, captionsText, qualityText, settingsText, speedText } from '@videojs/core/i18n/text/menu';
import { Text as TextPrimitive } from '@videojs/react';
import { Menu } from '@videojs/react';
import {
  ChevronIcon as ChevronIconPrimitive,
  SwitchesIcon as SwitchesIconPrimitive,
  SpeechIcon as SpeechIconPrimitive,
  SpeedIcon as SpeedIconPrimitive,
  CaptionsOffIcon as CaptionsOffIconPrimitive,
  GearIcon as GearIconPrimitive,
} from '@/video/icons';
import { AudioTrackRadioGroup } from '@videojs/react/ui/audio-track-radio-group';
import { CaptionsRadioGroup } from '@videojs/react/ui/captions-radio-group';
import { PlaybackRateRadioGroup } from '@videojs/react/ui/playback-rate-radio-group';
import { QualityRadioGroup } from '@videojs/react/ui/quality-radio-group';

import { cn } from '@/lib/resolve-class-name';
import { CheckIcon as CheckIconPrimitive } from '@/video/icons';
import { type SubtitleMode, useLesson } from '@/video/lesson/lesson-context';

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

function AudioTrackMenu() {
  return (
    <Menu.Root>
      <AudioTrackRadioGroup.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <SpeechIconPrimitive className={'media-menu-trigger-icon'} />
          <TextPrimitive token={audioText.key}>{audioText.text}</TextPrimitive>
          <span className={'media-menu-hint'}>
            <AudioTrackRadioGroup.Value className={'media-menu-hint-label'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <TextPrimitive token={audioText.key}>{audioText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <AudioTrackRadioGroup.Options
            className={'media-menu-radio-group'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></AudioTrackRadioGroup.Options>
        </Menu.Content>
      </AudioTrackRadioGroup.Root>
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

function CaptionsMenu() {
  return (
    <Menu.Root>
      <CaptionsRadioGroup.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <CaptionsOffIconPrimitive className={'media-menu-trigger-icon'} />
          <TextPrimitive token={captionsText.key}>{captionsText.text}</TextPrimitive>
          <span className={'media-menu-hint'}>
            <CaptionsRadioGroup.Value className={'media-menu-hint-label'} />
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <TextPrimitive token={captionsText.key}>{captionsText.text}</TextPrimitive>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <CaptionsRadioGroup.Options
            className={'media-menu-radio-group'}
            renderItem={(props, item) => (
              <RadioItem {...props}>
                <span>{item.label}</span>
              </RadioItem>
            )}
          ></CaptionsRadioGroup.Options>
        </Menu.Content>
      </CaptionsRadioGroup.Root>
    </Menu.Root>
  );
}

const SUBTITLE_MODES: Array<{ value: SubtitleMode | 'off'; label: string }> = [
  { value: 'native', label: 'Native' },
  { value: 'translation', label: 'Translation' },
  { value: 'both', label: 'Both' },
  { value: 'off', label: 'Off' },
];

/** The lesson's subtitle and practice settings, which narrow players reach only through this menu. */
function LessonMenu() {
  const lab = useLesson();
  if (!lab) return null;
  const value = lab.subtitlesOn ? lab.mode : 'off';
  const current = SUBTITLE_MODES.find((m) => m.value === value)!;

  return (
    <>
      <Menu.Root>
        <Menu.Trigger className={'media-menu-item'}>
          <CaptionsOffIconPrimitive className={'media-menu-trigger-icon'} />
          <span>Subtitles</span>
          <span className={'media-menu-hint'}>
            <span className={'media-menu-hint-label'}>{current.label}</span>
            <MenuChevron />
          </span>
        </Menu.Trigger>
        <Menu.Content className={'media-menu-content'}>
          <Menu.Item className={'media-menu-back-item'}>
            <MenuChevron back />
            <span>Subtitles</span>
          </Menu.Item>
          <Menu.Separator className={'media-menu-separator'} />
          <Menu.RadioGroup
            className={'media-menu-radio-group'}
            value={value}
            onValueChange={(next) => {
              if (next === 'off') {
                lab.setSubtitlesOn(false);
              } else {
                lab.setMode(next as SubtitleMode);
                lab.setSubtitlesOn(true);
              }
            }}
          >
            {SUBTITLE_MODES.map((mode) => (
              <RadioItem key={mode.value} value={mode.value}>
                <span>{mode.label}</span>
              </RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Root>
      <Menu.Item className={cn('media-menu-item', 'voca-menu-replay')} onSelect={lab.replay}>
        <span className={'media-menu-trigger-icon'} aria-hidden="true" />
        <span>Replay sentence</span>
      </Menu.Item>
      <Menu.CheckboxItem
        className={cn('media-menu-item', 'voca-menu-checkbox')}
        checked={lab.autoPause}
        onCheckedChange={lab.setAutoPause}
      >
        <span className={'media-menu-trigger-icon'} aria-hidden="true" />
        <span>Pause per line</span>
        <Menu.ItemIndicator forceMount className={'media-menu-indicator'} checked={lab.autoPause}>
          <CheckIconPrimitive className={'media-menu-radio-icon'} />
        </Menu.ItemIndicator>
      </Menu.CheckboxItem>
      <Menu.CheckboxItem
        className={cn('media-menu-item', 'voca-menu-checkbox')}
        checked={lab.repeat}
        onCheckedChange={lab.setRepeat}
      >
        <span className={'media-menu-trigger-icon'} aria-hidden="true" />
        <span>Repeat segment</span>
        <Menu.ItemIndicator forceMount className={'media-menu-indicator'} checked={lab.repeat}>
          <CheckIconPrimitive className={'media-menu-radio-icon'} />
        </Menu.ItemIndicator>
      </Menu.CheckboxItem>
    </>
  );
}

export function SettingsMenu() {
  return (
    <Menu.Root side="top" align="center">
      <ButtonTooltip label={<TextPrimitive token={settingsText.key}>{settingsText.text}</TextPrimitive>}>
        <Menu.Trigger render={<Button />}>
          <GearIconPrimitive className={'media-button-icon'} />
          <TextPrimitive className={'media-settings-button-label'} token={settingsText.key}>
            {settingsText.text}
          </TextPrimitive>
        </Menu.Trigger>
      </ButtonTooltip>
      <Menu.Popup keepMounted className={cn('media-popup', 'media-popup-safe-area', 'media-menu-popup')}>
        <Menu.Content className={'media-menu-content'}>
          <PlaybackRateMenu />
          <QualityMenu />
          <LessonMenu />
          <AudioTrackMenu />
          <CaptionsMenu />
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}
