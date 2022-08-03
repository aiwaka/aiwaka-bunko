import { QueryDocumentSnapshot, SnapshotOptions } from "@firebase/firestore";
import { DocumentContent } from "@/modules/document-content";

export const documentConverter = {
  toFirestore: (document: DocumentContent) => {
    return {
      title: document.title,
      id: document.id,
      update: document.update,
      description: document.description,
      notes: document.notes,
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): DocumentContent => {
    const data = snapshot.data(options);
    return new DocumentContent(
      snapshot.id,
      data.id,
      data.title,
      data.update,
      data.description,
      data.notes
    );
  },
};
