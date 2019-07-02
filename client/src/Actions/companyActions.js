import {
    GET_COMPANY_DETAILS,
    ADD_COMPANY_DETAILS,
    UPDATE_COMPANY_DETAILS,
    DATA_LOADING,
    GET_JOBPOSTINGS,
    ADD_JOBPOSTINGS,
    UPDATE_JOBPOSTINGS,
    DELETE_JOBPOSTINGS,
    MAKE_SHORTLISTED
} from './types'
import { setCompanyProfileCompleteStatus } from './companyUserActions';
import store from '../store';
import {
    firebaseService, storage,
    auth, database
} from "../Service/FirebaseConfig";
import { message } from 'antd';
import 'antd/dist/antd.css';

export const getCompanyDetails = (id) => dispatch => {
    // dispatch(setDataLoading());
    database
        .collection('CompanyProfile')
        .doc(id)
        .get()
        .then(doc => {
            var data = doc.data();
            sessionStorage.setItem("accountType", data.paidAccount);
            dispatch({
                type: GET_COMPANY_DETAILS,
                payload: data
            });
        })
        .catch(err => {
            console.log('Company data load error: ', err);
            // dispatch(returnErrors('Error during user data load.'));
            // dispatch({
            //     type: AUTH_ERROR
            // });
        });
    return {
        type: GET_COMPANY_DETAILS,
        // payload: id
    };
};
export const addCompanyDetails = (newCompany) => dispatch => {
    if (newCompany.logo) {
        storage
            .ref()
            .child(`CompanyLogo/${newCompany.id}`)
            .put(newCompany.logoObject)
            .on(
                "state_changed",
                snapshot => {
                    // const progress = Math.round(
                    //     (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    // );
                    // this.setState({ progress });
                },
                err => {
                    console.log('error in logo upload:', err);
                    message.error('Error in uploading company logo !');
                },
                () => {
                    storage
                        .ref()
                        .child(`CompanyLogo/${newCompany.id}`)
                        .getDownloadURL()
                        .then(url => {
                            newCompany.logo = url;
                        })
                        .then(() => {
                            newCompany.logoObject = null; //file object can not be saved to firestore. hence setting null
                            database
                                .collection("CompanyProfile")
                                .doc(newCompany.id)
                                .set(newCompany)
                                .then(() => {
                                    dispatch({
                                        type: ADD_COMPANY_DETAILS,
                                        payload: newCompany
                                    });
                                })
                                .then(() => {
                                    dispatch(setCompanyProfileCompleteStatus(newCompany.id));
                                    message.success('Data added successfully');
                                })
                                .catch(function (error) {
                                    console.log('error in company add:', error);
                                    message.error('Error in adding company details !');
                                });
                        }).catch(function (error) {
                            console.log('error in fetching url:', error);
                            message.error('Error in adding company details !');
                        });
                });
    }
    else {
        database
            .collection("CompanyProfile")
            .doc(newCompany.id)
            .set(newCompany)
            .then(() => {
                dispatch({
                    type: ADD_COMPANY_DETAILS,
                    payload: newCompany
                });
            })
            .then(() => {
                dispatch(setCompanyProfileCompleteStatus(newCompany.id));
                message.success('Data added successfully');
            })
            .catch(function (error) {
                message.error('Error in adding company details !');
            });
    }
};
export const updateCompanyDetails = (company) => dispatch => {
    if (company.logoObject) {
        storage
            .ref()
            .child(`CompanyLogo/${company.id}`)
            .put(company.logoObject)
            .on(
                "state_changed",
                snapshot => {
                    // const progress = Math.round(
                    //     (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    // );
                    // this.setState({ progress });
                },
                err => {
                    console.log('error in logo upload:', err);
                    message.error('Error in uploading company logo !');
                },
                () => {
                    storage
                        .ref()
                        .child(`CompanyLogo/${company.id}`)
                        .getDownloadURL()
                        .then(url => {
                            company.logo = url;
                        })
                        .then(() => {
                            company.logoObject = null; //file object can not be saved to firestore. hence setting null
                            database
                                .collection("CompanyProfile")
                                .doc(company.id)
                                .update({
                                    name: company.name,
                                    email: company.email,
                                    description: company.description,
                                    do: company.do,
                                    website: company.website,
                                    address: company.address,
                                    founder: company.founder,
                                    size: company.size,
                                    industry: company.industry,
                                    logo: company.logo
                                })
                                .then(() => {
                                    dispatch({
                                        type: UPDATE_COMPANY_DETAILS,
                                        payload: company
                                    });
                                    message.success('Data updated successfully');
                                })
                                .catch(function (error) {
                                    console.log('error in company update:', error);
                                    message.error('Error in updating company details !');
                                });
                        }).catch(function (error) {
                            console.log('error in fetching url:', error);
                            message.error('Error in updating company details !');
                        });
                });
    }
    else {
        database
            .collection('CompanyProfile')
            .doc(company.id)
            .update({
                name: company.name,
                email: company.email,
                description: company.description,
                do: company.do,
                website: company.website,
                address: company.address,
                founder: company.founder,
                size: company.size,
                industry: company.industry,
            })
            .then(() => {
                dispatch({
                    type: UPDATE_COMPANY_DETAILS,
                    payload: company
                });
                message.success('Data updated successfully');
            })
            .catch(function (error) {
                message.error('Error in updating data !');
            });
    }

};
export const setDataLoading = () => {
    return {
        type: DATA_LOADING
    };
};

