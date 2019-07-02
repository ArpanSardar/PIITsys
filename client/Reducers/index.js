import { combineReducers } from 'redux';
import companyReducer from './companyReducer';
import companyUserReducer from './companyUserReducer';
import authReducer from './authReducer';
import errorReducer from './errorReducer';
import studentReducer from './studentReducer';


export default combineReducers({
    company: companyReducer,
    user: companyUserReducer,
    auth: authReducer,
    error: errorReducer,
    students: studentReducer
});