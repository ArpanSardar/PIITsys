import {
    GET_COMPANY_USER_DETAILS,
    UPDATE_COMPANY_USER_DETAILS,
    COMPANY_USER_DATA_LOADING,
    SET_COMPANY_PROFILE_COMPLETE_STATUS
} from '../Actions/types'


const initialState = {
    isLoading: true,
    user: null
}
export default function (state = initialState, action) {
    switch (action.type) {
        case GET_COMPANY_USER_DETAILS:
            return {
                ...state,
                user: action.payload,
                isLoading: true
            };
        case UPDATE_COMPANY_USER_DETAILS:
            //console.log('update user reducer called:',)
            return {
                ...state,
                isLoading: false,
                user: {
                    ...state.user,
                    name: action.payload.name,
                    email: action.payload.email,
                    phoneNumber: action.payload.phoneNumber,
                    ownProfileComplete: action.payload.ownProfileComplete
                }
            };
        case COMPANY_USER_DATA_LOADING:
            return {
                ...state, isLoading: !state.isLoading
            };
        case SET_COMPANY_PROFILE_COMPLETE_STATUS:
            return {
                ...state,
                user: {
                    ...state.user,
                    companyProfileComplete: true,
                    companyId: action.payload
                }
            };
        default:
            return state;
    }
}