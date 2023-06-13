export interface Root {
  response: Response
}

export interface ResponseWall {
 response: {
  count: number
  items: ItemPost[]
 }
}

export interface ResponseWallExec {
  response: ItemPost[]
 }

export interface ItemPost {
  donut: Donut
  is_pinned?: number
  comments: Comments
  marked_as_ads: number
  short_text_rate: number
  hash: string
  type: string
  attachments: Attachment[]
  date: number
  edited?: number
  from_id: number
  id: number
  is_favorite: boolean
  likes: Likes
  owner_id: number
  post_source: PostSource
  post_type: string
  reposts: Reposts
  signer_id?: number
  text: string
  views?: Views
  carousel_offset?: number
}

export interface Donut {
  is_donut: boolean
}

export interface Comments {
  can_post: number
  count: number
}

export interface Attachment {
  type: string
  photo?: Photo
  audio?: Audio
  poll?: Poll
  video?: Video
}

export interface Photo {
  album_id: number
  date: number
  id: number
  owner_id: number
  access_key: string
  post_id?: number
  sizes: Size[]
  text: string
  user_id: number
  has_tags: boolean
}

export interface Size {
  height: number
  type: string
  width: number
  url: string
}

export interface Audio {
  artist: string
  id: number
  owner_id: number
  title: string
  duration: number
  is_explicit: boolean
  is_focus_track: boolean
  track_code: string
  url: string
  date: number
  album_id: number
  main_artists: MainArtist[]
  short_videos_allowed: boolean
  stories_allowed: boolean
  stories_cover_allowed: boolean
}

export interface MainArtist {
  name: string
  domain: string
  id: string
  is_followed: boolean
  can_follow: boolean
}

export interface Poll {
  multiple: boolean
  end_date: number
  closed: boolean
  is_board: boolean
  can_edit: boolean
  can_vote: boolean
  can_report: boolean
  can_share: boolean
  created: number
  id: number
  owner_id: number
  question: string
  votes: number
  disable_unvote: boolean
  anonymous: boolean
  answer_ids: number[]
  embed_hash: string
  answers: Answer[]
  author_id: number
  friends?: Friend[]
}

export interface Answer {
  id: number
  rate: number
  text: string
  votes: number
}

export interface Friend {
  id: number
}

export interface Video {
  response_type: string
  access_key: string
  can_comment: number
  can_like: number
  can_repost: number
  can_subscribe: number
  can_add_to_faves: number
  can_add: number
  comments: number
  date: number
  description: string
  duration: number
  image: Image[]
  first_frame: FirstFrame[]
  width: number
  height: number
  id: number
  owner_id: number
  user_id?: number
  title: string
  is_favorite: boolean
  track_code: string
  type: string
  views: number
  local_views: number
  can_dislike: number
}

export interface Image {
  url: string
  width: number
  height: number
  with_padding?: number
}

export interface FirstFrame {
  url: string
  width: number
  height: number
}

export interface Likes {
  can_like: number
  count: number
  user_likes: number
  can_publish: number
  repost_disabled: boolean
}

export interface PostSource {
  type: string
  platform?: string
}

export interface Reposts {
  count: number
  user_reposted: number
}

export interface Views {
  count: number
}


// !

export interface PostGetById {
  response: PostGetByIdResp
}

export interface PostGetByIdResp {
  items: PostGetByIdItem[]
  profiles: Profile[]
  groups: Group[]
}

export interface PostGetByIdItem {
  donut: Donut
  comments: Comments
  marked_as_ads: number
  short_text_rate: number
  hash: string
  type: string
  attachments: Attachment[]
  date: number
  from_id: number
  id: number
  is_favorite: boolean
  likes: Likes
  owner_id: number
  post_source: PostSource
  post_type: string
  reposts: Reposts
  text: string
}

export interface Donut {
  is_donut: boolean
}

export interface Comments {
  can_post: number
  count: number
}

export interface Attachment {
  type: string
  photo?: Photo
  video?: Video
}

export interface Photo {
  album_id: number
  date: number
  id: number
  owner_id: number
  access_key: string
  post_id?: number
  sizes: Size[]
  text: string
  user_id: number
  has_tags: boolean
}

export interface Size {
  height: number
  type: string
  width: number
  url: string
}

export interface Video {
  response_type: string
  access_key: string
  can_comment: number
  can_like: number
  can_repost: number
  can_subscribe: number
  can_add_to_faves: number
  can_add: number
  comments: number
  date: number
  description: string
  duration: number
  image: Image[]
  id: number
  owner_id: number
  user_id?: number
  title: string
  is_favorite: boolean
  track_code: string
  type: string
  views: number
  platform: string
  can_dislike: number
}

export interface Image {
  url: string
  width: number
  height: number
  with_padding?: number
}

export interface Likes {
  can_like: number
  count: number
  user_likes: number
  can_publish: number
  repost_disabled: boolean
}

export interface PostSource {
  type: string
}

export interface Reposts {
  count: number
  user_reposted: number
}

export interface Profile {
  id: number
  sex: number
  screen_name: string
  photo_50: string
  photo_100: string
  online_info: OnlineInfo
  online: number
  first_name: string
  last_name: string
  can_access_closed: boolean
  is_closed: boolean
}

export interface OnlineInfo {
  visible: boolean
  last_seen: number
  is_online: boolean
  is_mobile: boolean
  app_id?: number
}

export interface Group {
  id: number
  name: string
  screen_name: string
  is_closed: number
  type: string
  is_admin: number
  is_member: number
  is_advertiser: number
  photo_50: string
  photo_100: string
  photo_200: string
}


export interface CommentsResponse {
  response: Comments
}

export interface Comments {
  count: number
  items: CommentsItem[]
  current_level_count: number
  show_reply_button: boolean
}

export interface CommentsItem {
  id: number
  from_id: number
  date: number
  text: string
  post_id: number
  owner_id: number
  parents_stack: any[]
  thread: Thread
}

export interface Thread {
  count: number
  items: CommentsItem[]
  can_post: boolean
  show_reply_button: boolean
}

export interface ThreadResponse {
  response : Thread
}

export interface VkErr {
  error: {
    error_code: number
  }
}

export interface UserResponse {
  response: User[]
}

export interface User {
  id: number
  first_name: string
  last_name: string
  can_access_closed: boolean
  is_closed: boolean
}


export interface GrpInfoResponse {
  response: GrpInfo[]
}

export interface GrpInfo {
  id: number
  name: string
  screen_name: string
  is_closed: number
  type: string
  is_admin: number
  is_member: number
  is_advertiser: number
  photo_50: string
  photo_100: string
  photo_200: string
}
