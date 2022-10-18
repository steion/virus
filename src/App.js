import React, { useState, useEffect } from 'react';

import {
  View,
  Panel,
  CardGrid,
  Card,
  Root,
  Div,
  Button,
  Avatar,
  Snackbar,
  Group,
  SimpleCell,
  PanelHeader,
  ConfigProvider,
  ScreenSpinner,
  PullToRefresh,
  ModalRoot,
  ModalCard
} from '@vkontakte/vkui';

import bridge from '@vkontakte/vk-bridge';

import {
  disableBodyScroll
} from 'body-scroll-lock';

import Icon20Stars from '@vkontakte/icons/dist/20/stars';
import Icon20CancelCircleFillRed from '@vkontakte/icons/dist/20/cancel_circle_fill_red';
import Icon28ReplyOutline from '@vkontakte/icons/dist/28/reply_outline';
import Icon28StoryOutline from '@vkontakte/icons/dist/28/story_outline';
import Icon16User from '@vkontakte/icons/dist/16/user';
import Icon24Fire from '@vkontakte/icons/dist/24/fire';
import Icon24Report from '@vkontakte/icons/dist/24/report';
import Icon16Done from '@vkontakte/icons/dist/16/done';

import Virus from './images/virus.svg';
import Nutri from './images/nutri.svg';

import { socket } from "./config";

let dev = false;

const decl = (n, titles) => titles[(n%10===1 && n%100!==11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)];
const stages = ["start", "info", "finish"];

socket.emit("login", window.location.search);

