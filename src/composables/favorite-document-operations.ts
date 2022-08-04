import { DocumentContent } from "@/modules/document-content";
import {
  FavoriteDocumentRelation,
  makeFavoriteDocumentRelation,
} from "@/modules/favorite-documents";
import { db, getCurrentUser } from "@/settings/firebase";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { Ref } from "vue";
import {
  documentConverter,
  favoriteDocumentConverter,
} from "./firestore-converter";
import { getUserName } from "./user-record-operations";

///////////////
// create
///////////////
export const createFavoriteToFirestore = async (
  docId: string,
  docName: string
): Promise<FavoriteDocumentRelation | null> => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  const userName = await getUserName();
  if (!uid || !userName) return null;

  const newRequestRef = doc(collection(db, "favoriteDocuments")).withConverter(
    favoriteDocumentConverter
  );
  const newRequestData = {
    uid,
    userName,
    docId,
    docName,
  };
  await setDoc(newRequestRef, newRequestData);
  // リロードなしで使えるようにする.
  const newRec = makeFavoriteDocumentRelation(newRequestRef.id, newRequestData);
  return newRec;
};

///////////////
// read
///////////////
// const getFavDocIdListByUser = async () => {
//   const user = await getCurrentUser();
//   const uid = user?.uid;
//   if (!uid) return;
//   // まずお気に入りのidリストを取得
//   const favoriteQuery = query(
//     collection(db, "favoriteDocuments"),
//     where("uid", "==", uid)
//   ).withConverter(favoriteDocumentConverter);
//   const favoriteQuerySnapshot = await getDocs(favoriteQuery);
//   const docIdList: string[] = [];
//   favoriteQuerySnapshot.forEach((doc) => {
//     docIdList.push(doc.data().docId);
//   });
//   return docIdList;
// };
/**
 * 現在のユーザーがfavに入れている文書のidのリストを格納する.
 * @param documentIdList - 文書リストのidのVueリファレンス
 */
export const setAllFavDocIdListByUser = async (
  documentIdList: Ref<string[]>
) => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return;
  // お気に入りのidリストを取得
  const favoriteQuery = query(
    collection(db, "favoriteDocuments"),
    where("uid", "==", uid)
  ).withConverter(favoriteDocumentConverter);
  const favoriteQuerySnapshot = await getDocs(favoriteQuery);
  favoriteQuerySnapshot.forEach((doc) => {
    documentIdList.value.push(doc.data().docId);
  });
};
/**
 * 現在のユーザーがfavに入れている文書のリストを格納する.
 * @param documentList - 文書リストのVueリファレンス
 */
export const setAllFavDocByUser = async (
  documentList: Ref<DocumentContent[]>
) => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return;
  // まずお気に入りのidリストを取得
  const favoriteQuery = query(
    collection(db, "favoriteDocuments"),
    where("uid", "==", uid)
  ).withConverter(favoriteDocumentConverter);
  const favoriteQuerySnapshot = await getDocs(favoriteQuery);
  const docIdList: string[] = [];
  favoriteQuerySnapshot.forEach((doc) => {
    docIdList.push(doc.data().docId);
  });
  // idリストを使ってドキュメントのリストを取得
  const documentQuery = query(
    collection(db, "files"),
    where(documentId(), "in", docIdList)
  ).withConverter(documentConverter);
  const documentQuerySnapshot = await getDocs(documentQuery);
  documentQuerySnapshot.forEach((doc) => {
    documentList.value.push(doc.data());
  });
};

/**
 * 指定された文書が現在のユーザーのお気に入りに入っているかをVueの変数にセットする.
 * @param docId
 * @param favorite
 * @returns
 */
// export const setIfDocumentInFavorite = async (
//   docId: string,
//   favorite: Ref<boolean>,
// ) => {
//   const user = await getCurrentUser();
//   const uid = user?.uid;
//   if (!uid) return;

//   const favoriteQuery = query(
//     collection(db, "favoriteDocuments"),
//     where("uid", "==", uid),
//     where("docId", "==", docId)
//   ).withConverter(favoriteDocumentConverter);
//   const querySnapshot = await getDocs(favoriteQuery);
//   let result = false;
//   querySnapshot.forEach((doc) => {
//   });
// };

///////////////
// delete
///////////////
export const deleteFavoriteFromFirestore = async (
  relationId: string
): Promise<void | null> => {
  const user = await getCurrentUser();
  const uid = user?.uid;
  if (!uid) return null;
  await deleteDoc(doc(db, "favoriteDocuments", relationId));
};
