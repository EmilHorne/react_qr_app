import ls from 'local-storage';
import getUserId from "./getUserId";

function getExpList() {
  let lsKey = 'LD_Exp_List_' + getUserId();
  let expList = ls.get(lsKey);
  if (expList) {
    expList = JSON.parse(expList);
  } else {
    expList = [];
  }
  return expList;
}

export default getExpList;