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
} from '../Actions/types'

const initialState = {
    company: {},
    newJob: null,
    loading: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case GET_COMPANY_DETAILS:
            return {
                ...state,
                company: action.payload,
                loading: false
            };
        case ADD_COMPANY_DETAILS:
            return {
                ...state,
                company: action.payload
            };
        case UPDATE_COMPANY_DETAILS:
            return {
                ...state,
                company: {
                    ...state.company,
                    name: action.payload.name,
                    email: action.payload.email,
                    description: action.payload.description,
                    do: action.payload.do,
                    website: action.payload.website,
                    address: action.payload.address,
                    founder: action.payload.founder,
                    size: action.payload.size,
                    industry: action.payload.industry,
                    //logo: action.payload.logo
                }
            };
        case ADD_JOBPOSTINGS:
            var posts = state.company.jobPostings;
            posts.push(action.payload);
            return {
                ...state,
                company: {
                    ...state.company,
                    jobPostings: posts
                },
                newJob: action.payload
            };
        case DELETE_JOBPOSTINGS:
            return {
                ...state,
                company: {
                    ...state.company,
                    jobPostings: action.payload
                }
            };
        case UPDATE_JOBPOSTINGS:
            return {
                ...state,
                company: {
                    ...state.company,
                    jobPostings: action.payload
                }
            };
        case MAKE_SHORTLISTED:
            var shortListed = state.company.shortListedStudents;
            shortListed.push(action.payload);
            return {
                ...state,
                company: {
                    ...state.company,
                    shortListedStudents: shortListed
                }
            };
        case DATA_LOADING:
            return {
                ...state,
                loading: true
            };
        default:
            return state;
    }
}