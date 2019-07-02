import {
    GET_COMPANY_USER_DETAILS,
    UPDATE_COMPANY_USER_DETAILS,
    COMPANY_USER_DATA_LOADING,
    SET_COMPANY_PROFILE_COMPLETE_STATUS,
    SET_OWN_PROFILE_COMPLETE_STATUS
} from './types'
import { getCompanyDetails } from './companyActions';
import { message } from 'antd';
import 'antd/dist/antd.css';

import {
    firebaseService,
    auth, database
} from "../Service/FirebaseConfig";

export const getCompanyUserDetails = (id) => dispatch => {
    // dispatch({ type: COMPANY_USER_DATA_LOADING });
    database
        .collection('CompanyUserProfile')
        .doc(id).get()
        .then(doc => {
            var data = doc.data();
            if (data.companyProfileComplete) { dispatch(getCompanyDetails(data.companyId)); }

            dispatch({
                type: GET_COMPANY_USER_DETAILS,
                payload: data
            });
        }).then(() => {
            dispatch({ type: COMPANY_USER_DATA_LOADING });
        })
        .catch(err => {
            console.log('User data load error: ', err);
            dispatch({
                type: COMPANY_USER_DATA_LOADING
            });
        })
};

export const updateCompanyUserDetails = (user) => dispatch => {
    database
        .collection('CompanyUserProfile')
        .doc(user.id)
        .update({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            ownProfileComplete: user.ownProfileComplete
        })
        .then(() => {
            dispatch({
                type: UPDATE_COMPANY_USER_DETAILS,
                payload: user
            });
            message.success('Data updated successfully');
        })
        .catch(function (error) {
            message.error('Error in updating data !');
        });

};

export const setCompanyProfileCompleteStatus = (newCompanyId) => dispatch => {
    database
        .collection('CompanyUserProfile')
        .doc(sessionStorage.getItem('userID'))
        .update({
            companyId: newCompanyId,
            companyProfileComplete: true
        }).then(() => {
            dispatch({
                type: SET_COMPANY_PROFILE_COMPLETE_STATUS,
                payload: newCompanyId
            });
        });
};

export const setOwnProfileCompleteStatus = (newCompanyId) => dispatch => {
    database
        .collection('CompanyUserProfile')
        .doc(sessionStorage.getItem('userID'))
        .update({
            companyId: newCompanyId,
            ownProfileComplete: true
        }).then(() => {
            dispatch({
                type: SET_OWN_PROFILE_COMPLETE_STATUS,
                payload: newCompanyId
            });
        });
};
