// Discord User Object Type
export interface DiscordUser {
  id: string; // snowflake
  username: string;
  discriminator: string;
  global_name?: string;
  avatar?: string;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string;
  accent_color?: number;
  locale?: string;
  verified?: boolean;
  email?: string;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration_data?: any; // avatar decoration data object
  collectibles?: any; // collectibles object
  primary_guild?: any; // user primary guild object
}

// Discord Message Object Type
export interface DiscordMessage {
  id: string; // snowflake
  channel_id: string; // snowflake
  author: DiscordUser;
  content: string;
  timestamp: string; // ISO8601 timestamp
  edited_timestamp?: string | null; // ISO8601 timestamp or null
  tts: boolean;
  mention_everyone: boolean;
  mentions: DiscordUser[];
  mention_roles: string[]; // array of role object ids
  mention_channels?: any[]; // array of channel mention objects
  attachments: DiscordAttachment[]; // array of attachment objects
  embeds: DiscordEmbed[]; // array of embed objects
  reactions?: DiscordReaction[]; // array of reaction objects
  nonce?: number | string;
  pinned: boolean;
  webhook_id?: string; // snowflake
  type: number;
  activity?: DiscordMessageActivity; // message activity object
  application?: DiscordMessageApplication; // partial application object
  application_id?: string; // snowflake
  flags?: number;
  message_reference?: DiscordMessageReference; // message reference object
  message_snapshots?: any[]; // array of message snapshot objects
  referenced_message?: DiscordMessage | null;
  interaction_metadata?: any; // message interaction metadata object
  interaction?: any; // message interaction object (deprecated)
  thread?: DiscordChannel; // channel object
  components?: DiscordComponent[]; // array of message components
  sticker_items?: any[]; // array of message sticker item objects
  stickers?: DiscordSticker[]; // array of sticker objects (deprecated)
  position?: number;
  role_subscription_data?: any; // role subscription data object
  resolved?: any; // resolved data
  poll?: any; // poll object
  call?: any; // message call object
}

// Discord Guild (Server) Object Type
export interface DiscordGuild {
  id: string; // snowflake
  name: string;
  icon?: string;
  icon_hash?: string;
  splash?: string;
  discovery_splash?: string;
  owner?: boolean;
  owner_id: string; // snowflake
  permissions?: string;
  region?: string; // deprecated
  afk_channel_id?: string; // snowflake
  afk_timeout: number;
  widget_enabled?: boolean;
  widget_channel_id?: string; // snowflake
  verification_level: number;
  default_message_notifications: number;
  explicit_content_filter: number;
  roles: DiscordRole[];
  emojis: DiscordEmoji[];
  features: string[];
  mfa_level: number;
  application_id?: string; // snowflake
  system_channel_id?: string; // snowflake
  system_channel_flags: number;
  rules_channel_id?: string; // snowflake
  max_presences?: number;
  max_members?: number;
  vanity_url_code?: string;
  description?: string;
  banner?: string;
  premium_tier: number;
  premium_subscription_count?: number;
  preferred_locale: string;
  public_updates_channel_id?: string; // snowflake
  max_video_channel_users?: number;
  max_stage_video_channel_users?: number;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  welcome_screen?: any; // welcome screen object
  nsfw_level: number;
  stickers?: DiscordSticker[];
  premium_progress_bar_enabled: boolean;
  safety_alerts_channel_id?: string; // snowflake
}

// Discord Channel Object Type
export interface DiscordChannel {
  id: string; // snowflake
  type: number;
  guild_id?: string; // snowflake
  position?: number;
  permission_overwrites?: DiscordPermissionOverwrite[]; // array of permission overwrite objects
  name?: string;
  topic?: string;
  nsfw?: boolean;
  last_message_id?: string; // snowflake
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: DiscordUser[];
  icon?: string;
  owner_id?: string; // snowflake
  application_id?: string; // snowflake
  managed?: boolean;
  parent_id?: string; // snowflake
  last_pin_timestamp?: string;
  rtc_region?: string;
  video_quality_mode?: number;
  message_count?: number;
  member_count?: number;
  thread_metadata?: DiscordThreadMetadata; // thread metadata object
  member?: DiscordThreadMember; // thread member object
  default_auto_archive_duration?: number;
  permissions?: string;
  flags?: number;
  total_message_sent?: number;
  available_tags?: any[]; // array of forum tag objects
  applied_tags?: string[]; // array of snowflakes
  default_reaction_emoji?: any; // default reaction emoji object
  default_thread_rate_limit_per_user?: number;
  default_sort_order?: number;
  default_forum_layout?: number;
}