export const getJobPostings = () => {

};
export const addJobPostings = (job) => dispatch => {
    const id = job.id;
    job.id = ""; //Clear company id before save
    database
        .collection("CompanyProfile")
        .doc(id)
        .update({
            jobPostings: firebaseService.firestore.FieldValue.arrayUnion(job)
        })
        .then(() => {
            dispatch({
                type: ADD_JOBPOSTINGS,
                payload: job
            });
        })
        .then(() => {
            message.success('Data added successfully.');
        })
        .catch((err) => {
            console.log('error:', err);
            message.error('Error while adding data !');
        });
};
export const deleteJobPostings = (item) => dispatch => {
    if (item.id) {
        database
            .collection("CompanyProfile")
            .doc(item.id)
            .update({
                jobPostings: item.item
            })
            .then(() => {
                dispatch({
                    type: DELETE_JOBPOSTINGS,
                    payload: item.item
                });
            })
            .then(() => {
                message.warning('Data deleted !');
            })
            .catch(function (error) {
                message.error('Error while removing data !');
            });
    }
};
export const updateJobPostings = (updatedJobs) => dispatch => {
    var _companyId = updatedJobs.id;
    if (_companyId != null) {
        database
            .collection("CompanyProfile")
            .doc(_companyId)
            .update({
                jobPostings: updatedJobs.jobPostings
            })
            .then(() => {
                dispatch({
                    type: UPDATE_JOBPOSTINGS,
                    payload: updatedJobs.jobPostings
                });
            })
            .then(() => {
                message.success('Data updated successfully');
            })
            .catch(function (error) {
                message.error('Error in data update !');
            });
    }
};
export const makeShortListed = (shortlistedStudent) => dispatch => {
    var _companyId = store.getState().company.company.id;
    if (_companyId != null) {
        database
            .collection("CompanyProfile")
            .doc(_companyId)
            .update({
                shortListedStudents: firebaseService.firestore.FieldValue.arrayUnion(shortlistedStudent)
            })
            .then(() => {
                dispatch({
                    type: MAKE_SHORTLISTED,
                    payload: shortlistedStudent
                });
            })
            .then(() => {
                message.success('Candidate has been shortlisted !');
            })
            .catch(function (error) {
                message.error('Error !! can not shortlist this candidate.');
            });
    }
};