export default () => {
  const [activeView, setView] = useState("home");
  const [snackbar, setSnackbar] = useState();
  const [isFetching, setFetching] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [platform, setPlatform] = useState(Object.fromEntries(new URLSearchParams(window.location.search)).vk_platform);
  const [fetchedUser, setFetchedUser] = useState();
  const [infected, setInfected] = useState(null);
  const [card, setCard] = useState(true);
  const [user, setUser] = useState(null);
  const [signError, setSignError] = useState(false);
  const [activeStage, setStageIntro] = useState(0);
  const [activeModal, setModal] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [history, setHistory] = useState(['home']);
  const [popout, setPopout] = useState(!dev ? <ScreenSpinner /> : null);
  
  const goBack = () => {
    if(history.length === 1) {
      bridge.send("VKWebAppClose", {
        "status": "success"
      });
    } else if(history.length > 1) {
      history.pop();
      
      setView(history[history.length - 1]);
    }
  }
  
  const copyLink = async () => {
    try {
      bridge.send('VKWebAppCopyText', {
        text: !dev ? "https://vk.com/app7722330#"+fetchedUser.id : "https://vk.com/app7722330#483313209"
      });
      
      setSnackbar(<Snackbar
          onClose={() => setSnackbar(null)}
          before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#FFFFFF" width={14} height={14} /></Avatar>}
        >
          Ссылка скопирована!
        </Snackbar>
      );
    } catch(e) {
      setSnackbar(<Snackbar
          onClose={() => setSnackbar(null)}
          before={<Icon20CancelCircleFillRed width={24} height={24} />}
        >
          Неизвестная ошибка!
        </Snackbar>
      );
    }
  };
  
  const shareWall = () => {
    bridge.send("VKWebAppShowWallPostBox",
      {
        "message": "🔥 Переходи по ссылке и получай монетки! Да-да! Именно монетки! Вот ссылка: https://vk.com/app7722330#"+fetchedUser.id
      }
    )
  }
  
  const shareStory = () => {
    bridge.sendPromise("VKWebAppShowStoryBox",
      {
        background_type: "image",
        url : "https://sun9-2.userapi.com/impf/C5-4xiXDmFrX8iy86Qr3rZymB5jR3IZFeXsMwA/HRm-NZJmqFQ.jpg?size=608x1080&quality=96&sign=bd5794feccd727c41a0f0adb29e61768&c_uniq_tag=rN3pfYYU3pAP6tTsfUyYwOtB5J9qc81ia6HRDujYczQ&type=album",
        attachment: {
          text: "go_to",
          type: "url",
          url: "https://vk.com/app7722330#"+fetchedUser.id,
        }
      }
    ).catch((e) => {
      setSnackbar(<Snackbar
          onClose={() => setSnackbar(null)}
          before={<Icon20CancelCircleFillRed width={24} height={24} />}
        >
          Неизвестная ошибка!
        </Snackbar>
      );
    });
  };
  
  const UseTablet = () => {
    if((card && (user.tablets > 0 || user.deathTime > 0))) {
      return (<CardGrid size="l">
        <Card style={{ marginTop: 10, width: "100%"  }} >
          <div style={{ height: "1vmax" }} />
          <span className="homeModal__secondText">{user.deathTime > 0 ? "Вам осталось жить" : "Вы умерли"}</span><br/> <span className="homeModal__count">{date(user.deathTime)}</span>
          {user.tablets > 0 && (<SimpleCell className="cell" onClick={() => socket.emit("useTablet")} >
            <div className="center">
              <div style={{ width: "4vmax", height: "4vmax" }} className="circle">
                <Icon20Stars width={28} height={28} fill="#0092FF" />
              </div>
              
              <span style={{ paddingLeft: "1vmax" }} className="useTablet">Использовать таблетку</span>
            </div>
          </SimpleCell>)}
          
        </Card>
      </CardGrid>)
    }
  }
  // eslint-disable-next-line no-unused-vars
  const HomeModal = () => {
    return (<div className="modal">
      <div className="homeModal">
        <div style={{ height: "2vmax" }} />
        
        <CardGrid>
          <Card style={{ marginTop: 10, width: "100%", height: "10vmax" }} >
            <div style={{ height: "1vmax" }} />
            
            <span className="homeModal__secondText">Вы заразили</span><br/> <span className="homeModal__count">{user.infectedCount} {decl(user.infectedCount,  ["человека", "человека", "человек"])}</span>
          </Card>
        </CardGrid>
        
        {UseTablet()}
        
        <div style={{ height: "2vmin" }} />
        
        <CardGrid>
          <Card style={{ marginTop: 10, width: "100%"  }} >
            <Div>
              <Button stretched size="l" onClick={copyLink} mode="outline">Получить ссылку</Button>
            </Div>
            
            <Div>
              <Button stretched size="l" onClick={() => go("repost")} mode="outline">Поделиться ссылкой</Button>
            </Div>
            
            {user.rewarded === false && (<Div>
              <Button stretched size="l" onClick={() => showAd()} mode="outline">Получить таблетку</Button>
            </Div>)}
          </Card>
        </CardGrid>
      </div>
    </div>);
  }
  
  const go = (page) => {
    window.history.pushState({
      panel: page
    }, page);
    
    setView(page);
    
    history.push(page);
  }
  
  const showAd = () => {
    if(user.rewarded === false) {
      if(platform !== "mobile_web") {
        bridge.send("VKWebAppShowNativeAds", {
          ad_format: "reward"
        }).then((res) => {
          if(res.result === true) {
            socket.emit("freeTablet");
          } else {
            setSnackbar(<Snackbar
                onClose={() => setSnackbar(null)}
                before={<Icon20CancelCircleFillRed width={24} height={24} />}
              >
                Вы не посмотрели рекламу!
              </Snackbar>
            );
          }
        }).catch((err) => {
          setSnackbar(<Snackbar
              onClose={() => setSnackbar(null)}
              before={<Icon20CancelCircleFillRed width={24} height={24} />}
            >
              Следующую таблетку можно получить через 15 минут!
            </Snackbar>
          );
        });
      } else {
        socket.emit("freeTablet");
      }
    } else {
      setSnackbar(<Snackbar
          onClose={() => setSnackbar(null)}
          before={<Icon20CancelCircleFillRed width={24} height={24} />}
        >
          Следующую таблетку можно получить через 15 минут!
        </Snackbar>
      );
    }
  }
  
  const endIntro = () => {
    setView("home");
    
    socket.emit("endIntro");
  }
  
  socket.on("user", (userObject) => {
    setUser(userObject);
    
    setInfected(userObject.infected);
    
    if(userObject.dead === true) setCard(false);
  });
  
  socket.on("errorMessage", (error) => {
    if(error.code === 1) {
      if(!snackbar) setSnackbar(<Snackbar
          onClose={() => setSnackbar(null)}
          before={<Icon20CancelCircleFillRed width={24} height={24} />}
        >
          Не так быстро!
        </Snackbar>
      );
    } else if(error.code === 2) {
      setSnackbar(<Snackbar
          onClose={() => setSnackbar(null)}
          before={<Icon20CancelCircleFillRed width={24} height={24} />}
        >
          Следующую таблетку можно получить через 15 минут!
        </Snackbar>
      )
    } else if(error.code === 3) {
      setSignError(true);
      setUser({});
    } else if(error.code === 4) {
      go("alreadyOnline");
      setUser({});
    }
  });
  
  const closeModal = () => {
    setModal(null);
    setCard(false);
    
    socket.emit("viewed");
  }
  
  const modal = (
    <ModalRoot activeModal={activeModal}>
      <ModalCard onClose={closeModal} id="dead" icon={<Icon20CancelCircleFillRed width={56} height={56} />} header="Вы умерли">
        <div style={{ height: "2vmax" }} />
        <Button size="l" onClick={closeModal} mode="outline">Жаль</Button>
      </ModalCard>
    </ModalRoot>
  );
  
  useEffect(() => {
    const fetchData = async () => {
      bridge.sendPromise('VKWebAppGetUserInfo').then((res) => {
        setFetchedUser(res);
        setPopout(null);
      });
    }
    
    fetchData();
    
    disableBodyScroll(document.body);
    
    window.addEventListener('popstate', () => {
      if(activeView !== "offline") goBack()
    });
    
    window.addEventListener(
      'offline', 
      () => {
        socket.close();
        go("offline");
      }
    );
    
    window.addEventListener(
      'online',
      () => {
        socket.open();
        
        goBack();
      }
    );
    
    let hash = window.location.hash;
    
    if(hash) {
      setPopout(null);
      socket.emit("infected", hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  useEffect(() => {
    setTimeout(() => {
      bridge.sendPromise("VKWebAppShowNativeAds", {
        ad_format: "preloader"
      })
    }, 1000);
  }, [fetchedUser]);
  
  return user && (signError === false ? (user.intro === true ? (
    <ConfigProvider isWebView={true} scheme="bright_light">
      <Root activeView={activeView}>
        <View id="home" activePanel="home" history={history} modal={modal} onSwipeBack={goBack} popout={popout}>
          <Panel id="home">
            <PullToRefresh isFetching={isFetching} onRefresh={() => { setTimeout(() => {setFetching(false)}, 3000); setFetching(true); socket.emit("user");} }>
            <img src={Virus} className="virusImg" alt="Вирус" />
            
            <div style={{ textAlign: "center" }}>
              <span className="virusText PanelHeader__content">
                Вирус
              </span>
            </div>
            
            {user.dead === true ? (<div className="modal">
              <div className="homeModal">
                <div style={{ height: "2vmax" }} />
                <div className="fuckingCenter">
                  <div style={{ height: "5vmax" }} />
                  <CardGrid>
                    <Card style={{ marginTop: 10, width: "100%"  }} >
                      <Div>
                        <div style={{ height: "3vmax" }} />
                        
                        <Icon24Report className="img" fill="#E61D00" width={100} height={100} />
                        
                        <span className="homeModal__count">
                          Вы умерли :(
                        </span>
                        
                        <div style={{ height: "1vmin" }} />
                        
                        <span className="homeModal__secondText">
                          Вы не можете возродиться
                        </span>
                        
                        <div style={{ height: "3vmax" }} />
                      </Div>
                    </Card>
                  </CardGrid>
                </div>
              </div>
            </div>) : (HomeModal())}
            
            {snackbar}
            </PullToRefresh>
          </Panel>
        </View>
        
        <View id="offline" activePanel="offline" modal={modal} popout={popout}>
          <Panel id="offline">
            <div className="white__background">
              <div className="center">
                <img alt="Нет интернета" src={Nutri} className="nutriImg" style={{ width: "30vmax", height: "30vmax" }} />
                
                <div className="intro__text" style={{ textAlign: "center", marginTop: "5vmax" }}>
                  Куда то пропал интернет! Найдите его поскорее!
                </div>
              </div>
            </div>
          </Panel>
        </View>
        
        <View id="alreadyOnline" activePanel="alreadyOnline" history={history} modal={modal} onSwipeBack={goBack} popout={popout}>
          <Panel id="alreadyOnline">
            <div className="white__background">
              <div className="fuckingCenter">
                <img alt="Уже онлайн" src={Nutri} className="nutriImg" style={{ width: "30vmax", height: "30vmax" }} />
                
                <div className="intro__text" style={{ textAlign: "center", marginTop: "5vmax" }}>
                  Вы уже в приложении. Может быть с другого устройства?
                </div>
              </div>
            </div>
          </Panel>
        </View>
        
        <View id="repost" activePanel="repost" history={history} modal={modal} onSwipeBack={goBack} popout={popout}>
          <Panel id="repost">
            <div className="white__background">
              <PanelHeader>Поделиться</PanelHeader>
              
              <Div>
                <CardGrid>
                  <Card size="l">
                    <div style={{ paddingBottom: "1vmax" }}>
                      <Group>
                        <SimpleCell
                          before={<Icon28StoryOutline fill="#0092FF" />}
                          onClick={shareStory}
                        >
                          В историю
                        </SimpleCell>
                      </Group>
                      
                      <Group>
                        <SimpleCell
                          before={<Icon28ReplyOutline fill="#0092FF" />}
                          onClick={shareWall}
                        >
                          На стену
                        </SimpleCell>
                      </Group>
                      
                      <Div>
                        <Button stretched size="l" onClick={() => goBack()} mode="outline">Отмена</Button>
                      </Div>
                    </div>
                  </Card>
                </CardGrid>
              </Div>
            </div>
          </Panel>
        </View>
      </Root>
    </ConfigProvider>
  ) : (
    <View activePanel={stages[activeStage]} history={history} modal={modal} onSwipeBack={goBack} popout={popout}>
      <Panel id="start">
        <div className="white__background">
          <div className="fuckingCenter">
            <Icon24Report className="img" fill="#E61D00" width={100} height={100} />
            
            <div className="intro__text" style={{ textAlign: "center", marginTop: "2vmax" }}>
              Привет!<br /><br />
              {infected && infected.id > 0 ? `${infected.firstName} заразил тебя! У тебя есть несколько часов чтобы вылечиться!` : `Привет! В этом приложении ты должен заражать своих друзей путём распространения заражённой ссылки.`}<br />
              Пей таблетки, заражай других людей, и живи!
            </div>
            
            <Div>
              <Button stretched size="l" onClick={() => setStageIntro(1)} mode="outline">А что мне вообще делать?</Button>
            </Div>
          </div>
        </div>
      </Panel>
      
      <Panel id="info">
        <div className="white__background">
          <div className="fuckingCenter">
            <Icon16User className="img" fill="#0092FF" width={100} height={100} />
            
            <div className="intro__text" style={{ textAlign: "center", marginTop: "2vmax" }}>
              Используй таблетки или зарази человека чтобы продлить срок жизни.<br />
              Чтобы заразить человека, ему нужно перейти по заражённой ссылке.<br />
              За каждого заражённого у вас есть шанс получить таблетку.
            </div>
            
            <Div>
              <Button stretched size="l" onClick={() => setStageIntro(2)} mode="outline">Ммм, интересненько.</Button>
            </Div>
          </div>
        </div>
      </Panel>
      
      <Panel id="finish">
        <div className="white__background">
          <div className="fuckingCenter">
            <Icon24Fire className="img" fill="#FFBE00" width={100} height={100} />
            
            <div className="intro__text" style={{ textAlign: "center", marginTop: "2vmax" }}>
              Если вы всё таки умерли вас уже нечего не спасёт.<br /><br />
              На этом всё, постарайся выжить!
            </div>
            
            <Div>
              <Button stretched size="l" onClick={() => endIntro()} mode="outline">Понятно!</Button>
            </Div>
          </div>
        </div>
      </Panel>
    </View>
  )) : (
    <View activePanel="err" history={history} modal={modal} onSwipeBack={goBack} popout={popout}>
      <Panel id="err">
        <div className="white__background">
          <div className="fuckingCenter">
            <img alt="Что-то не так" src={Nutri} className="nutriImg" style={{ width: "30vmax", height: "30vmax" }} />
            
            <div className="intro__text" style={{ textAlign: "center", marginTop: "5vmax" }}>
              Что-то не так.
            </div>
          </div>
        </div>
      </Panel>
    </View>
  ));
}

function date(stamp) {
  stamp = stamp / 1000;

  let s = stamp % 60;
  stamp = ( stamp - s ) / 60;

  let m = stamp % 60;
  stamp = ( stamp - m ) / 60;

  let h = ( stamp ) % 24;
  let d = ( stamp - h ) / 24;

  let text = ``;

  if(d > 0) text += Math.floor(d) + " д. ";
  if(h > 0) text += Math.floor(h) + " ч. ";
  if(m > 0) text += Math.floor(m) + " мин. ";
  if(s > 0 && text === ``) text += Math.floor(s) + " с.";

  return text;
}