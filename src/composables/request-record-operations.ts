import { Ref } from "vue";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  Timestamp,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { db, getCurrentUser } from "@/settings/firebase";
import { DocumentRequest } from "@/modules/document-requests";

///////////////
// create
///////////////
export const createRequestToFirestore = async (
  type: number,
  target: string,
  message: string
): Promise<DocumentRequest | null> => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return null;

  const userRecordsRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRecordsRef);
  if (!userSnap.exists()) return null;
  const currentDate = Timestamp.now();
  const newRequestRef = doc(collection(db, "requests"));
  const newRequestData = {
    uid,
    type,
    time: currentDate,
    target,
    message,
    status: 0,
  };
  await setDoc(newRequestRef, newRequestData);
  // リロードなしで使えるようにする.
  const newRec = new DocumentRequest(
    newRequestRef.id,
    uid,
    type,
    target,
    currentDate,
    message,
    0
  );
  return newRec;
};

///////////////
// read
///////////////
export const getAllRequestByUser = async (
  requestList: Ref<DocumentRequest[]>
) => {
  // あるユーザーに対するリクエストをすべて取得する.
  // fetch data from firestore
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return;
  const requestsQuery = query(
    collection(db, "requests"),
    where("uid", "==", uid)
  );
  const querySnapshot = await getDocs(requestsQuery);
  querySnapshot.forEach((doc) => {
    const docData = doc.data();
    const newReq = new DocumentRequest(
      doc.id,
      docData.userId,
      docData.type,
      docData.target,
      docData.time,
      docData.message,
      docData.status
    );
    requestList.value.push(newReq);
  });
};

export const getRequestByUserAndTarget = async (
  requestList: Ref<DocumentRequest[]>,
  target: string
) => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return;
  const requestsQuery = query(
    collection(db, "requests"),
    where("uid", "==", uid),
    where("target", "==", target)
  );
  const querySnapshot = await getDocs(requestsQuery);
  querySnapshot.forEach((doc) => {
    const docData = doc.data();
    const newReq = new DocumentRequest(
      doc.id,
      docData.userId,
      docData.type,
      docData.target,
      docData.time,
      docData.message,
      docData.status
    );
    requestList.value.push(newReq);
  });
};

///////////////
// update
///////////////
const updateRequest = async (
  requestId: string,
  newMessage: string
): Promise<void | null> => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return null;
  await updateDoc(doc(db, "requests", requestId), {
    message: newMessage,
  });
};
/** コンポーネント内でリストから修正するオブジェクトを探して修正する処理をまとめたもの.
 * 引数を渡すだけの最低限のコードだけで動くようにする.
 * @param requestId
 * @param requestList
 */
export const modifyRequestInterface = async (
  requestId: string,
  requestList: Ref<DocumentRequest[]>
) => {
  const modifyingReq = requestList.value.find((req) => {
    return req.id === requestId;
  });
  if (modifyingReq === undefined) {
    alert("修正できません。");
    return;
  }
  const modifiedMessage = window.prompt(
    "メッセージを修正してください。",
    modifyingReq.message
  );
  if (modifiedMessage !== null && modifiedMessage !== "") {
    if (confirm("以下の内容を登録しますか？" + `\n${modifiedMessage}`)) {
      await updateRequest(requestId, modifiedMessage);
      modifyingReq.message = modifiedMessage;
    }
  }
};

///////////////
// delete
///////////////
const deleteRequestFromFirestore = async (
  requestId: string
): Promise<void | null> => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return null;
  await deleteDoc(doc(db, "requests", requestId));
};
/**
 * 修正と同様に消去の処理をまとめたもの.
 * @param requestId
 * @param requestList
 */
export const deleteRequestInterface = async (
  requestId: string,
  requestList: Ref<DocumentRequest[]>
) => {
  if (confirm("削除しますか？")) {
    await deleteRequestFromFirestore(requestId);
    const newList = requestList.value.filter((req) => {
      return req.id !== requestId;
    });
    requestList.value = newList;
  }
};
