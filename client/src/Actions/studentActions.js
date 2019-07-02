import {
    GET_ALL_STUDENTS
} from './types'
import {
    firebaseService, storage, database
} from "../Service/FirebaseConfig";
import { message } from 'antd';
import 'antd/dist/antd.css';

export const getAllStudents = () => dispatch => {
    let studentArray = [];
    database
        .collection('StudentProfile')
        .where("active", "==", true)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach(
                (doc) => {
                    studentArray.push(doc.data());
                }
            );
            dispatch({
                type: GET_ALL_STUDENTS,
                payload: studentArray
            });
        })
        .catch(err => {
            console.log('Company data load error: ', err);

        });

};
