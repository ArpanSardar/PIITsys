import {
    GET_ALL_STUDENTS
} from '../Actions/types'

const initialState = {
    allStudents: [],
    loading: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_ALL_STUDENTS:
            return {
                ...state,
                allStudents: action.payload,
                loading: false
            };
        default:
            return state;
    }
}