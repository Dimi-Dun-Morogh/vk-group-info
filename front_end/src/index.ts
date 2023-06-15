import  "./index.scss";
import UI from './ui';
const bootstrap = require('bootstrap')

const ui = new UI();
//ui.initialScreen();
ui.navButtonListener();
// ui.fetchScreen();

(async()=>{
  ui.popEnv();
  await ui.initialScreen();
 //ui.topCommentatorScreen();
})()