import  "./index.scss";
import UI from './ui';
const bootstrap = require('bootstrap')

const ui = new UI();

ui.navButtonListener();


(async()=>{
  ui.popEnv();
  await ui.initialScreen();

})()