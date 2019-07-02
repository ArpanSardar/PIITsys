import {
    USER_LOADING,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
    REGISTER_SUCCESS,
    REGISTER_FAIL
} from '../Actions/types'
import { returnErrors } from './errorActions';
import {
    firebaseService,
    auth, database
} from "../Service/FirebaseConfig";


export const loadUserData = (id) => dispatch => {
    dispatch({ type: USER_LOADING });
    database
        .collection('CompanyUserProfile')
        .doc(id).get()
        .then(doc => {
            var data = doc.data();
            dispatch({
                type: USER_LOADED,
                payload: data
            });
        })
        .catch(err => {
            console.log('User data load error: ', err);
            dispatch(returnErrors('Error during user data load.'));
            dispatch({
                type: AUTH_ERROR
            });
        })
};

export const login = (email, password) => dispatch => {
    // dispatch({type: USER_LOADING});
    auth
        .signInWithEmailAndPassword(email, password)
        .then((u) => {
            dispatch({
                type: LOGIN_SUCCESS,
                payload: u.user.uid
            });
        })
        .catch((error) => {
            console.log('Errror during login:', error);
            dispatch(returnErrors(error.message));
            dispatch({
                type: LOGIN_FAIL
            });
        });
};

export const register = (email, password) => dispatch => {
  // dispatch({type: USER_LOADING});
  return new Promise((resolve, reject) => {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then(u => {
        let userId = u.user.uid;

        var docData = {
          id: userId,
          ownProfileComplete: false,
          companyProfileComplete: false,
          role: "Admin",
          companyId: "",
          name: "",
          email: email,
          phoneNumber: "",
          active: true,
          emailVerified: true
        };

        var monitorData = {
          event: "Account Registration",
          email: email,
          userId: userId,
          Date: new Date()
        };
        database
          .collection("CompanyUserProfile")
          .doc(userId)
          .set(docData)
          .then(function() {
            database
              .collection("ActivityMonitor")
              .doc("CompanyUserRegistration")
              .update({
                CompanyUser: firebaseService.firestore.FieldValue.arrayUnion(
                  monitorData
                )
              });
          })
          .then(res => {
            dispatch({
              type: REGISTER_SUCCESS,
              payload: userId
            });
            resolve(res);
            // sessionStorage.setItem("userID", u.user.uid);
          });
      })
      .catch(error => {
        console.log("Errror during registration:", error);
        dispatch(returnErrors(error.message));
        dispatch({
          type: REGISTER_FAIL
        });
        resolve(error);
      });
  });
};

export const logout = () => {
    // dispatch({type: USER_LOADING});
    auth.signOut();
    return {
        type: LOGOUT_SUCCESS
    }
};
