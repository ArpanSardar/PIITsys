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


const initialState = {
    userId: sessionStorage.getItem('userID'),
    isLoading: false,
    user: null
}
export default function (state = initialState, action) {
    switch (action.type) {
        case USER_LOADING:
            return {
                ...state, isLoading: !state.isLoading
            };
        case USER_LOADED:
            return {
                ...state,
                isLoading: false,
                user: action.payload
            };
        case LOGIN_SUCCESS:
        case REGISTER_SUCCESS:
            sessionStorage.setItem('userID', action.payload);
            return {
                ...state,
                isLoading: false,
                userId: action.payload
            };
        case AUTH_ERROR:
        case LOGIN_FAIL:
        case LOGOUT_SUCCESS:
        case REGISTER_FAIL:
            sessionStorage.removeItem('userID');
            sessionStorage.removeItem('accountType');
            return {
                ...state,
                userId: null,
                isLoading: false,
                user: null
            };
        default:
            return state;
    }
}