// Discord Role Object Type
export interface DiscordRole {
  id: string; // snowflake
  name: string;
  color: number;
  hoist: boolean;
  icon?: string;
  unicode_emoji?: string;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  tags?: any; // role tags object
}

// Discord Emoji Object Type
export interface DiscordEmoji {
  id: string; // snowflake
  name: string;
  roles?: string[]; // array of role object ids
  user?: DiscordUser;
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

// Discord Sticker Object Type
export interface DiscordSticker {
  id: string; // snowflake
  pack_id?: string; // snowflake
  name: string;
  description?: string;
  tags: string;
  asset?: string;
  type: number;
  format_type: number;
  available?: boolean;
  guild_id?: string; // snowflake
  user?: DiscordUser;
  sort_value?: number;
}

// Discord Guild Member Object Type
export interface DiscordGuildMember {
  user?: DiscordUser;
  nick?: string;
  avatar?: string;
  roles: string[]; // array of role object ids
  joined_at: string; // ISO8601 timestamp
  premium_since?: string; // ISO8601 timestamp
  deaf: boolean;
  mute: boolean;
  flags: number;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string; // ISO8601 timestamp
}

// Discord Attachment Object Type
export interface DiscordAttachment {
  id: string; // snowflake
  filename: string;
  description?: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url: string;
  height?: number;
  width?: number;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
  flags?: number;
}

// Discord Embed Object Type
export interface DiscordEmbed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string; // ISO8601 timestamp
  color?: number;
  footer?: any; // embed footer object
  image?: any; // embed image object
  thumbnail?: any; // embed thumbnail object
  video?: any; // embed video object
  provider?: any; // embed provider object
  author?: any; // embed author object
  fields?: any[]; // array of embed field objects
}

// Discord Reaction Object Type
export interface DiscordReaction {
  count: number;
  count_details: any; // reaction count details object
  me: boolean;
  me_burst: boolean;
  burst_colors: string[];
  emoji: DiscordEmoji;
}

// Discord Component Types (from https://discord.com/developers/docs/components/)
export const ComponentType = {
  ACTION_ROW: 1,
  BUTTON: 2,
  STRING_SELECT: 3,
  TEXT_INPUT: 4,
  USER_SELECT: 5,
  ROLE_SELECT: 6,
  MENTIONABLE_SELECT: 7,
  CHANNEL_SELECT: 8,
  SECTION: 9,
  TEXT_DISPLAY: 10,
  CONTEXT_MENU: 11,
  MODAL: 12,
  FORM: 13,
  GRID: 14,
  STACK: 15,
} as const;

export type ComponentTypeValue =
  (typeof ComponentType)[keyof typeof ComponentType];

// Action Row Component
export interface DiscordActionRowComponent {
  type: typeof ComponentType.ACTION_ROW;
  components: Exclude<
    DiscordComponent,
    | DiscordActionRowComponent
    | DiscordSectionComponent
    | DiscordGridComponent
    | DiscordStackComponent
  >[];
}

// Button Component
export interface DiscordButtonComponent {
  type: typeof ComponentType.BUTTON;
  id?: string;
  style: 1 | 2 | 3 | 4 | 5; // Primary, Secondary, Success, Danger, Link
  label?: string;
  emoji?: DiscordPartialEmoji;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
}

