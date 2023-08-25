// import { WebClient } from 'https://deno.land/x/slack_web_api/mod.js';
import { WebClient } from '@slack/web-api';
export const slackClient = new WebClient(process.env.REACT_APP_SLACK_BOT_TOKEN);
// export const slackClient = new WebClient("xoxb-5007811644596-4990999220567-kAUEIiYHAs92fAFKcfaxMVQm");