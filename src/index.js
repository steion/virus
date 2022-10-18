import 'core-js/features/map';
import 'core-js/features/set';

import * as React from 'react';
import ReactDOM from 'react-dom';

import bridge from '@vkontakte/vk-bridge';

import '@vkontakte/vkui/dist/vkui.css';
import './css/main.css';
import App from './App';

import { socket } from "./config";

bridge.send("VKWebAppInit");
bridge.send("VKWebAppInitAds");

bridge.subscribe(e => {
  console.log(`VKBridge: ${e.detail.type}`);
  console.log(socket);

  //switch (e.detail.type) {
    //case "VKWebAppUpdateConfig":
      //const scheme: string = e.detail.data.scheme ? e.detail.data.scheme : "client_light";
      //document.body.setAttribute("scheme", scheme);
      //break;

    //default: return;
  //}
});

ReactDOM.render(<App />, document.getElementById("root"));