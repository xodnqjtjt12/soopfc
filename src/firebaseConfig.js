// Firebase SDK 및 Firestore 가져오기
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

// Firebase 프로젝트 설정
const firebaseConfig = {
  apiKey: "AIzaSyBscJpOCQgufKSiEahKFvv5lPpXN5Lpvc8",
  authDomain: "soccer-records.firebaseapp.com",
  projectId: "soccer-records",
  storageBucket: "soccer-records.appspot.com",
  messagingSenderId: "769257022634",
  appId: "1:769257022634:web:650d5d9c41b73933059cd3",
  measurementId: "G-NZLQDKS02C"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 가져오기
export const db = getFirestore(app);
