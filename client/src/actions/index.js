import { browserHistory } from 'react-router';

import { createApiAction, createAction, createErrorAction } from '../utils/reduxActions';
import {
  CREATE_EVENT_FAIL,
  CREATE_EVENT_REQUEST,
  CREATE_EVENT_SUCCESS,
  GET_LOCAL_DATA,
  LOAD_EVENTS_FAILURE,
  LOAD_EVENTS_REQUEST,
  LOAD_EVENTS_SUCCESS,
  LOAD_EVENT_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  RECEIVE_USER_FAILURE,
  RECEIVE_USER,
  REGISTER_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REQUEST_USER
} from '../constants/reduxConstants';
import { getUserId, getUserToken } from '../reducers/userManager';
import callApi from '../utils/apiHelpers';

const loadLocalData = createAction(GET_LOCAL_DATA);

export function getLocalData() {
  const userId = Number(localStorage.userId);
  const userToken = localStorage.userToken;
  return loadLocalData({ userId, userToken });
}

const requestUser = createAction(REQUEST_USER);
const receiveUser = createAction(RECEIVE_USER);
const receiveUserFail = createErrorAction(RECEIVE_USER_FAILURE);

export function fetchUser(userid) {
  return createApiAction({
    callApi: () => callApi(`http://localhost:3000/api/Users/${userid}`),
    startAction: () => requestUser(userid),
    successAction: (res) => receiveUser(res),
    failAction: (err) => receiveUserFail(err)
  });
}

const startLoginRequest = createAction(LOGIN_REQUEST);
const loginSuccess = createAction(LOGIN_SUCCESS);
const loginFailure = createErrorAction(LOGIN_FAILURE);

export function loginRequest(email, password) {
  return createApiAction({
    callApi: () => callApi('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    startAction: startLoginRequest,
    successAction: (res) => {
      localStorage.setItem('userId', res.userId);
      localStorage.setItem('userToken', res.id);
      return loginSuccess(res);
    },
    failAction: (error) => loginFailure(error)
  });
}

const logout = createAction(LOGOUT);
export function logoutUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('userToken');
  browserHistory.push('/');
  return logout();
}

const startCreateEventRequest = createAction(CREATE_EVENT_REQUEST);
const startCreateEventSuccess = createAction(CREATE_EVENT_SUCCESS);
const createEventFail = createErrorAction(CREATE_EVENT_FAIL);

export function createEvent(formData) {
  return createApiAction({
    callApi: (state) =>
      callApi(`/api/users/${getUserId(state)}/events?access_token=${getUserToken(state)}`, {
        method: 'POST',
        body: JSON.stringify(formData),
      }),

    startAction: () => startCreateEventRequest(),
    successAction: (res) => {
      browserHistory.push(`/event/${res.id}`);
      return startCreateEventSuccess(res);
    },
    failAction: (error) => createEventFail(error)
  });
}

const startGetVolunteerEvents = createAction(LOAD_EVENTS_REQUEST);
const loadEventsFail = createErrorAction(LOAD_EVENTS_FAILURE);

const loadEventsSuccess = createAction(LOAD_EVENTS_SUCCESS);
const loadEventSuccess = createAction(LOAD_EVENT_SUCCESS);

export function loadEvents(id) {
  return createApiAction({
    callApi: () => callApi('/api/events' + (id ? '/' + id : '')),

    startAction: () => startGetVolunteerEvents(),
    successAction: (res) => {
      return id ? loadEventSuccess(res) : loadEventsSuccess(res);
    },
    failAction: (error) => loadEventsFail(error)
  });
}

export function loadEvent(id) {
  return loadEvents(id);
}

const startRegisterRequest = createAction(REGISTER_REQUEST);
const registerSuccess = createAction(REGISTER_SUCCESS);
const registerFailure = createErrorAction(REGISTER_FAILURE);

function registerSuccessAndLogin(response, email, password) {
  return dispatch => {
    dispatch(registerSuccess(response));
    dispatch(loginRequest(email, password));
  };
}

export function registerRequest(email, password, isMusician) {
  return createApiAction({
    callApi: () => callApi('/api/users', {
      method: 'POST',
      body: JSON.stringify({ isMusician, email, password })
    }),

    startAction: () => startRegisterRequest(),
    successAction: (res) => registerSuccessAndLogin(res, email, password),
    failAction: (error) => registerFailure(error)
  });
}