// String Select Component
export interface DiscordStringSelectComponent {
  type: typeof ComponentType.STRING_SELECT;
  id?: string;
  options: DiscordSelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

// Text Input Component
export interface DiscordTextInputComponent {
  type: typeof ComponentType.TEXT_INPUT;
  id?: string;
  style: 1 | 2; // Short, Paragraph
  label: string;
  placeholder?: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
}

// User Select Component
export interface DiscordUserSelectComponent {
  type: typeof ComponentType.USER_SELECT;
  id?: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

// Role Select Component
export interface DiscordRoleSelectComponent {
  type: typeof ComponentType.ROLE_SELECT;
  id?: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

// Mentionable Select Component
export interface DiscordMentionableSelectComponent {
  type: typeof ComponentType.MENTIONABLE_SELECT;
  id?: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

// Channel Select Component
export interface DiscordChannelSelectComponent {
  type: typeof ComponentType.CHANNEL_SELECT;
  id?: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  channel_types?: number[];
}

// Section Component
export interface DiscordSectionComponent {
  type: typeof ComponentType.SECTION;
  id?: string;
  accessory: DiscordButtonComponent | DiscordThu
  components?: DiscordTextDisplayComponent[];
}

// Input Text Component
export interface DiscordTextDisplayComponent {
  type: typeof ComponentType.TEXT_DISPLAY;
  id? : string
}

// Context Menu Component
export interface DiscordContextMenuComponent {
  type: typeof ComponentType.CONTEXT_MENU;
  id?: string;
  options: DiscordContextMenuOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
}

// Modal Component
export interface DiscordModalComponent {
  type: typeof ComponentType.MODAL;
  id?: string;
  title: string;
  components: DiscordComponent[];
}

// Form Component
export interface DiscordFormComponent {
  type: typeof ComponentType.FORM;
  id?: string;
  title?: string;
  components: DiscordComponent[];
}

// Grid Component
export interface DiscordGridComponent {
  type: typeof ComponentType.GRID;
  custom_id?: string;
  columns?: number;
  components: DiscordComponent[];
}

// Stack Component
export interface DiscordStackComponent {
  type: typeof ComponentType.STACK;
  custom_id?: string;
  components: DiscordComponent[];
}

// Context Menu Option (used in Context Menu)
export interface DiscordContextMenuOption {
  label: string;
  value: string;
  description?: string;
  emoji?: DiscordPartialEmoji;
  default?: boolean;
}

// Select Option (used in String Select)
export interface DiscordSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: DiscordPartialEmoji;
  default?: boolean;
}

// Partial Emoji (used in components)
export interface DiscordPartialEmoji {
  id?: string;
  name?: string;
  animated?: boolean;
}

// Union type for all Discord components
export type DiscordComponent =
  | DiscordActionRowComponent
  | DiscordButtonComponent
  | DiscordStringSelectComponent
  | DiscordTextInputComponent
  | DiscordUserSelectComponent
  | DiscordRoleSelectComponent
  | DiscordMentionableSelectComponent
  | DiscordChannelSelectComponent
  | DiscordSectionComponent
  | DiscordTextDisplayComponent
  | DiscordContextMenuComponent
  | DiscordModalComponent
  | DiscordFormComponent
  | DiscordGridComponent
  | DiscordStackComponent;

export interface DiscordPermissionOverwrite {
  id: string; // snowflake
  type: number;
  allow: string;
  deny: string;
}

// Discord Thread Metadata Object Type
export interface DiscordThreadMetadata {
  archived: boolean;
  auto_archive_duration: number;
  archive_timestamp: string; // ISO8601 timestamp
  locked: boolean;
  invitable?: boolean;
  create_timestamp?: string; // ISO8601 timestamp
}

// Discord Thread Member Object Type
export interface DiscordThreadMember {
  id?: string; // snowflake
  user_id?: string; // snowflake
  join_timestamp: string; // ISO8601 timestamp
  flags: number;
  member?: DiscordGuildMember;
}

// Discord Message Reference Object Type
export interface DiscordMessageReference {
  message_id?: string; // snowflake
  channel_id?: string; // snowflake
  guild_id?: string; // snowflake
  fail_if_not_exists?: boolean;
}

// Discord Message Activity Object Type
export interface DiscordMessageActivity {
  type: number;
  party_id?: string;
}

// Discord Message Application Object Type
export interface DiscordMessageApplication {
  id: string; // snowflake
  name: string;
  icon?: string;
  description?: string;
  cover_image?: string;
}
