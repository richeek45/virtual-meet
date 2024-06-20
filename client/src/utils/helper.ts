import { MESSAGE_TYPES, WsDataI } from "@/state/atoms";


export const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (err) {
    return false;
  }
}

export const onLogin = (data: WsDataI, setWsData: (val: WsDataI) => void) => {
  console.log('setting values', data)
  setWsData(data);
}

export const onOfferReceived = () => {

}

export const onAnswerReceived = () => {

}

export const handleMessage = (user: string, data: WsDataI, setWsData: (val: WsDataI) => void) => {

  switch(data.type) {
    case MESSAGE_TYPES.LOGIN: {
      onLogin(data, setWsData);
      break;
    }
    case MESSAGE_TYPES.OFFER: {
      onOfferReceived();
      break;
    }
    case MESSAGE_TYPES.ANSWER: {
      onAnswerReceived();
      break;
    }

  }
}