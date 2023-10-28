import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  vk_token: process.env.vk_access_token,
  vk_grp_id: process.env.vk_group_id,
  vk_pf_ignore: process.env.profile_to_ignore
};

export default config;
