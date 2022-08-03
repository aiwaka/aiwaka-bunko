import { collection, doc, getDoc, getDocs, query } from "@firebase/firestore";
import { Ref } from "vue";
import { db } from "@/settings/firebase";
import { DocumentContent } from "@/modules/document-content";
import { documentConverter } from "./firestore-converter";

export const getAllContents = async (list: Ref<DocumentContent[]>) => {
  // 全件取得
  const filesQuery = query(
    collection(db, "files").withConverter(documentConverter)
  );
  const querySnapshot = await getDocs(filesQuery);
  const allContentsNum = querySnapshot.size;
  const docs = querySnapshot.docs;
  // num件分だけlistに格納する
  docs.forEach((doc) => {
    list.value.push(doc.data());
  });

  return allContentsNum;
};

export const getOneContent = async (
  urlStr: string
): Promise<DocumentContent | null> => {
  const docRef = doc(db, "files", urlStr).withConverter(documentConverter);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};
