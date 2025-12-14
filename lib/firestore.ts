import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
    type Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

// --- Types ---

export interface HistoryItem {
    id?: string;
    userId: string;
    originalText: string;
    translatedText: string;
    sourceLang: string;
    targetLang: string;
    createdAt: Timestamp;
}

export interface TemplateItem {
    id?: string;
    userId: string;
    title: string;
    text: string;
    createdAt: Timestamp;
}

// --- History Services ---

export const addHistory = async (item: Omit<HistoryItem, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "history"), {
            ...item,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding history: ", e);
        throw e;
    }
};

export const getHistory = async (userId: string) => {
    const q = query(
        collection(db, "history"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as HistoryItem[];
};

// --- Template Services ---

export const addTemplate = async (item: Omit<TemplateItem, "id" | "createdAt">) => {
    try {
        const docRef = await addDoc(collection(db, "templates"), {
            ...item,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding template: ", e);
        throw e;
    }
};

export const getTemplates = async (userId: string) => {
    const q = query(
        collection(db, "templates"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as TemplateItem[];
};

export const deleteTemplate = async (id: string) => {
    try {
        await deleteDoc(doc(db, "templates", id));
    } catch (e) {
        console.error("Error deleting template: ", e);
        throw e;
    }
};
